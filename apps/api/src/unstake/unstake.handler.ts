import {
  bn,
  CompressedAccountWithMerkleContext,
  defaultStaticAccountsStruct,
  defaultTestStateTreeAccounts,
  deriveAddress,
  hashToBn254FieldSizeBe,
  LightSystemProgram,
  packCompressedAccounts,
} from "@lightprotocol/stateless.js";
import { getAppHono } from "../common/utils/get-app-hono.util";
import {
  getStakeProgram,
  getZkNftProgram,
} from "../common/utils/get-programs.util";
import { Keypair, PublicKey } from "@solana/web3.js";
import * as borsh from "borsh";
import { assetSchemaV1, stakeRecordSchemaV1 } from "@zk-nft/program";
import { HTTPException } from "hono/http-exception";
import { Buffer } from "buffer";
import { buildTxFromIxs } from "../common/utils/build-tx-from-ixs.util";
import { unstakeRoute } from "./unstake.route";
import { BN } from "@coral-xyz/anchor";
import { backOff } from "exponential-backoff";
import { BACKOFF_OPTIONS } from "../common/constants";
import { cloudflareRateLimiter } from "@hono-rate-limiter/cloudflare";
import { Bindings } from "../common/types/bindings";

const app = getAppHono();

app.use(
  unstakeRoute.getRoutingPath(),
  cloudflareRateLimiter<{
    Bindings: Bindings;
  }>({
    rateLimitBinding: (c) => c.env.STAKE_RATE_LIMITER,
    keyGenerator: (c) => c.req.header("cf-connecting-ip") ?? "",
  })
);
app.openapi(unstakeRoute, async (c) => {
  const rpc = c.get("rpc");
  const program = getZkNftProgram(rpc);
  const stakeProgram = getStakeProgram(rpc);

  const { owner, assetId } = c.req.valid("json");

  const addressTree = defaultTestStateTreeAccounts().addressTree;
  const addressQueue = defaultTestStateTreeAccounts().addressQueue;
  const merkleTree = defaultTestStateTreeAccounts().merkleTree;
  const nullifierQueue = defaultTestStateTreeAccounts().nullifierQueue;

  const assetAccount = await rpc.getCompressedAccount(
    bn(new PublicKey(assetId).toBytes())
  );
  if (!assetAccount?.data || !assetAccount.address) {
    throw new HTTPException(404, {
      message: "Asset not found",
    });
  }

  const freezeDelegateAccountSeed = await hashToBn254FieldSizeBe(
    Buffer.from([
      4,
      ...program.programId.toBytes(),
      ...Uint8Array.from(assetAccount.address),
    ])
  );
  if (!freezeDelegateAccountSeed) {
    throw new HTTPException(500, {
      message: "Failed to derive freeze delegate account address",
    });
  }
  const freezeDelegateAccountAddress = await deriveAddress(
    freezeDelegateAccountSeed[0],
    addressTree
  );
  const freezeDelegateAccount = await rpc.getCompressedAccount(
    bn(freezeDelegateAccountAddress.toBytes())
  );
  if (!freezeDelegateAccount) {
    throw new HTTPException(404, {
      message: "Freeze delegate account not found",
    });
  }

  const stakeRecordAccount = (
    await rpc.getCompressedAccountsByOwner(stakeProgram.programId, {
      filters: [
        {
          memcmp: {
            bytes: assetId,
            offset: 0,
          },
        },
      ],
      limit: new BN(1),
    })
  ).items[0];
  if (!stakeRecordAccount?.data) {
    throw new HTTPException(404, {
      message: "Stake record account not found",
    });
  }

  const stakeRecordProof = await backOff(
    () =>
      rpc.getValidityProofV0([
        {
          hash: bn(Uint8Array.from(stakeRecordAccount.hash)),
          tree: addressTree,
          queue: addressQueue,
        },
      ]),
    BACKOFF_OPTIONS
  );
  const pluginProof = await backOff(
    () =>
      rpc.getValidityProofV0([
        {
          hash: bn(Uint8Array.from(freezeDelegateAccount.hash)),
          tree: addressTree,
          queue: addressQueue,
        },
        {
          hash: bn(Uint8Array.from(assetAccount.hash)),
          tree: addressTree,
          queue: addressQueue,
        },
      ]),
    BACKOFF_OPTIONS
  );

  const inputCompressedAccount: CompressedAccountWithMerkleContext = {
    merkleTree,
    nullifierQueue,
    hash: assetAccount.hash,
    leafIndex: assetAccount.leafIndex,
    readOnly: false,
    owner: assetAccount.owner,
    lamports: assetAccount.lamports,
    address: assetAccount.address,
    data: assetAccount.data,
  };
  const { packedInputCompressedAccounts, remainingAccounts } =
    packCompressedAccounts(
      [inputCompressedAccount],
      pluginProof.rootIndices,
      []
    );

  const {
    accountCompressionAuthority,
    noopProgram,
    registeredProgramPda,
    accountCompressionProgram,
  } = defaultStaticAccountsStruct();

  const decodedAsset: any = borsh.deserialize(
    assetSchemaV1,
    assetAccount.data.data
  );
  const decodedStakeRecord: any = borsh.deserialize(
    stakeRecordSchemaV1,
    stakeRecordAccount.data.data
  );

  const updateAuthority = Keypair.fromSecretKey(
    Uint8Array.from(JSON.parse(c.env.UPDATE_AUTHORITY_KEYPAIR))
  );
  const freezeDelegate = PublicKey.findProgramAddressSync(
    [Buffer.from("freeze_delegate"), updateAuthority.publicKey.toBytes()],
    stakeProgram.programId
  )[0];

  const ix = await stakeProgram.methods
    .unstake(
      {
        a: stakeRecordProof.compressedProof.a,
        b: stakeRecordProof.compressedProof.b,
        c: stakeRecordProof.compressedProof.c,
      },
      {
        a: pluginProof.compressedProof.a,
        b: pluginProof.compressedProof.b,
        c: pluginProof.compressedProof.c,
      },
      {
        merkleTreePubkeyIndex:
          packedInputCompressedAccounts[0].merkleContext.merkleTreePubkeyIndex,
        nullifierQueuePubkeyIndex:
          packedInputCompressedAccounts[0].merkleContext
            .nullifierQueuePubkeyIndex,
      },
      stakeRecordProof.rootIndices[0],
      stakeRecordAccount.leafIndex,
      assetAccount.leafIndex,
      freezeDelegateAccount.leafIndex,
      new BN(decodedStakeRecord.startTime),
      assetAccount.address,
      1,
      decodedAsset.initializedPlugins
    )
    .accounts({
      payer: owner,
      updateAuthority: new PublicKey(
        Uint8Array.from(decodedAsset.updateAuthority)
      ),
      owner,
      cpiAuthorityPda: PublicKey.findProgramAddressSync(
        [Buffer.from("cpi_authority")],
        stakeProgram.programId
      )[0],
      selfProgram: stakeProgram.programId,
      zkNftProgram: program.programId,
      noopProgram,
      registeredProgramPda,
      lightSystemProgram: LightSystemProgram.programId,
      zkNftCpiAuthorityPda: PublicKey.findProgramAddressSync(
        [Buffer.from("cpi_authority")],
        program.programId
      )[0],
      accountCompressionProgram,
      accountCompressionAuthority,
      freezeDelegate,
    })
    .remainingAccounts(
      remainingAccounts.map((account) => ({
        pubkey: account,
        isSigner: false,
        isWritable: true,
      }))
    )
    .instruction();

  const { transaction, blockhash, lastValidBlockHeight } = await buildTxFromIxs(
    {
      ixs: [ix],
      rpc,
      payer: new PublicKey(owner),
    }
  );

  return c.json({
    base64EncodedTransaction: Buffer.from(transaction.serialize()).toString(
      "base64"
    ),
    blockhash,
    lastValidBlockHeight,
  });
});

export default app;
