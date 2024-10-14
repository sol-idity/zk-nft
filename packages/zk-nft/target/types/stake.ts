export type Stake = {
  "version": "0.1.0",
  "name": "stake",
  "instructions": [
    {
      "name": "stake",
      "accounts": [
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "owner",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "cpiAuthorityPda",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "selfProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "freezeDelegate",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "zkNftProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "updateAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "zkNftCpiAuthorityPda",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "lightSystemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "accountCompressionProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "registeredProgramPda",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "noopProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "accountCompressionAuthority",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "assetProof",
          "type": {
            "defined": "AnchorCompressedProof"
          }
        },
        {
          "name": "pluginProof",
          "type": {
            "defined": "AnchorCompressedProof"
          }
        },
        {
          "name": "pluginCompressionParams",
          "type": {
            "defined": "PluginCompressionParams"
          }
        },
        {
          "name": "merkleContext",
          "type": {
            "defined": "MerkleContext"
          }
        },
        {
          "name": "addressMerkleContext",
          "type": {
            "defined": "PackedAddressMerkleContext"
          }
        },
        {
          "name": "merkleTreeRootIndex",
          "type": "u16"
        },
        {
          "name": "assetLeafIndex",
          "type": "u32"
        },
        {
          "name": "pluginLeafIndex",
          "type": "u32"
        },
        {
          "name": "addPluginAsset",
          "type": {
            "defined": "AddPluginAsset"
          }
        }
      ]
    },
    {
      "name": "unstake",
      "accounts": [
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "owner",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "cpiAuthorityPda",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "selfProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "freezeDelegate",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "zkNftProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "updateAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "zkNftCpiAuthorityPda",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "lightSystemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "accountCompressionProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "registeredProgramPda",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "noopProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "accountCompressionAuthority",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "stakeRecordProof",
          "type": {
            "defined": "AnchorCompressedProof"
          }
        },
        {
          "name": "pluginProof",
          "type": {
            "defined": "AnchorCompressedProof"
          }
        },
        {
          "name": "merkleContext",
          "type": {
            "defined": "MerkleContext"
          }
        },
        {
          "name": "merkleTreeRootIndex",
          "type": "u16"
        },
        {
          "name": "stakeRecordLeafIndex",
          "type": "u32"
        },
        {
          "name": "assetLeafIndex",
          "type": "u32"
        },
        {
          "name": "pluginLeafIndex",
          "type": "u32"
        },
        {
          "name": "stakeStartTime",
          "type": "i64"
        },
        {
          "name": "assetId",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        },
        {
          "name": "pluginIndexToRemove",
          "type": "u16"
        },
        {
          "name": "assetInitializedPlugins",
          "type": "u16"
        }
      ]
    }
  ],
  "types": [
    {
      "name": "PackedAddressMerkleContext",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "addressMerkleTreePubkeyIndex",
            "type": "u8"
          },
          {
            "name": "addressQueuePubkeyIndex",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "AddPluginAsset",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "assetId",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "key",
            "type": {
              "defined": "AccountKey"
            }
          },
          {
            "name": "initializedPlugins",
            "type": "u16"
          }
        ]
      }
    },
    {
      "name": "PluginCompressionParams",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "UninitializedAddress",
            "fields": [
              "u16"
            ]
          },
          {
            "name": "InitializedAddress",
            "fields": [
              "bytes"
            ]
          }
        ]
      }
    },
    {
      "name": "AccountKey",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "UninitializedV1",
            "fields": [
              "u16"
            ]
          },
          {
            "name": "AssetV1"
          },
          {
            "name": "MetadataV1"
          },
          {
            "name": "TransferDelegateV1"
          },
          {
            "name": "FreezeDelegateV1"
          }
        ]
      }
    },
    {
      "name": "AnchorCompressedProof",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "a",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "b",
            "type": {
              "array": [
                "u8",
                64
              ]
            }
          },
          {
            "name": "c",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          }
        ]
      }
    },
    {
      "name": "MerkleContext",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "merkleTreePubkeyIndex",
            "type": "u8"
          },
          {
            "name": "nullifierQueuePubkeyIndex",
            "type": "u8"
          }
        ]
      }
    }
  ]
};

