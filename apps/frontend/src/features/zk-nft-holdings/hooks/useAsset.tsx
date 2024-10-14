import {
  bn,
  createRpc,
  defaultTestStateTreeAccounts,
  deriveAddress,
  hashToBn254FieldSizeBe,
} from "@lightprotocol/stateless.js";
import { PublicKey } from "@solana/web3.js";
import {
  assetSchemaV1,
  freezeDelegateSchemaV1,
  metadataSchemaV1,
} from "@zk-nft/program";
import useSWRImmutable from "swr/immutable";
import { useConnection } from "@solana/wallet-adapter-react";
import * as borsh from "borsh";
import axios from "axios";
import { useZkNftProgram } from "@/common/hooks/useZkNftProgram";
import { BaseAsset } from "@/common/types";

export const useAsset = (baseAsset: BaseAsset) => {
  const { connection } = useConnection();
  const zkNftProgram = useZkNftProgram();
  const swr = useSWRImmutable(
    !baseAsset || !zkNftProgram ? null : ["asset", baseAsset, zkNftProgram],
    async ([, baseAsset, zkNftProgram]) => {
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

      const addressTree = defaultTestStateTreeAccounts().addressTree;
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

      const freezeDelegateSeed = await hashToBn254FieldSizeBe(
        Buffer.from([
          4,
          ...zkNftProgram.programId.toBytes(),
          ...Uint8Array.from(new PublicKey(baseAsset.address).toBytes()),
        ])
      );
      if (!freezeDelegateSeed) {
        throw new Error("Failed to derive freeze delegate seed");
      }
      const freezeDelegateAddress = await deriveAddress(
        freezeDelegateSeed[0],
        addressTree
      );
      const freezeDelegateAccount = await rpc.getCompressedAccount(
        bn(freezeDelegateAddress.toBytes())
      );
      const freezeDelegate: any = !freezeDelegateAccount?.data
        ? null
        : borsh.deserialize(
            freezeDelegateSchemaV1,
            freezeDelegateAccount.data.data
          );

      const decodedAsset: any = borsh.deserialize(
        assetSchemaV1,
        baseAsset.data.data
      );

      const asset = {
        ...baseAsset,
        initializedPlugins: decodedAsset.initializedPlugins as number,
        metadata: {
          name: fetchedMetadata.name,
          description: fetchedMetadata.description,
          image: fetchedMetadata.image,
          attributes: fetchedMetadata.attributes,
        },
        freezeDelegate: !freezeDelegate
          ? null
          : new PublicKey(Uint8Array.from(freezeDelegate.authority)).toBase58(),
      };

      return asset;
    }
  );

  return swr;
};
