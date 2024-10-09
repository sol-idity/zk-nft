import { Rpc } from "@lightprotocol/stateless.js";
import {
  ComputeBudgetProgram,
  Keypair,
  PublicKey,
  TransactionInstruction,
  TransactionMessage,
  VersionedTransaction,
} from "@solana/web3.js";
import { getPriorityFees } from "./get-priority-fees.util";

export const LOOKUP_TABLE_ADDRESS = // new PublicKey("Dh74qoNrgMYzk4ZFZenKS2f9gSA9AqXrcgYzyBia1r3W") // prod lookup table
  new PublicKey("DrN7o6QST1mMAfNiVLXSSghuiawp4CYdYSzWR8PnP9Gj"); // dev lookup table

export const buildTxFromIxs = async ({
  rpc,
  ixs,
  payer,
  skipPreflight,
  additionalSigners,
}: {
  ixs: TransactionInstruction[];
  rpc: Rpc;
  payer: PublicKey;
  skipPreflight?: boolean;
  additionalSigners?: Keypair[];
}) => {
  const lookupTableAccount = (
    await rpc.getAddressLookupTable(LOOKUP_TABLE_ADDRESS)
  ).value;

  const BLOCKHASH_RETRIES = 5;
  for (let i = 0; i < BLOCKHASH_RETRIES; i++) {
    const { blockhash, lastValidBlockHeight } =
      await rpc.getLatestBlockhash("confirmed");

    const messageV0 = new TransactionMessage({
      payerKey: payer,
      recentBlockhash: blockhash,
      instructions: [
        ComputeBudgetProgram.setComputeUnitLimit({
          units: 1_400_000,
        }),
        ...ixs,
      ],
    }).compileToV0Message(
      lookupTableAccount ? [lookupTableAccount] : undefined
    );

    const transaction = new VersionedTransaction(messageV0);

    const {
      value: { err, unitsConsumed, logs },
    } = await rpc.simulateTransaction(transaction, {
      sigVerify: false,
      commitment: "confirmed",
    });

    if (JSON.stringify(err).includes("BlockhashNotFound")) {
      // Retry if blockhash is not found
      await new Promise((resolve) => setTimeout(resolve, 100));
      continue;
    }

    if (err && !skipPreflight) {
      const error = !logs?.length ? err.toString() : JSON.stringify(logs);
      throw new Error(`Transaction simulation failed: ${error}`);
    }

    const computeUnitLimit =
      unitsConsumed === undefined || skipPreflight
        ? 1_400_000
        : Math.min(Math.ceil(unitsConsumed * 1.1), 1_400_000);

    const priorityFees = await getPriorityFees(rpc);
    const messageWithComputeUnitLimit = new TransactionMessage({
      payerKey: payer,
      recentBlockhash: blockhash,
      instructions: [
        ComputeBudgetProgram.setComputeUnitLimit({
          units: Math.ceil(computeUnitLimit),
        }),
        ComputeBudgetProgram.setComputeUnitPrice({
          microLamports: Math.ceil(priorityFees.medium),
        }),
        ...ixs,
      ],
    }).compileToV0Message(
      lookupTableAccount ? [lookupTableAccount] : undefined
    );
    const transactionWithComputeUnitLimit = new VersionedTransaction(
      messageWithComputeUnitLimit
    );
    if (additionalSigners) {
      transactionWithComputeUnitLimit.sign(additionalSigners);
    }

    return {
      transaction: transactionWithComputeUnitLimit,
      blockhash,
      lastValidBlockHeight,
    };
  }

  throw new Error("Failed to get valid blockhash, please try again.");
};
