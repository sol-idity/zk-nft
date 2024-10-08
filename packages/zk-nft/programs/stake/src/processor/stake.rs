use anchor_lang::prelude::*;
use light_hasher::{DataHasher, Discriminator, Poseidon};
use light_sdk::{
    compressed_account::{
        CompressedAccount, CompressedAccountData, OutputCompressedAccountWithPackedContext,
    },
    light_system_accounts,
    merkle_context::PackedAddressMerkleContext,
    verify::{verify, InstructionDataInvokeCpi},
    LightTraits,
};
use zk_nft::{
    cpi::accounts::AddPlugin,
    processor::{AddPluginAsset, PluginCompressionParams},
    state::{AnchorCompressedProof, MerkleContext, Plugin},
};

use crate::{
    constants::{CPI_AUTHORITY_SEED, FREEZE_DELEGATE_SEED},
    state::StakeRecord,
};

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
    // create stake record
    let stake_record = StakeRecord {
        asset_id: add_plugin_asset.asset_id,
        staker: ctx.accounts.owner.key(),
        collection_id: ctx.accounts.update_authority.key(),
        start_time: Clock::get()?.unix_timestamp,
    };
    let stake_record_data_hash = stake_record
        .hash::<Poseidon>()
        .map_err(ProgramError::from)?;
    let stake_record_compressed_account_data = CompressedAccountData {
        discriminator: StakeRecord::discriminator(),
        data: stake_record.try_to_vec()?,
        data_hash: stake_record_data_hash,
    };
    let stake_record_compressed_account = OutputCompressedAccountWithPackedContext {
        compressed_account: CompressedAccount {
            owner: crate::ID,
            lamports: 0,
            address: None,
            data: Some(stake_record_compressed_account_data),
        },
        merkle_tree_index: merkle_context.merkle_tree_pubkey_index,
    };
    let bump = ctx.bumps.cpi_authority_pda;
    let signer_seeds = [CPI_AUTHORITY_SEED.as_bytes(), &[bump]];
    let light_cpi_inputs = InstructionDataInvokeCpi {
        proof: None,
        new_address_params: vec![],
        relay_fee: None,
        input_compressed_accounts_with_merkle_context: vec![],
        output_compressed_accounts: vec![stake_record_compressed_account],
        compress_or_decompress_lamports: None,
        is_compress: false,
        cpi_context: None,
    };
    verify(&ctx, &light_cpi_inputs, &[&signer_seeds])?;

    // delegate zk-nft to freeze delegate pda
    let freeze_delegate_plugin = Plugin::FreezeDelegateV1(ctx.accounts.freeze_delegate.key());
    let cpi_ctx = ctx.accounts.add_plugin_ctx();
    zk_nft::cpi::add_plugin(
        cpi_ctx.with_remaining_accounts(ctx.remaining_accounts.to_vec()),
        asset_proof,
        plugin_proof,
        plugin_compression_params,
        merkle_context,
        address_merkle_context,
        merkle_tree_root_index,
        asset_leaf_index,
        plugin_leaf_index,
        add_plugin_asset,
        freeze_delegate_plugin,
    )
}

#[light_system_accounts]
#[derive(Accounts, LightTraits)]
pub struct Stake<'info> {
    #[account(mut)]
    #[fee_payer]
    pub payer: Signer<'info>,
    pub owner: Signer<'info>,
    /// CHECK: Checked in light-system-program.
    #[authority]
    #[account(
        seeds = [CPI_AUTHORITY_SEED.as_bytes()],
        bump
    )]
    pub cpi_authority_pda: UncheckedAccount<'info>,
    #[self_program]
    pub self_program: Program<'info, crate::program::Stake>,
    /// CHECK: Checked in account constraints
    #[account(
        seeds = [
            FREEZE_DELEGATE_SEED.as_bytes(),
            update_authority.key().as_ref()
        ],
        bump
    )]
    pub freeze_delegate: UncheckedAccount<'info>,

    // zknft accounts
    pub zk_nft_program: Program<'info, zk_nft::program::ZkNft>,
    /// CHECK: can be any valid public key
    pub update_authority: UncheckedAccount<'info>,
    /// CHECK: Checked in CPI
    pub zk_nft_cpi_authority_pda: UncheckedAccount<'info>,
}

impl<'info> Stake<'info> {
    pub fn add_plugin_ctx(&self) -> CpiContext<'_, '_, '_, 'info, AddPlugin<'info>> {
        let cpi_program = self.zk_nft_program.to_account_info();
        let cpi_accounts = AddPlugin {
            account_compression_authority: self.account_compression_authority.to_account_info(),
            account_compression_program: self.account_compression_program.to_account_info(),
            light_system_program: self.light_system_program.to_account_info(),
            system_program: self.system_program.to_account_info(),
            registered_program_pda: self.registered_program_pda.to_account_info(),
            noop_program: self.noop_program.to_account_info(),
            payer: self.payer.to_account_info(),
            update_authority: Some(self.update_authority.to_account_info()),
            owner: self.owner.to_account_info(),
            cpi_authority_pda: self.zk_nft_cpi_authority_pda.to_account_info(),
            self_program: self.zk_nft_program.to_account_info(),
        };
        CpiContext::new(cpi_program, cpi_accounts)
    }
}
