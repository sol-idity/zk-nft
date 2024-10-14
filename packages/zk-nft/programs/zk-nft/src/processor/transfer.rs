use crate::constants::{CPI_AUTHORITY_SEED, FREEZE_DELEGATE_PLUGIN_POS};
use crate::errors::ZkNftError;
use crate::state::{AccountKey, AssetV1};
use crate::utils::{
    get_plugin_account_verification_input, get_plugin_account_verification_output,
    input_compressed_account, output_compressed_account, validate_merkle_trees,
};
use crate::{AnchorCompressedProof, Plugin, UpdateAuthority};
use anchor_lang::prelude::*;
use light_sdk::light_system_accounts;
use light_sdk::merkle_context::PackedMerkleContext;
use light_sdk::proof::CompressedProof;
use light_sdk::utils::create_cpi_inputs_for_account_update;
use light_sdk::verify::{verify, InstructionDataInvokeCpi};
use light_sdk::LightTraits;

pub fn transfer<'info>(
    ctx: Context<'_, '_, '_, 'info, Transfer<'info>>,
    asset_proof: AnchorCompressedProof,
    transfer_delegate_proof: Option<AnchorCompressedProof>,
    merkle_context: PackedMerkleContext,
    merkle_tree_root_index: u16,
    asset_id: [u8; 32],
    old_asset: TransferAsset,
) -> Result<()> {
    validate_merkle_trees(
        merkle_context.merkle_tree_pubkey_index,
        None,
        None,
        Some(merkle_context.nullifier_queue_pubkey_index),
        ctx.remaining_accounts,
    )?;

    let is_freeze_delegate_plugin_set =
        old_asset.initialized_plugins & (1 << FREEZE_DELEGATE_PLUGIN_POS) != 0;
    require!(!is_freeze_delegate_plugin_set, ZkNftError::AssetIsFrozen);

    let bump = ctx.bumps.cpi_authority_pda;
    let signer_seeds = [CPI_AUTHORITY_SEED.as_bytes(), &[bump]];

    let is_transferring_via_transfer_delegate = ctx.accounts.authority.key() != old_asset.owner;
    if is_transferring_via_transfer_delegate {
        verify_transfer_delegate(
            &ctx,
            &transfer_delegate_proof,
            &merkle_context,
            merkle_tree_root_index,
            &asset_id,
            &old_asset,
            &signer_seeds,
        )?;
    }

    update_owner(
        &ctx,
        &asset_proof,
        &merkle_context,
        merkle_tree_root_index,
        &asset_id,
        &old_asset,
        &signer_seeds,
    )?;

    Ok(())
}

fn update_owner<'info>(
    ctx: &Context<'_, '_, '_, 'info, Transfer<'info>>,
    asset_proof: &AnchorCompressedProof,
    merkle_context: &PackedMerkleContext,
    merkle_tree_root_index: u16,
    asset_id: &[u8; 32],
    old_asset: &TransferAsset,
    signer_seeds: &[&[u8]],
) -> Result<()> {
    let old_compressed_account = input_compressed_account(
        &AssetV1 {
            key: AccountKey::AssetV1,
            owner: old_asset.owner,
            update_authority: match &ctx.accounts.update_authority {
                Some(update_authority) => UpdateAuthority::Address(update_authority.key()),
                None => UpdateAuthority::None,
            },
            initialized_plugins: old_asset.initialized_plugins,
        },
        asset_id,
        &crate::ID,
        merkle_context,
        merkle_tree_root_index,
    )?;
    let new_compressed_account = output_compressed_account(
        &AssetV1 {
            key: AccountKey::AssetV1,
            owner: ctx.accounts.recipient.key(),
            update_authority: match &ctx.accounts.update_authority {
                Some(update_authority) => UpdateAuthority::Address(update_authority.key()),
                None => UpdateAuthority::None,
            },
            initialized_plugins: Plugin::clear_delegate_plugins(old_asset.initialized_plugins),
        },
        asset_id,
        &crate::ID,
        merkle_context,
    )?;

    let cpi_inputs = create_cpi_inputs_for_account_update(
        CompressedProof {
            a: asset_proof.a,
            b: asset_proof.b,
            c: asset_proof.c,
        },
        old_compressed_account,
        new_compressed_account,
        None,
    );
    verify(ctx, &cpi_inputs, &[signer_seeds])?;

    Ok(())
}

fn verify_transfer_delegate<'info>(
    ctx: &Context<'_, '_, '_, 'info, Transfer<'info>>,
    transfer_delegate_proof: &Option<AnchorCompressedProof>,
    merkle_context: &PackedMerkleContext,
    merkle_tree_root_index: u16,
    asset_id: &[u8; 32],
    old_asset: &TransferAsset,
    signer_seeds: &[&[u8]],
) -> Result<()> {
    let plugin = Plugin::TransferDelegateV1(ctx.accounts.authority.key());
    require!(
        plugin.get_is_plugin_set(old_asset.initialized_plugins),
        ZkNftError::TransferDelegatePluginNotEnabled
    );

    let plugin_account_verification_input = get_plugin_account_verification_input(
        merkle_context,
        merkle_tree_root_index,
        asset_id,
        &plugin,
    )?;
    let plugin_account_verification_output =
        get_plugin_account_verification_output(merkle_context, asset_id, &plugin)?;

    let input = InstructionDataInvokeCpi {
        proof: match transfer_delegate_proof {
            Some(transfer_delegate_proof) => Some(CompressedProof {
                a: transfer_delegate_proof.a,
                b: transfer_delegate_proof.b,
                c: transfer_delegate_proof.c,
            }),
            None => None,
        },
        new_address_params: vec![],
        input_compressed_accounts_with_merkle_context: vec![plugin_account_verification_input],
        output_compressed_accounts: vec![plugin_account_verification_output],
        relay_fee: None,
        compress_or_decompress_lamports: None,
        is_compress: false,
        cpi_context: None,
    };

    verify(ctx, &input, &[signer_seeds])
}

#[light_system_accounts]
#[derive(Accounts, LightTraits)]
pub struct Transfer<'info> {
    #[account(mut)]
    #[fee_payer]
    pub payer: Signer<'info>,
    pub authority: Signer<'info>,
    /// CHECK: This can be any valid public key.
    pub update_authority: Option<UncheckedAccount<'info>>,
    /// CHECK: This can be any valid public key.
    pub recipient: UncheckedAccount<'info>,

    /// CHECK: Checked in light-system-program.
    #[authority]
    #[account(
        seeds = [CPI_AUTHORITY_SEED.as_bytes()],
        bump
    )]
    pub cpi_authority_pda: UncheckedAccount<'info>,
    #[self_program]
    pub self_program: Program<'info, crate::program::ZkNft>,
    /// CHECK: This can be any valid public key.
    pub freeze_delegate: Option<UncheckedAccount<'info>>,
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct TransferAsset {
    pub initialized_plugins: u16,
    pub owner: Pubkey,
}
