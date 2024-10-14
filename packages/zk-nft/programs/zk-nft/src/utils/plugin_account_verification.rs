use anchor_lang::prelude::*;
use light_hasher::{DataHasher, Poseidon};
use light_sdk::{
    address::derive_address,
    compressed_account::{OutputCompressedAccountWithPackedContext, PackedCompressedAccountWithMerkleContext},
    merkle_context::{AddressMerkleContext, PackedMerkleContext},
};

use crate::Plugin;

use super::{input_compressed_account_from_hash, output_compressed_account_with_discriminator, ADDRESS_MERKLE_TREE_PUBKEY, ADDRESS_QUEUE_PUBKEY};

pub fn get_plugin_account_verification_input<'info>(
    merkle_context: &PackedMerkleContext,
    merkle_tree_root_index: u16,
    asset_id: &[u8; 32],
    plugin: &Plugin,
) -> Result<PackedCompressedAccountWithMerkleContext> {
    let seed = plugin.get_plugin_seed(&asset_id);
    let (plugin_account, discriminator) = plugin.get_plugin_account_and_discriminator();
    let data_hash = plugin_account.hash::<Poseidon>().unwrap();

    let plugin_address = derive_address(
        &seed,
        &AddressMerkleContext {
            // @FIXME: remove hardcoded pubkeys
            address_merkle_tree_pubkey: ADDRESS_MERKLE_TREE_PUBKEY,
            address_queue_pubkey: ADDRESS_QUEUE_PUBKEY,
        },
    );

    let input_compressed_accounts_with_merkle_context = input_compressed_account_from_hash(
        &discriminator,
        &data_hash,
        &plugin_address,
        &crate::ID,
        merkle_context,
        merkle_tree_root_index,
    )?;

    Ok(input_compressed_accounts_with_merkle_context)
}

pub fn get_plugin_account_verification_output<'info>(
    merkle_context: &PackedMerkleContext,
    asset_id: &[u8; 32],
    plugin: &Plugin,
) -> Result<OutputCompressedAccountWithPackedContext> {
    let seed = plugin.get_plugin_seed(&asset_id);
    let (plugin_account, discriminator) = plugin.get_plugin_account_and_discriminator();

    let plugin_address = derive_address(
        &seed,
        &AddressMerkleContext {
            // @FIXME: remove hardcoded pubkeys
            address_merkle_tree_pubkey: ADDRESS_MERKLE_TREE_PUBKEY,
            address_queue_pubkey: ADDRESS_QUEUE_PUBKEY,
        },
    );

    let output_compressed_accounts_with_merkle_context = output_compressed_account_with_discriminator(
        &discriminator,
        &plugin_account,
        &plugin_address,
        &crate::ID,
        merkle_context,
    )?;

    Ok(output_compressed_accounts_with_merkle_context)
}
