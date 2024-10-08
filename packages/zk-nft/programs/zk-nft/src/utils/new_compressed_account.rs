use anchor_lang::prelude::*;
use borsh::BorshSerialize;
use light_hasher::{DataHasher, Discriminator, Poseidon};
use light_sdk::{
    address::{derive_address, NewAddressParamsPacked},
    compressed_account::{
        serialize_and_hash_account, CompressedAccount, CompressedAccountData,
        OutputCompressedAccountWithPackedContext,
    },
    merkle_context::{PackedAddressMerkleContext, PackedMerkleOutputContext},
    program_merkle_context::unpack_address_merkle_context,
};

pub fn new_compressed_account<T>(
    account: &T,
    address_seed: &[u8; 32],
    program_id: &Pubkey,
    merkle_output_context: &PackedMerkleOutputContext,
    address_merkle_context: &PackedAddressMerkleContext,
    address_merkle_tree_root_index: u16,
    remaining_accounts: &[AccountInfo],
) -> Result<(
    OutputCompressedAccountWithPackedContext,
    NewAddressParamsPacked,
)>
where
    T: BorshSerialize + DataHasher + Discriminator,
{
    let compressed_account = serialize_and_hash_account(
        account,
        address_seed,
        program_id,
        address_merkle_context,
        remaining_accounts,
    )?;

    let compressed_account = OutputCompressedAccountWithPackedContext {
        compressed_account,
        merkle_tree_index: merkle_output_context.merkle_tree_pubkey_index,
    };

    let new_address_params = NewAddressParamsPacked {
        seed: *address_seed,
        address_merkle_tree_account_index: address_merkle_context.address_merkle_tree_pubkey_index,
        address_queue_account_index: address_merkle_context.address_queue_pubkey_index,
        address_merkle_tree_root_index,
    };

    Ok((compressed_account, new_address_params))
}

pub fn new_compressed_account_with_discriminator<T>(
    discriminator: &[u8; 8],
    account: &T,
    address_seed: &[u8; 32],
    program_id: &Pubkey,
    merkle_output_context: &PackedMerkleOutputContext,
    address_merkle_context: &PackedAddressMerkleContext,
    address_merkle_tree_root_index: u16,
    remaining_accounts: &[AccountInfo],
) -> Result<(
    OutputCompressedAccountWithPackedContext,
    NewAddressParamsPacked,
)>
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

    let unpacked_address_merkle_context =
        unpack_address_merkle_context(*address_merkle_context, remaining_accounts);
    let address = derive_address(address_seed, &unpacked_address_merkle_context);
    anchor_lang::prelude::msg!("ADDRESS: {:?}", address);

    let compressed_account = CompressedAccount {
        owner: *program_id,
        lamports: 0,
        address: Some(address),
        data: Some(compressed_account_data),
    };

    let compressed_account = OutputCompressedAccountWithPackedContext {
        compressed_account,
        merkle_tree_index: merkle_output_context.merkle_tree_pubkey_index,
    };

    let new_address_params = NewAddressParamsPacked {
        seed: *address_seed,
        address_merkle_tree_account_index: address_merkle_context.address_merkle_tree_pubkey_index,
        address_queue_account_index: address_merkle_context.address_queue_pubkey_index,
        address_merkle_tree_root_index,
    };

    Ok((compressed_account, new_address_params))
}
