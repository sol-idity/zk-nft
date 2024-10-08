"use client";

import React, { useState } from "react";

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
