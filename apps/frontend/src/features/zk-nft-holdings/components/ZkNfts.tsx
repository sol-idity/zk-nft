import { useWallet } from "@solana/wallet-adapter-react";
import { useUserBaseAssets } from "../hooks/useUserBaseAssets";
import { ZkNft } from "./ZkNft";
import { Skeleton } from "@/shadcn/components/ui/skeleton";
import { useState } from "react";
import { Button } from "@/shadcn/components/ui/button";

const PAGE_SIZE = 3;

export const ZkNfts = () => {
  const { publicKey } = useWallet();
  const { data } = useUserBaseAssets(publicKey?.toBase58());
  const [nftsToShow, setNftsToShow] = useState(PAGE_SIZE);

  return (
    <div className="pt-4 flex-1 flex flex-col">
      {/* <h1 className="text-4xl mb-2 font-semibold">Your zkNFTs</h1> */}
      {data?.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-center">
            No zkNFTs found. You can mint some via the mint button above!
          </p>
        </div>
      ) : (
        <div>
          <div className="flex flex-wrap">
            {!data
              ? Array.from({ length: 3 }).map((_, i) => (
                  <div className="w-full sm:w-1/2 lg:w-1/3 p-2" key={i}>
                    <div className="flex flex-col space-y-4">
                      <Skeleton className="h-[256px] rounded-xl" />
                      <div className="space-y-3">
                        <Skeleton className="h-4" />
                        <Skeleton className="h-4" />
                      </div>
                    </div>
                  </div>
                ))
              : data
                  .slice()
                  .reverse()
                  .slice(0, nftsToShow)
                  .map((baseAsset) => (
                    <ZkNft key={baseAsset.address} baseAsset={baseAsset} />
                  ))}
          </div>
          {data && nftsToShow < data.length && (
            <div className="flex justify-center mt-4">
              <Button
                onClick={() => {
                  setNftsToShow(nftsToShow + PAGE_SIZE);
                }}
              >
                Load more
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
