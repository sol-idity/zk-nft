use anchor_lang::prelude::*;
use borsh::BorshSerialize;
use light_hasher::{DataHasher, Discriminator, Poseidon};
use light_sdk::compressed_account::{CompressedAccount, CompressedAccountData};

pub fn get_compressed_account<T>(
    account: &T,
    address: &[u8; 32],
    program_id: &Pubkey,
) -> Result<CompressedAccount>
where
    T: BorshSerialize + DataHasher + Discriminator,
{
    let data = account.try_to_vec()?;
    let data_hash = account.hash::<Poseidon>().map_err(ProgramError::from)?;
    let compressed_account_data = CompressedAccountData {
        discriminator: T::discriminator(),
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

    Ok(compressed_account)
}
