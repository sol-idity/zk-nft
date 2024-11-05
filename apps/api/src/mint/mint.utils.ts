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
  Rpc,
} from "@lightprotocol/stateless.js";
import { Keypair, PublicKey } from "@solana/web3.js";
import { PROGRAM_ID } from "@zk-nft/program";
import { Buffer } from "buffer";
import { HTTPException } from "hono/http-exception";
import { BACKOFF_OPTIONS } from "../common/constants";
import { backOff } from "exponential-backoff";
import { getZkNftProgram } from "../common/utils/get-programs.util";
import { buildTxFromIxs } from "../common/utils/build-tx-from-ixs.util";

export const createMintRecordAddress = async ({
  recipient,
  addressMerkleTreePubkey,
  addressQueuePubkey,
  rpc,
  updateAuthority,
}: {
  recipient: string;
  addressMerkleTreePubkey: PublicKey;
  addressQueuePubkey: PublicKey;
  rpc: Rpc;
  updateAuthority: PublicKey;
}) => {
  const mintRecordSeed = await hashToBn254FieldSizeBe(
    Buffer.from([
      // ...Buffer.from("mint_record"),
      ...Buffer.from("mint_record_2"),
      ...new PublicKey(PROGRAM_ID).toBytes(),
      ...updateAuthority.toBytes(),
      ...new PublicKey(recipient).toBytes(),
    ])
  );
  if (!mintRecordSeed) {
    throw new HTTPException(500, {
      message: "Failed to derive mint record address",
    });
  }
  const mintRecordAddress = await deriveAddress(
    mintRecordSeed[0],
    addressMerkleTreePubkey
  );

  try {
    const proof = await backOff(
      () =>
        rpc.getValidityProofV0(undefined, [
          {
            address: bn(mintRecordAddress.toBytes()),
            tree: addressMerkleTreePubkey,
            queue: addressQueuePubkey,
          },
        ]),
      {
        ...BACKOFF_OPTIONS,
        retry(error) {
          if (
            error instanceof Error &&
            error.message.includes(
              "failed to get ValidityProof for compressed accounts"
            )
          ) {
            return false;
          }
          return true;
        },
      }
    );

    return LightSystemProgram.createAccount({
      payer: new PublicKey(recipient),
      newAddressParams: {
        addressMerkleTreePubkey,
        addressQueuePubkey,
        addressMerkleTreeRootIndex: proof.rootIndices[0],
        seed: mintRecordSeed[0],
      },
      newAddress: Array.from(mintRecordAddress.toBytes()),
      recentValidityProof: proof.compressedProof,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes(
        "failed to get ValidityProof for compressed accounts"
      )
    ) {
      throw new HTTPException(409, {
        message:
          "Wallet has already minted a zkNFT.",
      });
    }

    throw error;
  }
};

export const buildMintTx = async ({
  recipient,
  rpc,
  updateAuthority,
  nftId,
}: {
  recipient: string;
  rpc: Rpc;
  updateAuthority: Keypair;
  nftId: number;
}) => {
  try {
    const program = getZkNftProgram(rpc);

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
    const metadataUri = `https://files.tinys.pl/${updateAuthority.publicKey.toBase58()}/${nftId}.json`;

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

    return {
      base64EncodedTransaction: Buffer.from(transaction.serialize()).toString(
        "base64"
      ),
      blockhash,
      lastValidBlockHeight,
    };
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes(
        '"Program SySTEM1eSU2p4BGQfQpimFEWWSC1XDFeun3Nqzz3rT7 invoke [1]","Program log: Instruction: Invoke","Program compr6CUsB5m2jS4Y3831ztGSTnDpnKJTKS95d64XVq invoke [2]","Program log: Instruction: InsertAddresses","Program log: ProgramError occurred. Error Code: Custom(9002).'
      )
    ) {
      throw new HTTPException(409, {
        message:
          "Wallet has already minted a zkNFT.",
      });
    }

    throw error;
  }
};
