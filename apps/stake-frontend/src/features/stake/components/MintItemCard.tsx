import { TooltipProvider } from "@radix-ui/react-tooltip";
import Image from "next/image";
import React from "react";

import {
  ItemImageWrapper,
  RowBreakdown,
  StakeItemsGrid,
} from "@/components/common/CommonStyled";
import CopyableText from "@/components/common/CopyableText";
import { LoadingStakeTag, StakeTag } from "@/components/common/Tag";
import Typography from "@/components/common/Typography";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Skeleton, StyledSkeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getStakeStatusFromMintItem } from "@/lib/stake";
import { cn } from "@/lib/utils";
import { BaseAsset } from "@/types/base-asset";
import { MintItem } from "@/types/resources";

import { useAsset } from "../hooks/useAssets";
import { ExecuteStake, LoadingExecuteStake } from "./ExecuteStake";
import StakeDuration from "./StakeDuration";

interface MintItemCardProps {
  baseAsset: BaseAsset;
  filters: {
    stakedSelected: boolean;
    availableSelected: boolean;
  };
}

function MintItemCard({ baseAsset, filters }: MintItemCardProps) {
  const { data: mintItem } = useAsset(baseAsset);
  const { isStaked } = getStakeStatusFromMintItem(mintItem);

  if (!mintItem) {
    return <LoadingMintItemCard />;
  }

  return (isStaked && !filters.stakedSelected) ||
    (!isStaked && !filters.availableSelected) ? null : (
    <CardWrapper>
      <ItemImageWrapper className="relative">
        <Image
          src={mintItem.imageUri}
          alt={`${mintItem.mint} image`}
          fill
          className="h-full w-full rounded-t-md object-cover"
        />
        {isStaked && (
          <StakeDurationWrapper>
            <StakeDuration stakedAt={mintItem.stakedAt!} />
          </StakeDurationWrapper>
        )}
        <StakeTag
          mintItem={mintItem}
          className="absolute bottom-0 right-0 translate-y-1/2"
        />
      </ItemImageWrapper>
      <CardInfoWrapper>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger className="hidden md:block w-full overflow-hidden">
              <ItemName name={mintItem.name} />
            </TooltipTrigger>
            <TooltipContent className="py-4 space-y-2 bg-content-foreground text-foreground min-w-80 border border-border">
              <ItemDetails mintItem={mintItem} isStaked={isStaked} />
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <Popover>
          <PopoverTrigger className="block md:hidden w-full overflow-hidden">
            <ItemName name={mintItem.name} />
          </PopoverTrigger>
          <PopoverContent className="py-4 space-y-2 bg-content-foreground text-foreground border-border">
            <ItemDetails mintItem={mintItem} isStaked={isStaked} />
          </PopoverContent>
        </Popover>
        <CardActionWrapper>
          <ExecuteStake mintItem={mintItem} />
        </CardActionWrapper>
      </CardInfoWrapper>
    </CardWrapper>
  );
}

function LoadingMintItemCard() {
  return (
    <CardWrapper>
      <ItemImageWrapper>
        <Skeleton className="w-full h-full rounded-t-md rounded-b-none" />
        <LoadingStakeTag className="absolute bottom-0 right-0 translate-y-1/2" />
      </ItemImageWrapper>
      <CardInfoWrapper>
        <StyledSkeleton variant="base" />
        <CardActionWrapper>
          <LoadingExecuteStake />
        </CardActionWrapper>
      </CardInfoWrapper>
    </CardWrapper>
  );
}

function LoadingMintItemCards({
  count = 24,
  className = "",
  wrapWithGrid = true,
}: {
  count?: number;
  className?: string;
  wrapWithGrid?: boolean;
}) {
  const items = Array.from({ length: count }, (_, i) => (
    <LoadingMintItemCard key={i} />
  ));

  return wrapWithGrid ? (
    <StakeItemsGrid className={className}>{items}</StakeItemsGrid>
  ) : (
    <>{items}</>
  );
}

function ItemName({ name }: { name: string }) {
  return (
    <Typography truncate className="text-nowrap font-semibold underline">
      {name}
    </Typography>
  );
}

function ItemDetails({
  mintItem,
  isStaked,
}: {
  mintItem: MintItem;
  isStaked: boolean;
}) {
  return (
    <>
      <Typography variant="h5">{mintItem.name}</Typography>
      <Separator />
      {isStaked && mintItem.stakedAt ? (
        <DetailsInfoWrapper>
          <Typography variant="h5">Staked 🔒</Typography>
          <RowBreakdown>
            <Typography variant="h6">Staked at</Typography>
            <Typography className="text-right">
              {new Date(mintItem.stakedAt).toLocaleString()}
            </Typography>
          </RowBreakdown>
        </DetailsInfoWrapper>
      ) : null}
      <DetailsInfoWrapper>
        <Typography variant="h5">Details</Typography>
        <div>
          <RowBreakdown>
            <Typography variant="h6">Mint</Typography>
            <CopyableText text={mintItem.mint} truncate />
          </RowBreakdown>
          <RowBreakdown>
            <Typography variant="h6">Owner</Typography>
            <CopyableText text={mintItem.owner} truncate />
          </RowBreakdown>
        </div>
      </DetailsInfoWrapper>
      <DetailsInfoWrapper>
        <Typography variant="h5">{`Attributes (${mintItem.attributes.length})`}</Typography>
        <ItemAttributesGridRoot className="pt-2">
          {mintItem.attributes.map((attribute) => (
            <MintItemAttribute key={attribute.trait_type}>
              <Typography variant="h6" truncate>
                {attribute.trait_type}
              </Typography>
              <Typography truncate>{attribute.value}</Typography>
            </MintItemAttribute>
          ))}
        </ItemAttributesGridRoot>
      </DetailsInfoWrapper>
    </>
  );
}

function CardWrapper({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-md shadow-border shadow-md border border-border overflow-x-hidden",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

function CardInfoWrapper({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("p-2 pt-4 space-y-1.5", className)} {...props}>
      {children}
    </div>
  );
}

function StakeDurationWrapper({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "absolute w-full h-full rounded-t-md bg-background/70 flex flex-col items-center justify-center gap-1",
        className
      )}
      {...props}
    >
      <Typography variant="small">Stake Duration</Typography>
      {children}
    </div>
  );
}

function CardActionWrapper({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex justify-end", className)} {...props}>
      {children}
    </div>
  );
}

function DetailsInfoWrapper({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("pt-2 space-y-0.5", className)} {...props}>
      {children}
    </div>
  );
}

function ItemAttributesGridRoot({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("grid grid-cols-2 gap-2", className)} {...props}>
      {children}
    </div>
  );
}

function MintItemAttribute({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("p-2 border rounded-sm bg-card/10 shadow-sm", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export { LoadingMintItemCard, LoadingMintItemCards, MintItemCard };
