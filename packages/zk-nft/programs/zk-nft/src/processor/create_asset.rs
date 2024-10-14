use crate::constants::CPI_AUTHORITY_SEED;
use crate::errors::ZkNftError;
use crate::state::{AccountKey, AssetV1};
use crate::utils::validate_merkle_trees;
use crate::utils::{get_account_seed, new_compressed_account};
use crate::{AnchorCompressedProof, UpdateAuthority};
use crate::{MetadataUri, MetadataV1};
use anchor_lang::prelude::*;
use light_sdk::merkle_context::{PackedAddressMerkleContext, PackedMerkleOutputContext};
use light_sdk::proof::CompressedProof;
use light_sdk::utils::create_cpi_inputs_for_new_account;
use light_sdk::verify::verify;
use light_sdk::{light_system_accounts, LightTraits};

pub fn create_asset<'info>(
    ctx: Context<'_, '_, '_, 'info, CreateAsset<'info>>,
    proof: AnchorCompressedProof,
    address_merkle_tree_root_index: u16,
    random_bytes: [u8; 32],
    plugins_to_init: u16,
    metadata_uri: MetadataUri,
) -> Result<()> {
    let merkle_output_context = PackedMerkleOutputContext {
        merkle_tree_pubkey_index: 0,
    };
    let address_merkle_context = PackedAddressMerkleContext {
        address_merkle_tree_pubkey_index: 1,
        address_queue_pubkey_index: 2,
    };
    validate_merkle_trees(0, Some(1), Some(2), None, ctx.remaining_accounts)?;

    // we have only 2 possible plugins to initialize for now
    require!(
        plugins_to_init <= 0b11,
        ZkNftError::InvalidPluginsToInitialize
    );
    let asset = AssetV1 {
        key: if plugins_to_init > 0 {
            AccountKey::UninitializedV1(plugins_to_init)
        } else {
            AccountKey::AssetV1
        },
        owner: ctx.accounts.owner.key(),
        update_authority: match &ctx.accounts.update_authority {
            Some(update_authority) => UpdateAuthority::Address(update_authority.key()),
            None => UpdateAuthority::None,
        },
        initialized_plugins: 0,
    };

    let asset_seed = get_account_seed(AccountKey::AssetV1, &random_bytes);
    let (asset_compressed_account, asset_new_address_params) = new_compressed_account(
        &asset,
        &asset_seed,
        &crate::ID,
        &merkle_output_context,
        &address_merkle_context,
        address_merkle_tree_root_index,
        ctx.remaining_accounts,
    )?;

    let asset_id = asset_compressed_account.compressed_account.address.unwrap();

    let metadata_seed = get_account_seed(AccountKey::MetadataV1, &asset_id);
    let metadata = MetadataV1 {
        key: AccountKey::MetadataV1,
        uri: metadata_uri,
        asset_id: asset_id.into(),
    };
    let (metadata_compressed_account, metadata_new_address_params) = new_compressed_account(
        &metadata,
        &metadata_seed,
        &crate::ID,
        &merkle_output_context,
        &address_merkle_context,
        address_merkle_tree_root_index,
        ctx.remaining_accounts,
    )?;

    let bump = ctx.bumps.cpi_authority_pda;
    let signer_seeds = [CPI_AUTHORITY_SEED.as_bytes(), &[bump]];

    // create accounts
    let mut cpi_inputs = create_cpi_inputs_for_new_account(
        CompressedProof {
            a: proof.a,
            b: proof.b,
            c: proof.c,
        },
        asset_new_address_params,
        asset_compressed_account,
        None,
    );
    cpi_inputs
        .new_address_params
        .push(metadata_new_address_params);
    cpi_inputs
        .output_compressed_accounts
        .push(metadata_compressed_account);
    verify(&ctx, &cpi_inputs, &[&signer_seeds])?;

    Ok(())
}

#[light_system_accounts]
#[derive(Accounts, LightTraits)]
pub struct CreateAsset<'info> {
    #[account(mut)]
    #[fee_payer]
    pub payer: Signer<'info>,
    pub update_authority: Option<Signer<'info>>,
    /// CHECK: This can be any valid public key.
    pub owner: UncheckedAccount<'info>,

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
