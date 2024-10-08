use anchor_lang::prelude::*;
use light_sdk::{
    address::derive_address,
    light_system_accounts,
    merkle_context::{PackedAddressMerkleContext, PackedMerkleContext, PackedMerkleOutputContext},
    program_merkle_context::unpack_address_merkle_context,
    proof::CompressedProof,
    utils::{create_cpi_inputs_for_account_update, create_cpi_inputs_for_new_account},
    verify::verify,
    LightTraits,
};

use crate::{
    constants::CPI_AUTHORITY_SEED,
    errors::ZkNftError,
    utils::{
        input_compressed_account, input_compressed_account_from_hash,
        new_compressed_account_with_discriminator, output_compressed_account,
        output_compressed_account_with_discriminator, validate_merkle_trees,
    },
    AccountKey, AnchorCompressedProof, AssetV1, MerkleContext, Plugin, UpdateAuthority,
};

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
    validate_merkle_trees(
        merkle_context.merkle_tree_pubkey_index,
        Some(address_merkle_context.address_merkle_tree_pubkey_index),
        Some(address_merkle_context.address_queue_pubkey_index),
        Some(merkle_context.nullifier_queue_pubkey_index),
        ctx.remaining_accounts,
    )?;

    require!(
        !new_plugin.get_is_plugin_set(add_plugin_asset.initialized_plugins),
        ZkNftError::PluginAlreadySet
    );

    let asset = AssetV1 {
        key: add_plugin_asset.key,
        owner: ctx.accounts.owner.key(),
        update_authority: match &ctx.accounts.update_authority {
            Some(update_authority) => UpdateAuthority::Address(update_authority.key()),
            None => UpdateAuthority::None,
        },
        initialized_plugins: add_plugin_asset.initialized_plugins,
    };

    let bump = ctx.bumps.cpi_authority_pda;
    let signer_seeds = [CPI_AUTHORITY_SEED.as_bytes(), &[bump]];
    update_asset_plugin_flags(
        &ctx,
        &asset,
        &asset_proof,
        &PackedMerkleContext {
            merkle_tree_pubkey_index: merkle_context.merkle_tree_pubkey_index,
            nullifier_queue_pubkey_index: merkle_context.nullifier_queue_pubkey_index,
            leaf_index: asset_leaf_index,
            queue_index: None,
        },
        merkle_tree_root_index,
        &add_plugin_asset.asset_id,
        new_plugin,
        &[&signer_seeds],
    )?;

    handle_add_plugin(
        &ctx,
        &plugin_proof,
        &plugin_compression_params,
        &PackedMerkleContext {
            merkle_tree_pubkey_index: merkle_context.merkle_tree_pubkey_index,
            nullifier_queue_pubkey_index: merkle_context.nullifier_queue_pubkey_index,
            leaf_index: plugin_leaf_index,
            queue_index: None,
        },
        &address_merkle_context,
        merkle_tree_root_index,
        &add_plugin_asset.asset_id,
        &new_plugin,
        &[&signer_seeds],
    )?;

    Ok(())
}

pub fn update_asset_plugin_flags<'info>(
    ctx: &Context<'_, '_, '_, 'info, AddPlugin<'info>>,
    old_asset: &AssetV1,
    asset_proof: &AnchorCompressedProof,
    merkle_context: &PackedMerkleContext,
    merkle_tree_root_index: u16,
    asset_id: &[u8; 32],
    new_plugin: Plugin,
    cpi_authority_signer_seeds: &[&[&[u8]]],
) -> Result<()> {
    let new_key = match old_asset.key {
        AccountKey::UninitializedV1(plugins_to_init) => {
            let updated_plugins_to_init = new_plugin.clear_plugin(plugins_to_init);
            let new_key = if updated_plugins_to_init == 0 {
                AccountKey::AssetV1
            } else {
                AccountKey::UninitializedV1(updated_plugins_to_init)
            };
            new_key
        }
        _ => old_asset.key,
    };

    let old_compressed_account = input_compressed_account(
        old_asset,
        asset_id,
        &crate::ID,
        merkle_context,
        merkle_tree_root_index,
    )?;

    let updated_initialized_plugins = new_plugin.set_plugin(old_asset.initialized_plugins);
    let new_compressed_account = output_compressed_account(
        &AssetV1 {
            key: new_key,
            owner: old_asset.owner,
            update_authority: old_asset.update_authority,
            initialized_plugins: updated_initialized_plugins,
        },
        asset_id,
        &crate::ID,
        merkle_context,
    )?;

    let inputs = create_cpi_inputs_for_account_update(
        CompressedProof {
            a: asset_proof.a,
            b: asset_proof.b,
            c: asset_proof.c,
        },
        old_compressed_account,
        new_compressed_account,
        None,
    );
    verify(ctx, &inputs, cpi_authority_signer_seeds)?;

    Ok(())
}

