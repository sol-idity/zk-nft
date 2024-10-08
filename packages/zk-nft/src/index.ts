import idl from "../target/idl/zk_nft.json";
import stakeIdl from "../target/idl/stake.json";

// main program
export type { ZkNft } from "../target/types/zk_nft";
export { idl };
export const PROGRAM_ID = "zkNFTi24GW95YYfM8jNM2tDDPmDnDm7EQuze8jJ66sn";
export { getDelegateRoleFromNumber, getBaseDataStateFromNumber } from "./utils";
export {
  assetSchemaV1,
  metadataSchemaV1,
  stakeRecordSchemaV1,
  freezeDelegateSchemaV1,
} from "./schemas";

export type { Stake } from "../target/types/stake";
export { stakeIdl };
export const STAKE_PROGRAM_ID = "stk3g78wHcLTHgAqedaaxpqAvaDDRkxFj4qY4ew3CG4";
