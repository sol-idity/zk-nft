use anchor_lang::prelude::*;
use light_sdk::light_account;

#[light_account]
#[derive(Clone, Debug, Default)]
pub struct StakeRecord {
    #[truncate]
    pub asset_id: [u8; 32],
    #[truncate]
    pub staker: Pubkey,
    #[truncate]
    pub collection_id: Pubkey,
    pub start_time: i64,
}
