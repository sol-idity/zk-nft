import { useZkNftProgram } from "@/common/hooks/useZkNftProgram";
import { bs58 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";
import { createRpc } from "@lightprotocol/stateless.js";
import useSWRImmutable from "swr/immutable";
import { PublicKey } from "@solana/web3.js";
import { BaseAsset } from "@/common/types";

export const useUserBaseAssets = (publicKey: string | undefined) => {
  const program = useZkNftProgram();

  const swr = useSWRImmutable(
    !publicKey || !program ? null : ["userAssetIds", publicKey, program],
    async ([, publicKey, program]) => {
      const rpc = createRpc(
        program.provider.connection.rpcEndpoint,
        program.provider.connection.rpcEndpoint.startsWith("http://")
          ? undefined
          : program.provider.connection.rpcEndpoint,
        undefined,
        {
          commitment: program.provider.connection.commitment,
        }
      );

      const userAssets = await rpc.getCompressedAccountsByOwner(
        program.programId,
        {
          filters: [
            {
              memcmp: {
                bytes: bs58.encode([1]),
                offset: 0,
              },
            },
            {
              memcmp: {
                bytes: publicKey,
                offset: 1,
              },
            },
          ],
        }
      );

      return userAssets.items
        .map((asset) => {
          if (!asset.address || !asset.data) {
            return null;
          }

          return {
            ...asset,
            address: new PublicKey(Uint8Array.from(asset.address)).toBase58(),
            data: asset.data,
          };
        })
        .filter((asset) => asset !== null) as BaseAsset[];
    }
  );

  return swr;
};
