use anchor_lang::prelude::*;
use light_sdk::light_account;
use light_utils::hash_to_bn254_field_size_be;
use crate::state::AccountKey;

#[light_account]
#[derive(Clone, Debug, Default)]
pub struct AssetV1 {
    pub key: AccountKey,
    #[truncate]
    pub owner: Pubkey,
    pub update_authority: UpdateAuthority,

    // bit flags of plugins (bits start from the least significant bit)
    // 0: transfer_delegate
    // 1: freeze_delegate
    pub initialized_plugins: u16,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, AnchorSerialize, AnchorDeserialize, Default)]
pub enum UpdateAuthority {
    #[default]
    None,
    Address(Pubkey),
}

impl UpdateAuthority {
    pub fn as_byte_vec(&self) -> Vec<Vec<u8>> {
        let update_authority_bytes = self.try_to_vec().unwrap();
        let truncated_update_authority_bytes = hash_to_bn254_field_size_be(&update_authority_bytes.as_slice())
            .unwrap()
            .0;
        vec![truncated_update_authority_bytes.to_vec()]
    }
}
