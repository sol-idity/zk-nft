export type MintItem = {
  mint: string;
  attributes: {
    value: string;
    trait_type: string;
  }[];
  imageUri: string;
  metadataUri: string;
  name: string;
  owner: string;
  stakedAt?: string;
};

export type CollectionStakeInfo = {
  totalStaked: number;
};
