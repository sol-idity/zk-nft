import {
  bn,
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
import { getZkNftProgram } from "../common/utils/get-programs.util";
import { mintRoute } from "./mint.route";
import { Keypair, PublicKey } from "@solana/web3.js";
import { Buffer } from "buffer";
import { HTTPException } from "hono/http-exception";
import { buildTxFromIxs } from "../common/utils/build-tx-from-ixs.util";
import {
  createMintRecordAddress,
  generateRandomJsonNumber,
} from "./mint.utils";
import { checkMintEligibility } from "./mint.middleware";
import { backOff } from "exponential-backoff";
import { BACKOFF_OPTIONS } from "../common/constants";
import { cloudflareRateLimiter } from "@hono-rate-limiter/cloudflare";
import { Bindings } from "../common/types/bindings";

const app = getAppHono();

app.use(
  mintRoute.getRoutingPath(),
  cloudflareRateLimiter<{
    Bindings: Bindings;
  }>({
    rateLimitBinding: (c) => c.env.MINT_RATE_LIMITER,
    keyGenerator: (c) => c.req.header("cf-connecting-ip") ?? "",
  })
);
app.use(mintRoute.getRoutingPath(), checkMintEligibility);
app.openapi(mintRoute, async (c) => {
  try {
    const rpc = c.get("rpc");
    const program = getZkNftProgram(rpc);

    const { recipient } = c.req.valid("json");

    const addressTree = defaultTestStateTreeAccounts().addressTree;
    const addressQueue = defaultTestStateTreeAccounts().addressQueue;

    const randomBytes = Keypair.generate().publicKey.toBytes();
    const assetSeed = await hashToBn254FieldSizeBe(
      Buffer.from([1, ...program.programId.toBytes(), ...randomBytes])
    );
    if (!assetSeed) {
      throw new HTTPException(500, {
        message: "Failed to derive asset address",
      });
    }
    const assetAddress = await deriveAddress(assetSeed[0], addressTree);

    const metadataSeed = await hashToBn254FieldSizeBe(
      Buffer.from([
        2,
        ...program.programId.toBytes(),
        ...assetAddress.toBytes(),
      ])
    );
    if (!metadataSeed) {
      throw new HTTPException(500, {
        message: "Failed to derive metadata address",
      });
    }
    const metadataAddress = await deriveAddress(metadataSeed[0], addressTree);

    const proof = await backOff(
      () =>
        rpc.getValidityProofV0(undefined, [
          {
            address: bn(assetAddress.toBytes()),
            tree: addressTree,
            queue: addressQueue,
          },
          {
            address: bn(metadataAddress.toBytes()),
            tree: addressTree,
            queue: addressQueue,
          },
        ]),
      BACKOFF_OPTIONS
    );

    const newAddressParams: NewAddressParams = {
      seed: assetSeed[0],
      addressMerkleTreeRootIndex: proof.rootIndices[0],
      addressMerkleTreePubkey: proof.merkleTrees[0],
      addressQueuePubkey: proof.nullifierQueues[0],
    };
    const outputCompressedAccounts =
      LightSystemProgram.createNewAddressOutputState(
        Array.from(assetAddress.toBytes()),
        program.programId
      );
    const { remainingAccounts: _remainingAccounts } = packCompressedAccounts(
      [],
      [],
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
    const updateAuthority = Keypair.fromSecretKey(
      Uint8Array.from(JSON.parse(c.env.UPDATE_AUTHORITY_KEYPAIR))
    );
    const metadataUri = `https://files.tinys.pl/${updateAuthority.publicKey.toBase58()}/${generateRandomJsonNumber()}.json`;

    const mintIx = await program.methods
      .createAsset(
        {
          a: proof.compressedProof.a,
          b: proof.compressedProof.b,
          c: proof.compressedProof.c,
        },
        newAddressParamsPacked[0].addressMerkleTreeRootIndex,
        Array.from(randomBytes),
        0,
        {
          offChain: {
            0: metadataUri,
          },
        }
      )
      .accounts({
        payer: recipient,
        updateAuthority: updateAuthority.publicKey,
        owner: recipient,
        cpiAuthorityPda: PublicKey.findProgramAddressSync(
          [Buffer.from("cpi_authority")],
          program.programId
        )[0],
        selfProgram: program.programId,
        lightSystemProgram: LightSystemProgram.programId,
        accountCompressionAuthority,
        accountCompressionProgram,
        noopProgram,
        registeredProgramPda,
      })
      .remainingAccounts(
        remainingAccounts.map((account) => ({
          pubkey: account,
          isSigner: false,
          isWritable: true,
        }))
      )
      .instruction();

    const createMintRecordIx = await createMintRecordAddress({
      recipient,
      addressMerkleTreePubkey: addressTree,
      addressQueuePubkey: addressQueue,
      rpc,
      updateAuthority: updateAuthority.publicKey,
    });

    const { transaction, blockhash, lastValidBlockHeight } =
      await buildTxFromIxs({
        ixs: [createMintRecordIx, mintIx],
        rpc,
        payer: new PublicKey(recipient),
        additionalSigners: [updateAuthority],
      });

    return c.json({
      base64EncodedTransaction: Buffer.from(transaction.serialize()).toString(
        "base64"
      ),
      blockhash,
      lastValidBlockHeight,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes(
        '"Program SySTEM1eSU2p4BGQfQpimFEWWSC1XDFeun3Nqzz3rT7 invoke [1]","Program log: Instruction: Invoke","Program compr6CUsB5m2jS4Y3831ztGSTnDpnKJTKS95d64XVq invoke [2]","Program log: Instruction: InsertAddresses","Program log: ProgramError occurred. Error Code: Custom(9002).'
      )
    ) {
      throw new HTTPException(409, {
        message:
          "Wallet has already minted a zkNFT. Please use a different wallet.",
      });
    }

    throw error;
  }
});

export default app;
