import { MintItem } from "@/types/resources";

export function getStakeStatusFromMintItem(
  mintItem: MintItem | null | undefined
) {
  if (mintItem?.stakedAt) return { isStaked: true, status: "staked" };
  return { isStaked: false, status: "available" };
}
