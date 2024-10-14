use anchor_lang::prelude::*;

#[error_code]
pub enum ZkNftError {
    #[msg("GroupMaxSizeExceeded")]
    GroupMaxSizeExceeded,
    #[msg("GroupAuthorityOrDelegateMismatch")]
    GroupAuthorityOrDelegateMismatch,
    #[msg("AssetNotMutable")]
    AssetNotMutable,
    #[msg("Authority is not the owner or delegate")]
    InvalidAuthority,
    #[msg("Invalid merkle trees")]
    InvalidMerkleTrees,
    #[msg("Plugin is already set")]
    PluginAlreadySet,
    #[msg("Transfer delegate plugin is not enabled on this asset")]
    TransferDelegatePluginNotEnabled,
    #[msg("Asset is frozen")]
    AssetIsFrozen,
    #[msg("Freeze delegate is not provided")]
    FreezeDelegateNotProvided,
    #[msg("Invalid plugin index provided")]
    InvalidPluginIndex,
    #[msg("Invalid plugins to initialize")]
    InvalidPluginsToInitialize,
}
