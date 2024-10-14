"use client";

import { AlertCircle } from "lucide-react";
import React, { useState } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

import CollectionSelector from "./CollectionSelector";
import ItemFilterButton from "./ItemFilterButton";
import StakeHeader from "./StakeHeader";
import StakeItems from "./StakeItems";

export default function StakePage() {
  const [stakedSelected, setStakedSelected] = useState(true);
  const [availableSelected, setAvailableSelected] = useState(true);

  return (
    <StakePageRoot>
      <StakeHeader />
      <Alert>
        <AlertCircle className="h-5 w-5" />
        <AlertTitle className="font-bold text-lg">Notice: No Rewards for Staking</AlertTitle>
        <AlertDescription>
          This zkNFT staking website is for demonstration purposes only. No
          utility or rewards from staking are promised or guaranteed. Please do
          not expect any benefits from using this platform.
        </AlertDescription>
      </Alert>
      <StakeContent>
        <ItemsControllerWrapper>
          <CollectionSelector />
          <ItemFiltersWrapper>
            <ItemFilterButton
              variant="available"
              selected={availableSelected}
              onClick={() => {
                setAvailableSelected((prev) => !prev);
              }}
            />
            <ItemFilterButton
              variant="staked"
              selected={stakedSelected}
              onClick={() => {
                setStakedSelected((prev) => !prev);
              }}
            />
          </ItemFiltersWrapper>
        </ItemsControllerWrapper>
        <StakeItems
          collName="zknft"
          filters={{ stakedSelected, availableSelected }}
        />
      </StakeContent>
    </StakePageRoot>
  );
}

function StakePageRoot({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("container flex flex-col gap-8", className)} {...props}>
      {children}
    </div>
  );
}

function StakeContent({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "bg-content-foreground bg-opacity-80 px-2 py-4 md:p-6 rounded-lg",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

function ItemsControllerWrapper({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex items-center sm:justify-between gap-2 overflow-x-hidden",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

function ItemFiltersWrapper({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex items-center gap-2 p-1", className)} {...props}>
      {children}
    </div>
  );
}
