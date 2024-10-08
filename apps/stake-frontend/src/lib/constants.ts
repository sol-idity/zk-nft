import { DefaultApi } from "@zk-nft/sdk/client";

export const ENV = {
  solanaRPCUrl:
    process.env.NEXT_PUBLIC_RPC_ENDPOINT ||
    "https://api.mainnet-beta.solana.com",
  apiUrl: process.env.NEXT_PUBLIC_API_ENDPOINT || "https://api.tinys.pl/",
};

export const COLLECTIONS = [
  {
    value: "zkNft",
    label: "Zero Knowldege NFT",
    logo: "/assets/test/7.png",
  },
  // {
  //   value: "ligma",
  //   label: "Ligma",
  //   logo: "https://metadata.tinys.pl/ligma-image?seed=ligma&amount=409600000000",
  // },
];

export const SDK = new DefaultApi({
  basePath: process.env.NEXT_PUBLIC_API_ENDPOINT!,
  isJsonMime: () => true,
});
