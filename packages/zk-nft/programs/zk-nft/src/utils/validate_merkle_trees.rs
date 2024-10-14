use anchor_lang::prelude::*;
use light_sdk::pubkey;

use crate::errors::ZkNftError;

pub const MERKLE_TREE_PUBKEY: Pubkey = pubkey!("smt1NamzXdq4AMqS2fS2F1i5KTYPZRhoHgWx38d8WsT");
pub const ADDRESS_MERKLE_TREE_PUBKEY: Pubkey =
    pubkey!("amt1Ayt45jfbdw5YSo7iz6WZxUmnZsQTYXy82hVwyC2");
pub const ADDRESS_QUEUE_PUBKEY: Pubkey = pubkey!("aq1S9z4reTSQAdgWHGD2zDaS39sjGrAxbR31vxJ2F4F");
pub const NULLIFIER_QUEUE_PUBKEY: Pubkey = pubkey!("nfq1NvQDJ2GEgnS8zt9prAe8rjjpAW1zFkrvZoBR148");

pub fn validate_merkle_trees(
    merkle_tree_pubkey_index: u8,
    address_merkle_tree_pubkey_index: Option<u8>,
    address_queue_pubkey_index: Option<u8>,
    nullifier_queue_pubkey_index: Option<u8>,
    remaining_accounts: &[AccountInfo],
) -> Result<()> {
    let merkle_tree_address = &remaining_accounts[merkle_tree_pubkey_index as usize];
    require!(
        merkle_tree_address.key() == MERKLE_TREE_PUBKEY,
        ZkNftError::InvalidMerkleTrees
    );

    match address_merkle_tree_pubkey_index {
        Some(index) => {
            let address_merkle_tree_address = &remaining_accounts[index as usize];
            require!(
                address_merkle_tree_address.key() == ADDRESS_MERKLE_TREE_PUBKEY,
                ZkNftError::InvalidMerkleTrees
            );
        }
        None => {}
    }

    match address_queue_pubkey_index {
        Some(index) => {
            let address_queue_address = &remaining_accounts[index as usize];
            require!(
                address_queue_address.key() == ADDRESS_QUEUE_PUBKEY,
                ZkNftError::InvalidMerkleTrees
            );
        }
        None => {}
    }

    match nullifier_queue_pubkey_index {
        Some(index) => {
            let nullifier_queue_address = &remaining_accounts[index as usize];
            require!(
                nullifier_queue_address.key() == NULLIFIER_QUEUE_PUBKEY,
                ZkNftError::InvalidMerkleTrees
            );
        }
        None => {}
    }

    Ok(())
}
