import { useWallet } from "@solana/wallet-adapter-react";
import React from "react";

import { StakeItemsGrid } from "@/components/common/CommonStyled";
import Typography from "@/components/common/Typography";

import { useUserBaseAssets } from "../hooks/useAssets";
import { LoadingMintItemCards, MintItemCard } from "./MintItemCard";

interface StakeItemsProps {
  collName: string;
  filters: {
    stakedSelected: boolean;
    availableSelected: boolean;
  };
}

export default function StakeItems({ filters }: StakeItemsProps) {
  const { publicKey } = useWallet();
  // const { data, status } = useAsset({
  //   collName,
  //   wallet: publicKey?.toBase58(),
  // });
  const { data, status } = useUserBaseAssets(publicKey?.toBase58());

  return !publicKey ? (
    <NotFound variant="noWallet" />
  ) : status === "pending" ? (
    <LoadingMintItemCards />
  ) : status === "error" ? (
    <NotFound variant="error" />
  ) : !data || data.length < 1 ? (
    <NotFound variant="noZKItems" />
  ) : !filters.availableSelected && !filters.stakedSelected ? (
    <NotFound variant="noItems" />
  ) : (
    <StakeItemsGrid>
      {data.map((item) => (
        <MintItemCard baseAsset={item} filters={filters} key={item.address} />
      ))}
    </StakeItemsGrid>
  );
}

function NotFound({
  variant,
}: {
  variant: "noWallet" | "noItems" | "noZKItems" | "error";
}) {
  return (
    <div className="flex flex-col items-center gap-6 w-full py-28">
      <Typography variant="h1" as="p">
        {variant === "noItems"
          ? "🙁"
          : variant === "noZKItems"
            ? "👜"
            : variant === "noWallet"
              ? "🔗"
              : variant === "error"
                ? "😣"
                : null}
      </Typography>
      <Typography variant="h4" as="p" className="text-center text-balance">
        {variant === "noItems" ? (
          "No Items Found!"
        ) : variant === "noZKItems" ? (
          <>
            Your wallet has no ZK NFTs.
            <br />
            Start adding some to explore!
          </>
        ) : variant === "noWallet" ? (
          <>
            No wallet connected!
            <br />
            Please connect your wallet to continue.
          </>
        ) : variant === "error" ? (
          <>
            Oops! There was an error fetching items.
            <br /> Please try refreshing the page.
          </>
        ) : null}
      </Typography>
    </div>
  );
}
