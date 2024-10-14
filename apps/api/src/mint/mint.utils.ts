import {
  bn,
  deriveAddress,
  hashToBn254FieldSizeBe,
  LightSystemProgram,
  Rpc,
} from "@lightprotocol/stateless.js";
import { PublicKey } from "@solana/web3.js";
import { PROGRAM_ID } from "@zk-nft/program";
import { Buffer } from "buffer";
import { HTTPException } from "hono/http-exception";
import { BACKOFF_OPTIONS } from "../common/constants";
import { backOff } from "exponential-backoff";

export const generateRandomJsonNumber = (): number => {
  return Math.floor(Math.random() * 5000);
};

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
      ...Buffer.from("mint_record"),
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
          "Wallet has already minted a zkNFT. Please use a different wallet.",
      });
    }

    throw error;
  }
};
