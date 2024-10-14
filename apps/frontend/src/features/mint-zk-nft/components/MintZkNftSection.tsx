import { useWallet } from "@solana/wallet-adapter-react";
import { MintZkNftButton } from "./MintZkNftButton";
import { Button } from "@/shadcn/components/ui/button";
import Link from "next/link";
import { useUserBaseAssets } from "@/features/zk-nft-holdings/hooks/useUserBaseAssets";

/* eslint-disable @next/next/no-img-element */
export const MintZkNftSection = () => {
  const { publicKey } = useWallet();
  const { data: assetIds } = useUserBaseAssets(publicKey?.toBase58());

  return (
    <div className="flex flex-col items-center justify-center w-full gap-7">
      {/* <img
        width={512}
        height={512}
        className="shadow-2xl rounded-xl"
        src="/gallery.gif"
      /> */}
      {!publicKey ? (
        <div className="flex justify-center items-center flex-1 w-full">
          <p className="font-semibold">
            Connect your wallet to mint/view your zkNFTs!
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3 items-center">
          <MintZkNftButton />
          {Boolean(assetIds?.length) && (
            <Button asChild variant="outline" size="sm">
              <Link
                href="https://stake.zk.tinys.pl"
                target="_blank"
                rel="noopener noreferrer"
              >
                Stake your zkNFTs
              </Link>
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
