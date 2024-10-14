use anchor_lang::prelude::*;
use borsh::BorshSerialize;
use light_hasher::{DataHasher, Discriminator, Poseidon};
use light_sdk::{
    compressed_account::{CompressedAccount, CompressedAccountData, OutputCompressedAccountWithPackedContext},
    merkle_context::PackedMerkleContext,
};

use super::get_compressed_account;

pub fn output_compressed_account<T>(
    account: &T,
    address: &[u8; 32],
    program_id: &Pubkey,
    merkle_context: &PackedMerkleContext,
) -> Result<OutputCompressedAccountWithPackedContext>
where
    T: BorshSerialize + DataHasher + Discriminator,
{
    let compressed_account = get_compressed_account(account, address, program_id)?;

    Ok(OutputCompressedAccountWithPackedContext {
        compressed_account,
        merkle_tree_index: merkle_context.merkle_tree_pubkey_index,
    })
}

pub fn output_compressed_account_with_discriminator<T>(
    discriminator: &[u8; 8],
    account: &T,
    address: &[u8; 32],
    program_id: &Pubkey,
    merkle_context: &PackedMerkleContext,
) -> Result<OutputCompressedAccountWithPackedContext>
where
    T: BorshSerialize + DataHasher,
{
    let data = account.try_to_vec()?;
    let data_hash = account.hash::<Poseidon>().map_err(ProgramError::from)?;
    let compressed_account_data = CompressedAccountData {
        discriminator: *discriminator,
        data,
        data_hash,
    };

    anchor_lang::prelude::msg!("ADDRESS: {:?}", address);

    let compressed_account = CompressedAccount {
        owner: *program_id,
        lamports: 0,
        address: Some(*address),
        data: Some(compressed_account_data),
    };
    Ok(OutputCompressedAccountWithPackedContext {
        compressed_account,
        merkle_tree_index: merkle_context.merkle_tree_pubkey_index,
    })
}
