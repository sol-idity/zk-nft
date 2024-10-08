use crate::state::AccountKey;
use anchor_lang::prelude::*;
use light_sdk::light_account;

#[light_account]
#[derive(Clone, Debug, Default)]
pub struct TransferDelegateV1 {
    pub key: AccountKey,
    #[truncate]
    pub authority: Pubkey,
}
