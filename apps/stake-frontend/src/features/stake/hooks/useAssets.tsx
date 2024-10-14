/* eslint-disable @typescript-eslint/no-explicit-any */
import { BN } from "@coral-xyz/anchor";
import { bs58 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";
import {
  bn,
  createRpc,
  defaultTestStateTreeAccounts,
  deriveAddress,
  hashToBn254FieldSizeBe,
} from "@lightprotocol/stateless.js";
import { useConnection } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { useQuery } from "@tanstack/react-query";
import {
  assetSchemaV1,
  metadataSchemaV1,
  STAKE_PROGRAM_ID,
  stakeRecordSchemaV1,
} from "@zk-nft/program";
import axios from "axios";
import * as borsh from "borsh";

import { BaseAsset } from "@/types/base-asset";

import { useZkNftProgram } from "./useZkNftProgram";

export const useUserBaseAssets = (publicKey: string | undefined) => {
  const program = useZkNftProgram();

  const query = useQuery({
    queryKey: ["useUserAssetIds", publicKey],
    queryFn: async () => {
      if (!publicKey || !program) return null;

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
    },
    enabled: !!publicKey && !!program,
    refetchInterval: 5000,
  });

  return query;
};

export const useAsset = (baseAsset: BaseAsset | undefined) => {
  const { connection } = useConnection();
  const zkNftProgram = useZkNftProgram();
  const { data: stakeRecord } = useStakeRecord(baseAsset?.address);

  const query = useQuery({
    queryKey: ["useAsset", baseAsset, stakeRecord],
    queryFn: async () => {
      if (!baseAsset || !zkNftProgram || stakeRecord === undefined) return null;

      const rpc = createRpc(
        connection.rpcEndpoint,
        connection.rpcEndpoint.startsWith("http://")
          ? undefined
          : connection.rpcEndpoint,
        undefined,
        {
          commitment: connection.commitment,
        }
      );

      const decodedAsset: any = borsh.deserialize(
        assetSchemaV1,
        baseAsset.data.data
      );

      const addressTree = defaultTestStateTreeAccounts().addressTree;
      const metadataSeed = await hashToBn254FieldSizeBe(
        Buffer.from([
          2,
          ...zkNftProgram.programId.toBytes(),
          ...new PublicKey(baseAsset.address).toBytes(),
        ])
      );
      if (!metadataSeed) {
        throw new Error("Failed to derive metadata seed");
      }
      const metadataAddress = await deriveAddress(metadataSeed[0], addressTree);
      const metadataAccount = await rpc.getCompressedAccount(
        bn(metadataAddress.toBytes())
      );
      if (!metadataAccount?.data) {
        throw new Error("Failed to get metadata account");
      }
      const metadata: any = borsh.deserialize(
        metadataSchemaV1,
        metadataAccount.data.data
      );
      const metadataUri = metadata.uri;
      const fetchedMetadata = await axios
        .get(metadataUri)
        .then((res) => res.data);

      const asset = {
        mint: baseAsset.address as string,
        name: fetchedMetadata.name as string,
        imageUri: fetchedMetadata.image as string,
        metadataUri: fetchedMetadata.metadataUri as string,
        owner: new PublicKey(Uint8Array.from(decodedAsset.owner)).toBase58(),
        attributes: fetchedMetadata.attributes,
        stakedAt: stakeRecord?.startTime,
      };

      return asset;
    },
    enabled: !!baseAsset && !!zkNftProgram && stakeRecord !== undefined,
  });

  return query;
};

export const useStakeRecord = (assetId: string | undefined) => {
  const { connection } = useConnection();

  const query = useQuery({
    queryKey: ["useStakeRecord", assetId],
    queryFn: async () => {
      if (!assetId) return null;

      const rpc = createRpc(
        connection.rpcEndpoint,
        connection.rpcEndpoint.startsWith("http://")
          ? undefined
          : connection.rpcEndpoint,
        undefined,
        {
          commitment: connection.commitment,
        }
      );

      const stakeRecord = (
        await rpc.getCompressedAccountsByOwner(
          new PublicKey(STAKE_PROGRAM_ID),
          {
            filters: [
              {
                memcmp: {
                  bytes: assetId,
                  offset: 0,
                },
              },
            ],
            limit: new BN(1),
          }
        )
      ).items[0];

      if (!stakeRecord?.data) {
        return null;
      }

      const decodedStakeRecord: any = borsh.deserialize(
        stakeRecordSchemaV1,
        stakeRecord.data.data
      );

      return {
        assetId: new PublicKey(
          Uint8Array.from(decodedStakeRecord.assetId)
        ).toBase58(),
        staker: new PublicKey(
          Uint8Array.from(decodedStakeRecord.staker)
        ).toBase58(),
        collectionId: new PublicKey(
          Uint8Array.from(decodedStakeRecord.collectionId)
        ).toBase58(),
        startTime: new Date(
          Number(decodedStakeRecord.startTime) * 1000
        ).toISOString(),
      };
    },
    enabled: !!assetId,
  });

  return query;
};