export const IDL: Stake = {
  "version": "0.1.0",
  "name": "stake",
  "instructions": [
    {
      "name": "stake",
      "accounts": [
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "owner",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "cpiAuthorityPda",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "selfProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "freezeDelegate",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "zkNftProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "updateAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "zkNftCpiAuthorityPda",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "lightSystemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "accountCompressionProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "registeredProgramPda",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "noopProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "accountCompressionAuthority",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "assetProof",
          "type": {
            "defined": "AnchorCompressedProof"
          }
        },
        {
          "name": "pluginProof",
          "type": {
            "defined": "AnchorCompressedProof"
          }
        },
        {
          "name": "pluginCompressionParams",
          "type": {
            "defined": "PluginCompressionParams"
          }
        },
        {
          "name": "merkleContext",
          "type": {
            "defined": "MerkleContext"
          }
        },
        {
          "name": "addressMerkleContext",
          "type": {
            "defined": "PackedAddressMerkleContext"
          }
        },
        {
          "name": "merkleTreeRootIndex",
          "type": "u16"
        },
        {
          "name": "assetLeafIndex",
          "type": "u32"
        },
        {
          "name": "pluginLeafIndex",
          "type": "u32"
        },
        {
          "name": "addPluginAsset",
          "type": {
            "defined": "AddPluginAsset"
          }
        }
      ]
    },
    {
      "name": "unstake",
      "accounts": [
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "owner",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "cpiAuthorityPda",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "selfProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "freezeDelegate",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "zkNftProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "updateAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "zkNftCpiAuthorityPda",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "lightSystemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "accountCompressionProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "registeredProgramPda",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "noopProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "accountCompressionAuthority",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "stakeRecordProof",
          "type": {
            "defined": "AnchorCompressedProof"
          }
        },
        {
          "name": "pluginProof",
          "type": {
            "defined": "AnchorCompressedProof"
          }
        },
        {
          "name": "merkleContext",
          "type": {
            "defined": "MerkleContext"
          }
        },
        {
          "name": "merkleTreeRootIndex",
          "type": "u16"
        },
        {
          "name": "stakeRecordLeafIndex",
          "type": "u32"
        },
        {
          "name": "assetLeafIndex",
          "type": "u32"
        },
        {
          "name": "pluginLeafIndex",
          "type": "u32"
        },
        {
          "name": "stakeStartTime",
          "type": "i64"
        },
        {
          "name": "assetId",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        },
        {
          "name": "pluginIndexToRemove",
          "type": "u16"
        },
        {
          "name": "assetInitializedPlugins",
          "type": "u16"
        }
      ]
    }
  ],
  "types": [
    {
      "name": "PackedAddressMerkleContext",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "addressMerkleTreePubkeyIndex",
            "type": "u8"
          },
          {
            "name": "addressQueuePubkeyIndex",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "AddPluginAsset",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "assetId",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "key",
            "type": {
              "defined": "AccountKey"
            }
          },
          {
            "name": "initializedPlugins",
            "type": "u16"
          }
        ]
      }
    },
    {
      "name": "PluginCompressionParams",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "UninitializedAddress",
            "fields": [
              "u16"
            ]
          },
          {
            "name": "InitializedAddress",
            "fields": [
              "bytes"
            ]
          }
        ]
      }
    },
    {
      "name": "AccountKey",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "UninitializedV1",
            "fields": [
              "u16"
            ]
          },
          {
            "name": "AssetV1"
          },
          {
            "name": "MetadataV1"
          },
          {
            "name": "TransferDelegateV1"
          },
          {
            "name": "FreezeDelegateV1"
          }
        ]
      }
    },
    {
      "name": "AnchorCompressedProof",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "a",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "b",
            "type": {
              "array": [
                "u8",
                64
              ]
            }
          },
          {
            "name": "c",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          }
        ]
      }
    },
    {
      "name": "MerkleContext",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "merkleTreePubkeyIndex",
            "type": "u8"
          },
          {
            "name": "nullifierQueuePubkeyIndex",
            "type": "u8"
          }
        ]
      }
    }
  ]
};
