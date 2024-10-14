use anchor_lang::prelude::*;
use light_hasher::bytes::AsByteVec;
use light_utils::hash_to_bn254_field_size_be;

pub use anchor_compressed_proof::*;
pub use asset::*;
pub use metadata::*;
pub use plugin::*;
pub use transfer_delegate::*;
pub use freeze_delegate::*;
pub use merkle_context::*;

mod anchor_compressed_proof;
mod asset;
mod metadata;
mod plugin;
mod transfer_delegate;
mod freeze_delegate;
mod merkle_context;

#[derive(Clone, Copy, Debug, PartialEq, Eq, AnchorSerialize, AnchorDeserialize, Default)]
#[repr(u8)]
pub enum AccountKey {
    // The u16 represents the plugins that not yet been initialized. 
    // Once all plugins are initialized, the asset account will be moved to the AssetV1 variant
    UninitializedV1(u16),
    #[default]
    AssetV1,
    MetadataV1,
    TransferDelegateV1,
    FreezeDelegateV1,
}

impl AsByteVec for AccountKey {
    fn as_byte_vec(&self) -> Vec<Vec<u8>> {
        let account_key_bytes = self.try_to_vec().unwrap();
        let truncated_account_key_bytes =
            hash_to_bn254_field_size_be(&account_key_bytes.as_slice())
                .unwrap()
                .0;
        vec![truncated_account_key_bytes.to_vec()]
    }
}
