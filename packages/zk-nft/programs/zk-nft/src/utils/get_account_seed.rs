use anchor_lang::prelude::*;
use light_utils::hash_to_bn254_field_size_be;

use crate::AccountKey;

pub fn get_account_seed<'info>(account_key: AccountKey, asset_id: &[u8; 32]) -> [u8; 32] {
    let account_key_bytes = account_key.try_to_vec().unwrap();
    let account_type_bytes: &[u8] = &[account_key_bytes[0]];
    let input = [account_type_bytes, &crate::ID.to_bytes(), asset_id].concat();
    hash_to_bn254_field_size_be(input.as_slice()).unwrap().0
}
