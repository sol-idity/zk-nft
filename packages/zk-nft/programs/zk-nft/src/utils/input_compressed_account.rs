use anchor_lang::prelude::*;
use borsh::BorshSerialize;
use light_hasher::{DataHasher, Discriminator};
use light_sdk::{
    compressed_account::{
        CompressedAccount, CompressedAccountData, PackedCompressedAccountWithMerkleContext,
    },
    merkle_context::PackedMerkleContext,
};

use super::get_compressed_account;

pub fn input_compressed_account<T>(
    account: &T,
    address: &[u8; 32],
    program_id: &Pubkey,
    merkle_context: &PackedMerkleContext,
    merkle_tree_root_index: u16,
) -> Result<PackedCompressedAccountWithMerkleContext>
where
    T: BorshSerialize + DataHasher + Discriminator,
{
    let compressed_account = get_compressed_account(account, address, program_id)?;

    Ok(PackedCompressedAccountWithMerkleContext {
        compressed_account,
        merkle_context: *merkle_context,
        root_index: merkle_tree_root_index,
        read_only: false,
    })
}

pub fn input_compressed_account_from_hash(
    discriminator: &[u8; 8],
    data_hash: &[u8; 32],
    address: &[u8; 32],
    program_id: &Pubkey,
    merkle_context: &PackedMerkleContext,
    merkle_tree_root_index: u16,
) -> Result<PackedCompressedAccountWithMerkleContext> {
    let compressed_account_data = CompressedAccountData {
        discriminator: *discriminator,
        data: vec![], // data is not needed for input compressed account, only data hash and discriminator are checked when verifying inclusion proof
        data_hash: *data_hash,
    };
    let compressed_account = CompressedAccount {
        owner: *program_id,
        lamports: 0,
        address: Some(*address),
        data: Some(compressed_account_data),
    };

    Ok(PackedCompressedAccountWithMerkleContext {
        compressed_account,
        merkle_context: *merkle_context,
        root_index: merkle_tree_root_index,
        read_only: false,
    })
}
