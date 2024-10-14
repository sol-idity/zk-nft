use anchor_lang::prelude::*;
use light_hasher::{DataHasher, Discriminator, Poseidon};
use light_sdk::{
    compressed_account::{
        CompressedAccount, CompressedAccountData, PackedCompressedAccountWithMerkleContext,
    },
    light_system_accounts,
    merkle_context::PackedMerkleContext,
    proof::CompressedProof,
    verify::{verify, InstructionDataInvokeCpi},
    LightTraits,
};
use zk_nft::{
    cpi::accounts::RemovePlugin,
    state::{AnchorCompressedProof, MerkleContext},
};

use crate::{
    constants::{CPI_AUTHORITY_SEED, FREEZE_DELEGATE_SEED},
    state::StakeRecord,
};

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
    // delete stake record
    let old_stake_record = StakeRecord {
        asset_id,
        staker: ctx.accounts.owner.key(),
        collection_id: ctx.accounts.update_authority.key(),
        start_time: stake_start_time,
    };
    let old_stake_record_data_hash = old_stake_record
        .hash::<Poseidon>()
        .map_err(ProgramError::from)?;
    let old_stake_record_compressed_account_data = CompressedAccountData {
        discriminator: StakeRecord::discriminator(),
        data: vec![], // input compressed account data only needs the data hash, safe to exclude the actual data
        data_hash: old_stake_record_data_hash,
    };
    let old_stake_record_compressed_account = PackedCompressedAccountWithMerkleContext {
        compressed_account: CompressedAccount {
            owner: crate::ID,
            lamports: 0,
            address: None,
            data: Some(old_stake_record_compressed_account_data),
        },
        merkle_context: PackedMerkleContext {
            merkle_tree_pubkey_index: merkle_context.merkle_tree_pubkey_index,
            nullifier_queue_pubkey_index: merkle_context.nullifier_queue_pubkey_index,
            leaf_index: stake_record_leaf_index,
            queue_index: None,
        },
        root_index: merkle_tree_root_index,
        read_only: false,
    };
    let bump = ctx.bumps.cpi_authority_pda;
    let signer_seeds = [CPI_AUTHORITY_SEED.as_bytes(), &[bump]];
    let light_cpi_inputs = InstructionDataInvokeCpi {
        proof: Some(CompressedProof {
            a: stake_record_proof.a,
            b: stake_record_proof.b,
            c: stake_record_proof.c,
        }),
        new_address_params: vec![],
        relay_fee: None,
        input_compressed_accounts_with_merkle_context: vec![old_stake_record_compressed_account],
        output_compressed_accounts: vec![],
        compress_or_decompress_lamports: None,
        is_compress: false,
        cpi_context: None,
    };
    verify(&ctx, &light_cpi_inputs, &[&signer_seeds])?;

    // remove delegate plugin
    let freeze_delegate_bump = ctx.bumps.freeze_delegate;
    let update_authority_key = ctx.accounts.update_authority.key();
    let freeze_delegate_signer_seeds = [
        FREEZE_DELEGATE_SEED.as_bytes(),
        update_authority_key.as_ref(),
        &[freeze_delegate_bump],
    ];
    let remove_plugin_ctx = ctx.accounts.remove_plugin_ctx();
    zk_nft::cpi::remove_plugin(
        remove_plugin_ctx
            .with_remaining_accounts(ctx.remaining_accounts.to_vec())
            .with_signer(&[&freeze_delegate_signer_seeds]),
        plugin_proof,
        merkle_context,
        merkle_tree_root_index,
        asset_leaf_index,
        plugin_leaf_index,
        asset_id,
        plugin_index_to_remove,
        asset_initialized_plugins,
    )
}

#[light_system_accounts]
#[derive(Accounts, LightTraits)]
pub struct Unstake<'info> {
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
    pub freeze_delegate: AccountInfo<'info>,

    // zknft accounts
    pub zk_nft_program: Program<'info, zk_nft::program::ZkNft>,
    /// CHECK: can be any valid public key
    pub update_authority: UncheckedAccount<'info>,
    /// CHECK: Checked in CPI
    pub zk_nft_cpi_authority_pda: UncheckedAccount<'info>,
}

impl<'info> Unstake<'info> {
    pub fn remove_plugin_ctx(&self) -> CpiContext<'_, '_, '_, 'info, RemovePlugin<'info>> {
        let cpi_program = self.zk_nft_program.to_account_info();
        let cpi_accounts = RemovePlugin {
            account_compression_authority: self.account_compression_authority.to_account_info(),
            account_compression_program: self.account_compression_program.to_account_info(),
            light_system_program: self.light_system_program.to_account_info(),
            system_program: self.system_program.to_account_info(),
            registered_program_pda: self.registered_program_pda.to_account_info(),
            noop_program: self.noop_program.to_account_info(),
            payer: self.payer.to_account_info(),
            update_authority: Some(self.update_authority.to_account_info()),
            owner: self.owner.to_account_info(),
            freeze_delegate: Some(self.freeze_delegate.to_account_info()),
            cpi_authority_pda: self.zk_nft_cpi_authority_pda.to_account_info(),
            self_program: self.zk_nft_program.to_account_info(),
        };
        CpiContext::new(cpi_program, cpi_accounts)
    }
}
