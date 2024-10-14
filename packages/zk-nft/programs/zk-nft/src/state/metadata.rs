use anchor_lang::prelude::*;
use light_sdk::light_account;
use light_utils::hash_to_bn254_field_size_be;
use super::AccountKey;

#[light_account]
#[derive(Clone, Debug, Default)]
pub struct MetadataV1 {
    pub key: AccountKey,
    pub uri: MetadataUri,
    #[truncate]
    pub asset_id: Pubkey,
}

#[derive(Clone, Debug, PartialEq, Eq, AnchorSerialize, AnchorDeserialize)]
pub enum MetadataUri {
    OffChain(String),
    TxHash(String),
}

impl MetadataUri {
    pub fn as_byte_vec(&self) -> Vec<Vec<u8>> {
        let metadata_uri_bytes = self.try_to_vec().unwrap();
        let truncated_metadata_uri_bytes =
            hash_to_bn254_field_size_be(&metadata_uri_bytes.as_slice())
                .unwrap()
                .0;
        vec![truncated_metadata_uri_bytes.to_vec()]
    }
}

impl Default for MetadataUri {
    fn default() -> Self {
        MetadataUri::OffChain(String::default())
    }
}
