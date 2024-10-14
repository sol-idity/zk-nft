import { DefaultApi } from "@zk-nft/sdk/client";

export const SDK = new DefaultApi({
  basePath: process.env.NEXT_PUBLIC_API_ENDPOINT!,
  isJsonMime: () => true,
});
