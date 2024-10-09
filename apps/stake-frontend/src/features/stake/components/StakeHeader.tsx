import React from "react";

import Typography from "@/components/common/Typography";
import { cn } from "@/lib/utils";

export default function StakeHeader() {
  return (
    <StakedHeaderRoot>
      <Typography variant="h1" className="text-center">
        zkNFT Staking
      </Typography>
      {/* Total staked */}
      {/* <StakedInfo info={data} isLoading={status === "pending"} /> */}
    </StakedHeaderRoot>
  );
}

// function StakedInfo({
//   isLoading,
//   info,
// }: {
//   isLoading: boolean;
//   info?: CollectionStakeInfo;
// }) {
//   return (
//     <StakedInfoWrapper>
//       {isLoading ? (
//         <StyledSkeleton variant="h2" />
//       ) : (
//         <Typography variant="h2" as="p" truncate className="break-words w-full">
//           {info ? info.totalStaked.toLocaleString() : "0"}
//         </Typography>
//       )}
//       <Typography variant="small" as="h4">
//         Total Staked 🔒
//       </Typography>
//     </StakedInfoWrapper>
//   );
// }

function StakedHeaderRoot({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "pt-8 md:pt-32 px-0 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// function StakedInfoWrapper({
//   children,
//   className,
//   ...props
// }: React.HTMLAttributes<HTMLDivElement>) {
//   return (
//     <div
//       className={cn(
//         "flex flex-col items-start gap-1 border border-border rounded-lg p-2 sm:min-w-48 w-full sm:w-fit sm:py-4 sm:px-12 bg-content-foreground shadow-lg",
//         className
//       )}
//       {...props}
//     >
//       {children}
//     </div>
//   );
// }
