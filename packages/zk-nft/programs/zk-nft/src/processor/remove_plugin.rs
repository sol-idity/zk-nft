use anchor_lang::prelude::*;
use light_sdk::{
    compressed_account::{
        OutputCompressedAccountWithPackedContext, PackedCompressedAccountWithMerkleContext,
    },
    light_system_accounts,
    merkle_context::PackedMerkleContext,
    proof::CompressedProof,
    verify::{verify, InstructionDataInvokeCpi},
    LightTraits,
};

use crate::{
    constants::{CPI_AUTHORITY_SEED, FREEZE_DELEGATE_PLUGIN_POS},
    errors::ZkNftError,
    utils::{
        get_plugin_account_verification_input, get_plugin_account_verification_output,
        input_compressed_account, output_compressed_account,
    },
    AccountKey, AnchorCompressedProof, AssetV1, MerkleContext, Plugin, UpdateAuthority,
};

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
    let mut instruction_data = InstructionDataInvokeCpi {
        proof: Some(CompressedProof {
            a: proof.a,
            b: proof.b,
            c: proof.c,
        }),
        new_address_params: vec![],
        input_compressed_accounts_with_merkle_context: vec![],
        output_compressed_accounts: vec![],
        relay_fee: None,
        compress_or_decompress_lamports: None,
        is_compress: false,
        cpi_context: None,
    };

    if plugin_index_to_remove == FREEZE_DELEGATE_PLUGIN_POS as u16 {
        match &ctx.accounts.freeze_delegate {
            Some(freeze_delegate) => {
                let plugin_to_remove = Plugin::FreezeDelegateV1(freeze_delegate.key());
                let plugin_merkle_context = PackedMerkleContext {
                    merkle_tree_pubkey_index: merkle_context.merkle_tree_pubkey_index,
                    nullifier_queue_pubkey_index: merkle_context.nullifier_queue_pubkey_index,
                    leaf_index: plugin_leaf_index,
                    queue_index: None,
                };
                let plugin_account_verification_input = get_plugin_account_verification_input(
                    &plugin_merkle_context,
                    merkle_tree_root_index,
                    &asset_id,
                    &plugin_to_remove,
                )?;
                let plugin_account_verification_output = get_plugin_account_verification_output(
                    &plugin_merkle_context,
                    &asset_id,
                    &plugin_to_remove,
                )?;

                instruction_data
                    .input_compressed_accounts_with_merkle_context
                    .push(plugin_account_verification_input);
                instruction_data
                    .output_compressed_accounts
                    .push(plugin_account_verification_output);

                let (old_asset_compressed_account, new_asset_compressed_account) =
                    get_update_asset_accounts(
                        &ctx,
                        &PackedMerkleContext {
                            merkle_tree_pubkey_index: merkle_context.merkle_tree_pubkey_index,
                            nullifier_queue_pubkey_index: merkle_context
                                .nullifier_queue_pubkey_index,
                            leaf_index: asset_leaf_index,
                            queue_index: None,
                        },
                        merkle_tree_root_index,
                        &asset_id,
                        plugin_to_remove,
                        asset_initialized_plugins,
                    )?;

                instruction_data
                    .input_compressed_accounts_with_merkle_context
                    .push(old_asset_compressed_account);
                instruction_data
                    .output_compressed_accounts
                    .push(new_asset_compressed_account);
            }
            None => {
                return Err(ZkNftError::FreezeDelegateNotProvided.into());
            }
        }
    } else {
        // only support removing freeze delegate plugin for now, to remove transfer delegate plugin, just do a normal transfer
        return Err(ZkNftError::InvalidPluginIndex.into());
    }

    let bump = ctx.bumps.cpi_authority_pda;
    let signer_seeds = [CPI_AUTHORITY_SEED.as_bytes(), &[bump]];
    verify(&ctx, &instruction_data, &[&signer_seeds])?;

    Ok(())
}

fn get_update_asset_accounts<'info>(
    ctx: &Context<'_, '_, '_, 'info, RemovePlugin<'info>>,
    merkle_context: &PackedMerkleContext,
    merkle_tree_root_index: u16,
    asset_id: &[u8; 32],
    plugin_to_remove: Plugin,
    asset_initialized_plugins: u16,
) -> Result<(
    PackedCompressedAccountWithMerkleContext,
    OutputCompressedAccountWithPackedContext,
)> {
    let old_compressed_account = input_compressed_account(
        &AssetV1 {
            key: AccountKey::AssetV1,
            owner: ctx.accounts.owner.key(),
            update_authority: match &ctx.accounts.update_authority {
                Some(update_authority) => UpdateAuthority::Address(update_authority.key()),
                None => UpdateAuthority::None,
            },
            initialized_plugins: asset_initialized_plugins,
        },
        asset_id,
        &crate::ID,
        merkle_context,
        merkle_tree_root_index,
    )?;
    let new_compressed_account = output_compressed_account(
        &AssetV1 {
            key: AccountKey::AssetV1,
            owner: ctx.accounts.owner.key(),
            update_authority: match &ctx.accounts.update_authority {
                Some(update_authority) => UpdateAuthority::Address(update_authority.key()),
                None => UpdateAuthority::None,
            },
            initialized_plugins: plugin_to_remove.clear_plugin(asset_initialized_plugins),
        },
        asset_id,
        &crate::ID,
        merkle_context,
    )?;

    Ok((old_compressed_account, new_compressed_account))
}

#[light_system_accounts]
#[derive(Accounts, LightTraits)]
pub struct RemovePlugin<'info> {
    #[account(mut)]
    #[fee_payer]
    pub payer: Signer<'info>,
    /// CHECK: This can be any valid public key.
    pub update_authority: Option<UncheckedAccount<'info>>,
    /// CHECK: This can be any valid public key.
    pub owner: UncheckedAccount<'info>,
    pub freeze_delegate: Option<Signer<'info>>,

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
