use anchor_lang::prelude::*;
use borsh::BorshSerialize;
use light_hasher::{
    bytes::AsByteVec, errors::HasherError, DataHasher, Discriminator, Hasher, Poseidon,
};

use crate::{
    constants::{FREEZE_DELEGATE_PLUGIN_POS, TRANSFER_DELEGATE_PLUGIN_POS},
    utils::get_account_seed,
};

use super::{AccountKey, FreezeDelegateV1, TransferDelegateV1};

#[derive(Clone, Copy, Debug, PartialEq, Eq, AnchorSerialize, AnchorDeserialize)]
pub enum Plugin {
    TransferDelegateV1(Pubkey),
    FreezeDelegateV1(Pubkey),
}

impl Plugin {
    fn position(&self) -> u8 {
        match self {
            Plugin::TransferDelegateV1(_) => TRANSFER_DELEGATE_PLUGIN_POS,
            Plugin::FreezeDelegateV1(..) => FREEZE_DELEGATE_PLUGIN_POS,
        }
    }

    pub fn set_plugin(&self, plugin_flags: u16) -> u16 {
        let pos = self.position();
        plugin_flags | (1 << pos)
    }

    pub fn clear_plugin(&self, plugin_flags: u16) -> u16 {
        let pos = self.position();
        plugin_flags & !(1 << pos)
    }

    pub fn get_is_plugin_set(&self, plugin_flags: u16) -> bool {
        let pos = self.position();
        (plugin_flags & (1 << pos)) != 0
    }

    pub fn get_plugin_account_and_discriminator(&self) -> (PluginAccount, [u8; 8]) {
        match self {
            Plugin::TransferDelegateV1(authority) => (
                PluginAccount::TransferDelegateV1(TransferDelegateV1 {
                    key: AccountKey::TransferDelegateV1,
                    authority: *authority,
                }),
                TransferDelegateV1::discriminator(),
            ),
            Plugin::FreezeDelegateV1(authority) => (
                PluginAccount::FreezeDelegateV1(FreezeDelegateV1 {
                    key: AccountKey::FreezeDelegateV1,
                    authority: *authority,
                }),
                FreezeDelegateV1::discriminator(),
            ),
        }
    }

    pub fn get_plugin_seed(&self, asset_id: &[u8; 32]) -> [u8; 32] {
        let key = match self {
            Plugin::TransferDelegateV1(_) => AccountKey::TransferDelegateV1,
            Plugin::FreezeDelegateV1(..) => AccountKey::FreezeDelegateV1,
        };
        get_account_seed(key, asset_id)
    }

    pub fn clear_delegate_plugins(plugin_flags: u16) -> u16 {
        let transfer_delegate_plugin_removed = plugin_flags & !(1 << TRANSFER_DELEGATE_PLUGIN_POS);
        let freeze_delegate_plugin_removed =
            transfer_delegate_plugin_removed & !(1 << FREEZE_DELEGATE_PLUGIN_POS);
        freeze_delegate_plugin_removed
    }
}

pub enum PluginAccount {
    TransferDelegateV1(TransferDelegateV1),
    FreezeDelegateV1(FreezeDelegateV1),
}

impl DataHasher for PluginAccount {
    fn hash<H: Hasher>(&self) -> std::result::Result<[u8; 32], HasherError> {
        match self {
            PluginAccount::TransferDelegateV1(transfer_delegate) => {
                transfer_delegate.hash::<Poseidon>()
            }
            PluginAccount::FreezeDelegateV1(freeze_delegate) => freeze_delegate.hash::<Poseidon>(),
        }
    }
}

impl AsByteVec for PluginAccount {
    fn as_byte_vec(&self) -> Vec<Vec<u8>> {
        match self {
            PluginAccount::TransferDelegateV1(transfer_delegate) => transfer_delegate.as_byte_vec(),
            PluginAccount::FreezeDelegateV1(freeze_delegate) => freeze_delegate.as_byte_vec(),
        }
    }
}

impl BorshSerialize for PluginAccount {
    fn serialize<W: std::io::Write>(&self, writer: &mut W) -> std::io::Result<()> {
        match self {
            PluginAccount::TransferDelegateV1(transfer_delegate) => {
                transfer_delegate.serialize(writer)?;
            }
            PluginAccount::FreezeDelegateV1(freeze_delegate) => {
                freeze_delegate.serialize(writer)?;
            }
        }

        Ok(())
    }
}
