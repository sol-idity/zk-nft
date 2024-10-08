pub mod constants;
pub mod errors;
pub mod processor;
pub mod state;
pub mod utils;

use anchor_lang::prelude::*;
use light_sdk::merkle_context::{PackedAddressMerkleContext, PackedMerkleContext};
use processor::*;
use state::*;

declare_id!("zkNFTi24GW95YYfM8jNM2tDDPmDnDm7EQuze8jJ66sn");

#[program]
pub mod zk_nft {
    use super::*;

    pub fn create_asset<'info>(
        ctx: Context<'_, '_, '_, 'info, CreateAsset<'info>>,
        proof: AnchorCompressedProof,
        address_merkle_tree_root_index: u16,
        random_bytes: [u8; 32],
        plugins_to_init: u16,
        metadata_uri: MetadataUri,
    ) -> Result<()> {
        processor::create_asset(
            ctx,
            proof,
            address_merkle_tree_root_index,
            random_bytes,
            plugins_to_init,
            metadata_uri,
        )
    }

    pub fn transfer<'info>(
        ctx: Context<'_, '_, '_, 'info, Transfer<'info>>,
        asset_proof: AnchorCompressedProof,
        plugin_proof: Option<AnchorCompressedProof>,
        merkle_context: PackedMerkleContext,
        merkle_tree_root_index: u16,
        asset_id: [u8; 32],
        old_asset: TransferAsset,
    ) -> Result<()> {
        processor::transfer(
            ctx,
            asset_proof,
            plugin_proof,
            merkle_context,
            merkle_tree_root_index,
            asset_id,
            old_asset,
        )
    }

    pub fn add_plugin<'info>(
        ctx: Context<'_, '_, '_, 'info, AddPlugin<'info>>,
        asset_proof: AnchorCompressedProof,
        plugin_proof: AnchorCompressedProof,
        plugin_compression_params: PluginCompressionParams,
        merkle_context: MerkleContext,
        address_merkle_context: PackedAddressMerkleContext,
        merkle_tree_root_index: u16,
        asset_leaf_index: u32,
        plugin_leaf_index: u32,
        add_plugin_asset: AddPluginAsset,
        new_plugin: Plugin,
    ) -> Result<()> {
        processor::add_plugin(
            ctx,
            asset_proof,
            plugin_proof,
            plugin_compression_params,
            merkle_context,
            address_merkle_context,
            merkle_tree_root_index,
            asset_leaf_index,
            plugin_leaf_index,
            add_plugin_asset,
            new_plugin,
        )
    }

    pub fn remove_plugin<'info>(
        ctx: Context<'_, '_, '_, 'info, RemovePlugin<'info>>,
        proof: AnchorCompressedProof,
        merkle_context: MerkleContext,
        merkle_tree_root_index: u16,
        asset_leaf_index: u32,
        plugin_leaf_index: u32,
        asset_id: [u8; 32],
        plugin_index_to_remove: u16,
        asset_initialized_plugins: u16,
    ) -> Result<()> {
        processor::remove_plugin(
            ctx,
            proof,
            merkle_context,
            merkle_tree_root_index,
            asset_leaf_index,
            plugin_leaf_index,
            asset_id,
            plugin_index_to_remove,
            asset_initialized_plugins,
        )
    }
}
