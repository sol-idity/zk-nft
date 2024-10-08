import { useConnection } from "@solana/wallet-adapter-react";
import bs58 from "bs58";
import useSWRImmutable from "swr/immutable";

export const useBlobTxSigContents = (blobTxSig: string | undefined) => {
  const { connection } = useConnection();
  const swr = useSWRImmutable(
    !blobTxSig
      ? null
      : ["blobTxSigContents", connection.rpcEndpoint, blobTxSig],
    async ([, , blobTxSig]) => {
      const tx = await connection.getTransaction(blobTxSig, {
        maxSupportedTransactionVersion: 0,
      });

      if (!tx) {
        return null;
      }

      const noopProgramIdIndex =
        tx.transaction.message.staticAccountKeys.findIndex(
          (accountKey) =>
            accountKey.toBase58() ===
            "noopb9bkMVfRPU8AsbpTUg8AQkHtKwMYZiFUjNRtMmV"
        );

      if (noopProgramIdIndex === -1) {
        return null;
      }

      const logIxsData = tx.meta?.innerInstructions
        ?.at(0)
        ?.instructions?.filter((ix) => ix.programIdIndex === noopProgramIdIndex)
        ?.flatMap((ix) => Array.from(bs58.decode(ix.data)));

      if (!logIxsData) {
        return null;
      }

      const data = Buffer.from(Uint8Array.from(logIxsData)).toString();
      const parsedData: {
        name: string;
        image: string;
        description: string;
        attributes: { trait_type: string; value: string }[];
      } = JSON.parse(data);

      return parsedData;
    }
  );

  return swr;
};
