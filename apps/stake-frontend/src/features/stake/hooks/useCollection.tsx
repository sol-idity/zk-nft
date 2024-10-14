import { useQuery } from "@tanstack/react-query";

// import axios from "axios";
// import { ENV } from "@/lib/constants";
import { wait } from "@/lib/utils";
import { CollectionStakeInfo } from "@/types/resources";

export const useCollection = (collName: string) => {
  return useQuery({
    queryKey: ["collectionStakeInfo", collName],
    queryFn: async (): Promise<CollectionStakeInfo> => {
      // fetch collection stake info
      // const result = await axios
      //   .get(`${ENV.apiUrl}coll`)
      //   .then((res) => res.data)
      //   .catch(() => {
      //     return {
      //       totalStaked: 0,
      //     };
      //   });
      await wait(5);

      return {
        totalStaked: 1000,
      };
    },
  });
};
