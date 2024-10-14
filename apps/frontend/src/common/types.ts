import {
  CompressedAccountData,
  CompressedAccountWithMerkleContext,
} from "@lightprotocol/stateless.js";

export interface BaseAsset
  extends Omit<CompressedAccountWithMerkleContext, "address"> {
  address: string;
  data: CompressedAccountData;
}
