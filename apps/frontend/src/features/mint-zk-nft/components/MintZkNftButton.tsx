import { Button } from "@/shadcn/components/ui/button";
import { useCallback, useState } from "react";
import { Loader2 } from "lucide-react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { SendTransactionError, VersionedTransaction } from "@solana/web3.js";
import { toast } from "sonner";

import { SDK } from "@/common/constants";
import { isAxiosError } from "axios";
import { useUserBaseAssets } from "@/features/zk-nft-holdings/hooks/useUserBaseAssets";
import { backOff } from "exponential-backoff";

export const MintZkNftButton = () => {
  const { publicKey, signTransaction } = useWallet();
  const { mutate } = useUserBaseAssets(publicKey?.toBase58());
  const { connection } = useConnection();
  const [isMinting, setIsMinting] = useState(false);
  const onClick = useCallback(async () => {
    if (!publicKey || !signTransaction) {
      return;
    }

    try {
      setIsMinting(true);

      const { data } = await backOff(
        async () =>
          SDK.mintPost({
            recipient: publicKey.toBase58(),
          }),
        {
          startingDelay: 3000,
          numOfAttempts: 3,
          retry: (error) => {
            if (isAxiosError(error)) {
              const errorMessage = error.response?.data?.message;
              const statusCode = error.response?.status;
              if (
                statusCode === 403 ||
                statusCode === 409 ||
                statusCode === 429 ||
                errorMessage.startsWith("Transaction simulation failed:")
              ) {
                return false;
              }
            }

            return true;
          },
        }
      );

      const tx = VersionedTransaction.deserialize(
        Buffer.from(data.base64EncodedTransaction, "base64")
      );
      const signedTx = await signTransaction(tx as any);
      const txSig = await connection.sendTransaction(signedTx);
      const confirmedTx = await connection.confirmTransaction({
        blockhash: data.blockhash,
        lastValidBlockHeight: data.lastValidBlockHeight,
        signature: txSig,
      });
      if (confirmedTx.value.err) {
        throw new Error(JSON.stringify(confirmedTx.value.err, null, 2));
      }

      await new Promise((resolve) => setTimeout(resolve, 1000));
      mutate();
      toast.success("Mint successful!");
    } catch (error) {
      if (isAxiosError(error)) {
        const errorMessage = error.response?.data?.message;
        const responseBody = error.response?.data;
        toast.error(errorMessage ?? responseBody);
      } else if (error instanceof SendTransactionError) {
        toast.error(await error.getLogs(connection));
      } else if (error instanceof Error) {
        toast.error(error.message);
      }
    } finally {
      setIsMinting(false);
    }
  }, []);

  return (
    <Button
      size="lg"
      className="text-lg font-bold"
      disabled={isMinting}
      onClick={onClick}
    >
      {isMinting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {!isMinting ? "Mint your zkNFT" : "Minting..."}
    </Button>
  );
};
