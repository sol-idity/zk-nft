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
import { getAppHono } from "../../common/utils/get-app-hono.util";
import { getZkNftProgram } from "../../common/utils/get-programs.util";
import { mintRoute } from "./mint.route";
import { Keypair, PublicKey } from "@solana/web3.js";
import { Buffer } from "buffer";
import { HTTPException } from "hono/http-exception";
import { buildTxFromIxs } from "../../common/utils/build-tx-from-ixs.util";

const app = getAppHono();

app.openapi(mintRoute, async (c) => {
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
    Buffer.from([2, ...program.programId.toBytes(), ...assetAddress.toBytes()])
  );
  if (!metadataSeed) {
    throw new HTTPException(500, {
      message: "Failed to derive metadata address",
    });
  }
  const metadataAddress = await deriveAddress(metadataSeed[0], addressTree);

  const proof = await rpc.getValidityProofV0(undefined, [
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
  ]);

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
  const metadataUri = `https://files.tinys.pl/zkN5FTcJzrwp2c9G4fL3qXo9tnVhiACG3xzoP3tV3Hh/${generateRandomJsonNumber()}.json`;

  const ix = await program.methods
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

  const { transaction, blockhash, lastValidBlockHeight } = await buildTxFromIxs(
    {
      ixs: [ix],
      rpc,
      payer: new PublicKey(recipient),
      additionalSigners: [updateAuthority],
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

const generateRandomJsonNumber = (): number => {
  return Math.floor(Math.random() * 5000);
};

export default app;
