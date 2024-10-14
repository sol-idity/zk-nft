/* eslint-disable @next/next/no-img-element */

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shadcn/components/ui/card";
import { useAsset } from "../hooks/useAsset";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/shadcn/components/ui/accordion";
import { TransferButton } from "./TransferButton";
import { Skeleton } from "@/shadcn/components/ui/skeleton";
import { FrozenAssetOverlay } from "./FrozenAssetOverlay";
import { BaseAsset } from "@/common/types";

export const ZkNft = ({ baseAsset }: { baseAsset: BaseAsset }) => {
  const { data: asset } = useAsset(baseAsset);

  return (
    <div className="w-full sm:w-1/2 lg:w-1/3 p-2">
      {!asset ? (
        <div className="flex flex-col space-y-4">
          <Skeleton className="h-[256px] rounded-xl" />
          <div className="space-y-3">
            <Skeleton className="h-4" />
            <Skeleton className="h-4" />
          </div>
        </div>
      ) : (
        <Card className="relative min-h-[620px] flex flex-col">
          {asset?.freezeDelegate &&
            (asset.initializedPlugins & (1 << 1)) !== 0 && (
              <FrozenAssetOverlay freezeDelegate={asset.freezeDelegate} />
            )}
          <CardHeader className="flex-1">
            <CardTitle>{asset.metadata.name}</CardTitle>
            <CardDescription className="break-all text-xs">
              {asset?.address}
            </CardDescription>
            <CardDescription>{asset.metadata.description}</CardDescription>
          </CardHeader>
          <div className="items-end">
            <CardContent className="space-y-4">
              <img
                className="max-w-full object-cover aspect-square"
                width={512}
                height={512}
                src={asset.metadata.image}
                alt={asset.metadata.name}
              />
              <TransferButton baseAsset={asset} />
            </CardContent>
            <CardFooter>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="attributes">
                  <AccordionTrigger>Attributes</AccordionTrigger>
                  <AccordionContent>
                    <pre className="text-sm">
                      {JSON.stringify(asset.metadata.attributes, null, 2)}
                    </pre>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardFooter>
          </div>
        </Card>
      )}
    </div>
  );
};