fn handle_add_plugin<'info>(
    ctx: &Context<'_, '_, '_, 'info, AddPlugin<'info>>,
    plugin_proof: &AnchorCompressedProof,
    plugin_compression_params: &PluginCompressionParams,
    merkle_context: &PackedMerkleContext,
    address_merkle_context: &PackedAddressMerkleContext,
    merkle_tree_root_index: u16,
    asset_id: &[u8; 32],
    new_plugin: &Plugin,
    cpi_authority_signer_seeds: &[&[&[u8]]],
) -> Result<()> {
    let (plugin_account, discriminator) = new_plugin.get_plugin_account_and_discriminator();
    let seed = new_plugin.get_plugin_seed(asset_id);

    match plugin_compression_params {
        PluginCompressionParams::UninitializedAddress(address_merkle_tree_root_index) => {
            // we need to create a new address for the plugin
            let (plugin_compressed_account, asset_new_address_params) =
                new_compressed_account_with_discriminator(
                    &discriminator,
                    &plugin_account,
                    &seed,
                    &crate::ID,
                    &PackedMerkleOutputContext {
                        merkle_tree_pubkey_index: merkle_context.merkle_tree_pubkey_index,
                    },
                    &address_merkle_context,
                    *address_merkle_tree_root_index,
                    ctx.remaining_accounts,
                )?;
            // create plugin
            let plugin_inputs = create_cpi_inputs_for_new_account(
                CompressedProof {
                    a: plugin_proof.a,
                    b: plugin_proof.b,
                    c: plugin_proof.c,
                },
                asset_new_address_params,
                plugin_compressed_account,
                None,
            );
            verify(&ctx, &plugin_inputs, cpi_authority_signer_seeds)?;
        }
        PluginCompressionParams::InitializedAddress(data_hash) => {
            // update data stored in the plugin account
            let data_hash: &[u8; 32] = data_hash.as_slice().try_into().unwrap();
            let unpacked_address_merkle_context =
                unpack_address_merkle_context(*address_merkle_context, ctx.remaining_accounts);
            let plugin_address = derive_address(&seed, &unpacked_address_merkle_context);

            let old_compressed_account = input_compressed_account_from_hash(
                &discriminator, // @TODO: pass in discriminator from client
                &data_hash,
                &plugin_address,
                &crate::ID,
                &merkle_context,
                merkle_tree_root_index,
            )?;
            let new_compressed_account = output_compressed_account_with_discriminator(
                &discriminator,
                &plugin_account,
                &plugin_address,
                &crate::ID,
                &merkle_context,
            )?;
            let inputs = create_cpi_inputs_for_account_update(
                CompressedProof {
                    a: plugin_proof.a,
                    b: plugin_proof.b,
                    c: plugin_proof.c,
                },
                old_compressed_account,
                new_compressed_account,
                None,
            );
            verify(&ctx, &inputs, cpi_authority_signer_seeds)?;
        }
    }

    Ok(())
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct AddPluginAsset {
    pub asset_id: [u8; 32],
    pub key: AccountKey,
    pub initialized_plugins: u16,
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub enum PluginCompressionParams {
    UninitializedAddress(u16), // for an uninitialized address, we need to provide the address_merkle_tree_root_index
    InitializedAddress(Vec<u8>), // for an already initialized address, we need to provide the data hash of the compressed account
}

#[light_system_accounts]
#[derive(Accounts, LightTraits)]
pub struct AddPlugin<'info> {
    #[account(mut)]
    #[fee_payer]
    pub payer: Signer<'info>,
    /// CHECK: This can be any valid public key.
    pub update_authority: Option<UncheckedAccount<'info>>,
    pub owner: Signer<'info>,

    /// CHECK: Checked in light-system-program.
    #[authority]
    #[account(
        seeds = [CPI_AUTHORITY_SEED.as_bytes()],
        bump
    )]
    pub cpi_authority_pda: UncheckedAccount<'info>,
    #[self_program]
    pub self_program: Program<'info, crate::program::ZkNft>,
}
