use anchor_lang::prelude::*;
use light_sdk::merkle_context::PackedAddressMerkleContext;
use processor::*;
use zk_nft::{
    processor::{AddPluginAsset, PluginCompressionParams},
    state::{AnchorCompressedProof, MerkleContext},
};

mod constants;
mod processor;
mod state;

declare_id!("stk3g78wHcLTHgAqedaaxpqAvaDDRkxFj4qY4ew3CG4");

#[program]
pub mod stake {
    use super::*;

    pub fn stake<'info>(
        ctx: Context<'_, '_, '_, 'info, Stake<'info>>,
        asset_proof: AnchorCompressedProof,
        plugin_proof: AnchorCompressedProof,
        plugin_compression_params: PluginCompressionParams,
        merkle_context: MerkleContext,
        address_merkle_context: PackedAddressMerkleContext,
        merkle_tree_root_index: u16,
        asset_leaf_index: u32,
        plugin_leaf_index: u32,
        add_plugin_asset: AddPluginAsset,
    ) -> Result<()> {
        processor::stake(
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
        )
    }

    pub fn unstake<'info>(
        ctx: Context<'_, '_, '_, 'info, Unstake<'info>>,
        stake_record_proof: AnchorCompressedProof,
        plugin_proof: AnchorCompressedProof,
        merkle_context: MerkleContext,
        merkle_tree_root_index: u16,
        stake_record_leaf_index: u32,
        asset_leaf_index: u32,
        plugin_leaf_index: u32,
        stake_start_time: i64,
        asset_id: [u8; 32],
        plugin_index_to_remove: u16,
        asset_initialized_plugins: u16,
    ) -> Result<()> {
        processor::unstake(
            ctx,
            stake_record_proof,
            plugin_proof,
            merkle_context,
            merkle_tree_root_index,
            stake_record_leaf_index,
            asset_leaf_index,
            plugin_leaf_index,
            stake_start_time,
            asset_id,
            plugin_index_to_remove,
            asset_initialized_plugins,
        )
    }
}
