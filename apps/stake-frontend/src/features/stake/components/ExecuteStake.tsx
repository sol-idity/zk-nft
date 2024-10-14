import { CheckIcon, Cross1Icon } from "@radix-ui/react-icons";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { VersionedTransaction } from "@solana/web3.js";
import { isAxiosError } from "axios";
import encode from "bs58";
import { backOff } from "exponential-backoff";
import React, { useCallback, useState } from "react";

import { BlinkingDots } from "@/components/common/Loading";
import Typography from "@/components/common/Typography";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { SDK } from "@/lib/constants";
import { getStakeStatusFromMintItem } from "@/lib/stake";
import { cn, wait } from "@/lib/utils";
import { MintItem } from "@/types/resources";

import { useStakeRecord } from "../hooks/useAssets";

interface ExecuteStakeProps {
  mintItem: MintItem;
}

export default function ExecuteStake({ mintItem }: ExecuteStakeProps) {
  const { connection } = useConnection();
  const { publicKey, signTransaction } = useWallet();
  const { toast } = useToast();
  const { isStaked } = getStakeStatusFromMintItem(mintItem);
  const { refetch } = useStakeRecord(mintItem.mint);

  const [loading, setLoading] = useState(false);

  const handleClick = useCallback(async () => {
    console.log({ publicKey: publicKey?.toBase58() });
    if (!signTransaction || !publicKey || !connection) return;

    const { isStaked } = getStakeStatusFromMintItem(mintItem);

    const { update, dismiss, id } = toast({
      title: "Preparing Transaction",
      description: (
        <ToastDescriptionRoot>
          <Typography>Fetching transaction</Typography>
          <BlinkingDots />
        </ToastDescriptionRoot>
      ),
      duration: Infinity,
    });

    let done = false;
    try {
      setLoading(true);

      const { data } = await backOff(
        async () => {
          return isStaked
            ? await SDK.unstakePost({
                assetId: mintItem.mint,
                owner: publicKey.toBase58(),
              })
            : await SDK.stakePost({
                assetId: mintItem.mint,
                owner: publicKey.toBase58(),
              });
        },
        {
          startingDelay: 3000,
          numOfAttempts: 3,
          retry: (error) => {
            if (isAxiosError(error)) {
              const errorMessage = error.response?.data?.message;
              if (
                error.status === 429 ||
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

      // sign tx
      update({
        id,
        title: "Waiting For Wallet To Sign Transaction",
        description: (
          <ToastDescriptionRoot>
            <Typography>Pending wallet to sign</Typography>
            <BlinkingDots />
          </ToastDescriptionRoot>
        ),
      });
      // await wait(3); // TODO: remove this, mocking sign tx
      const signedTx = await signTransaction(tx);
      const signature = signedTx.signatures[0];
      const txId = encode.encode(signature);

      // send tx
      // await wait(5); // TODO: remove this, mocking send tx
      update({
        id,
        title: "Processing Transaction",
        description: (
          <ToastDescriptionRoot>
            <a
              href={`https://solscan.io/tx/${txId}`}
              target="_blank"
              rel="noreferrer noopener"
              className="underline"
            >
              View transaction
            </a>
            <BlinkingDots />
          </ToastDescriptionRoot>
        ),
      });
      (async () => {
        while (!done) {
          connection.sendTransaction(signedTx, {
            maxRetries: 1,
            preflightCommitment: "confirmed",
            skipPreflight: true,
          });
          await new Promise((resolve) => setTimeout(resolve, 5000));
        }
      })();

      // confirm tx
      const confirmedResult = await connection.confirmTransaction({
        blockhash: data.blockhash,
        lastValidBlockHeight: data.lastValidBlockHeight,
        signature: txId,
      });
      if (confirmedResult.value.err) {
        throw new Error(JSON.stringify(confirmedResult.value.err));
      }

      update({
        id,
        title: "Transaction Confirmed",
        description: (
          <ToastDescriptionRoot>
            <a
              href={`https://solscan.io/tx/${txId}`}
              target="_blank"
              rel="noreferrer noopener"
              className="underline"
            >
              View transaction
            </a>
            <CheckIcon />
          </ToastDescriptionRoot>
        ),
      });
    } catch (e) {
      const errorMessage = isAxiosError(e)
        ? e.response?.data?.message ?? e.response?.data ?? e.message
        : e instanceof Error
          ? e.message
          : "Something went wrong, Please try again.";
      update({
        id,
        title: "Transaction Failed",
        description: (
          <ToastDescriptionRoot>
            {errorMessage
              ? errorMessage
              : "Something went wrong, Please try again."}
            <Cross1Icon />
          </ToastDescriptionRoot>
        ),
      });
    } finally {
      done = true;
      await wait(2);
      await refetch();
      setLoading(false);
      await wait(10);
      dismiss();
    }
  }, [connection, mintItem, publicKey, refetch, signTransaction, toast]);

  return (
    <Button
      className="w-full h-6"
      variant={isStaked ? "destructive" : "default"}
      onClick={handleClick}
      disabled={loading}
    >
      {isStaked ? "Unstake" : "Stake"}
    </Button>
  );
}

const ToastDescriptionRoot = ({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div className={cn("flex gap-1 items-center", className)} {...props}>
      {children}
    </div>
  );
};

function LoadingExecuteStake() {
  return <Skeleton className="w-full h-6" />;
}

export { ExecuteStake, LoadingExecuteStake };
