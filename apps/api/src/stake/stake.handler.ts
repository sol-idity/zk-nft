import {
  bn,
  CompressedAccountWithMerkleContext,
  defaultStaticAccountsStruct,
  defaultTestStateTreeAccounts,
  deriveAddress,
  hashToBn254FieldSizeBe,
  LightSystemProgram,
  NewAddressParams,
  packCompressedAccounts,
  packNewAddressParams,
} from "@lightprotocol/stateless.js";
import { getAppHono } from "../common/utils/get-app-hono.util";
import {
  getStakeProgram,
  getZkNftProgram,
} from "../common/utils/get-programs.util";
import { Keypair, PublicKey } from "@solana/web3.js";
import * as borsh from "borsh";
import { assetSchemaV1 } from "@zk-nft/program";
import { HTTPException } from "hono/http-exception";
import { Buffer } from "buffer";
import { buildTxFromIxs } from "../common/utils/build-tx-from-ixs.util";
import { stakeRoute } from "./stake.route";
import { backOff } from "exponential-backoff";
import { BACKOFF_OPTIONS } from "../common/constants";
import { cloudflareRateLimiter } from "@hono-rate-limiter/cloudflare";
import { Bindings } from "../common/types/bindings";

const app = getAppHono();

app.use(
  stakeRoute.getRoutingPath(),
  cloudflareRateLimiter<{
    Bindings: Bindings;
  }>({
    rateLimitBinding: (c) => c.env.STAKE_RATE_LIMITER,
    keyGenerator: (c) => c.req.header("cf-connecting-ip") ?? "",
  })
);
app.openapi(stakeRoute, async (c) => {
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

  const assetProof = await backOff(
    () =>
      rpc.getValidityProofV0([
        {
          hash: bn(Uint8Array.from(assetAccount.hash)),
          tree: addressTree,
          queue: addressQueue,
        },
      ]),
    BACKOFF_OPTIONS
  );
  const pluginProof = await backOff(
    () =>
      rpc.getValidityProofV0(
        freezeDelegateAccount
          ? [
              {
                hash: bn(Uint8Array.from(freezeDelegateAccount.hash)),
                tree: addressTree,
                queue: addressQueue,
              },
            ]
          : undefined,
        !freezeDelegateAccount
          ? [
              {
                address: bn(
                  Uint8Array.from(freezeDelegateAccountAddress.toBytes())
                ),
                tree: addressTree,
                queue: addressQueue,
              },
            ]
          : undefined
      ),
    BACKOFF_OPTIONS
  );

  const newAddressParams: NewAddressParams = {
    seed: freezeDelegateAccountSeed[0],
    addressMerkleTreeRootIndex: pluginProof.rootIndices[0],
    addressMerkleTreePubkey: addressTree,
    addressQueuePubkey: pluginProof.nullifierQueues[0],
  };
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
  const outputCompressedAccounts =
    LightSystemProgram.createNewAddressOutputState(
      Array.from(freezeDelegateAccountAddress.toBytes()),
      program.programId
    );
  const {
    packedInputCompressedAccounts,
    remainingAccounts: _remainingAccounts,
  } = packCompressedAccounts(
    [inputCompressedAccount],
    assetProof.rootIndices,
    outputCompressedAccounts
  );
  const { newAddressParamsPacked, remainingAccounts } = packNewAddressParams(
    [newAddressParams],
    _remainingAccounts
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

  const updateAuthority = Keypair.fromSecretKey(
    Uint8Array.from(JSON.parse(c.env.UPDATE_AUTHORITY_KEYPAIR))
  );
  const freezeDelegate = PublicKey.findProgramAddressSync(
    [Buffer.from("freeze_delegate"), updateAuthority.publicKey.toBytes()],
    stakeProgram.programId
  )[0];

  const ix = await stakeProgram.methods
    .stake(
      {
        a: assetProof.compressedProof.a,
        b: assetProof.compressedProof.b,
        c: assetProof.compressedProof.c,
      },
      {
        a: pluginProof.compressedProof.a,
        b: pluginProof.compressedProof.b,
        c: pluginProof.compressedProof.c,
      },
      freezeDelegateAccount?.data
        ? {
            initializedAddress: {
              "0": Buffer.from(
                Uint8Array.from(
                  freezeDelegateAccount.data.dataHash.slice().reverse()
                )
              ),
            },
          }
        : {
            uninitializedAddress: {
              "0": newAddressParamsPacked[0].addressMerkleTreeRootIndex,
            },
          },
      {
        merkleTreePubkeyIndex:
          packedInputCompressedAccounts[0].merkleContext.merkleTreePubkeyIndex,
        nullifierQueuePubkeyIndex:
          packedInputCompressedAccounts[0].merkleContext
            .nullifierQueuePubkeyIndex,
      },
      {
        addressMerkleTreePubkeyIndex:
          newAddressParamsPacked[0].addressMerkleTreeAccountIndex,
        addressQueuePubkeyIndex:
          newAddressParamsPacked[0].addressQueueAccountIndex,
      },
      packedInputCompressedAccounts[0].rootIndex,
      assetAccount.leafIndex,
      freezeDelegateAccount ? freezeDelegateAccount.leafIndex : 0,
      {
        assetId: assetAccount.address,
        initializedPlugins: decodedAsset.initializedPlugins,
        key: decodedAsset.key,
      }
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
