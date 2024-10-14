export type ZkNft = {
  "version": "0.1.0",
  "name": "zk_nft",
  "instructions": [
    {
      "name": "createAsset",
      "accounts": [
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "updateAuthority",
          "isMut": false,
          "isSigner": true,
          "isOptional": true
        },
        {
          "name": "owner",
          "isMut": false,
          "isSigner": false
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
          "name": "proof",
          "type": {
            "defined": "AnchorCompressedProof"
          }
        },
        {
          "name": "addressMerkleTreeRootIndex",
          "type": "u16"
        },
        {
          "name": "randomBytes",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        },
        {
          "name": "pluginsToInit",
          "type": "u16"
        },
        {
          "name": "metadataUri",
          "type": {
            "defined": "MetadataUri"
          }
        }
      ]
    },
    {
      "name": "transfer",
      "accounts": [
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "updateAuthority",
          "isMut": false,
          "isSigner": false,
          "isOptional": true
        },
        {
          "name": "recipient",
          "isMut": false,
          "isSigner": false
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
          "isSigner": false,
          "isOptional": true
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
            "option": {
              "defined": "AnchorCompressedProof"
            }
          }
        },
        {
          "name": "merkleContext",
          "type": {
            "defined": "PackedMerkleContext"
          }
        },
        {
          "name": "merkleTreeRootIndex",
          "type": "u16"
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
          "name": "oldAsset",
          "type": {
            "defined": "TransferAsset"
          }
        }
      ]
    },
    {
      "name": "addPlugin",
      "accounts": [
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "updateAuthority",
          "isMut": false,
          "isSigner": false,
          "isOptional": true
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
        },
        {
          "name": "newPlugin",
          "type": {
            "defined": "Plugin"
          }
        }
      ]
    },
    {
      "name": "removePlugin",
      "accounts": [
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "updateAuthority",
          "isMut": false,
          "isSigner": false,
          "isOptional": true
        },
        {
          "name": "owner",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "freezeDelegate",
          "isMut": false,
          "isSigner": true,
          "isOptional": true
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
          "name": "proof",
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
          "name": "assetLeafIndex",
          "type": "u32"
        },
        {
          "name": "pluginLeafIndex",
          "type": "u32"
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
      "name": "PackedMerkleContext",
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
          },
          {
            "name": "leafIndex",
            "type": "u32"
          },
          {
            "name": "queueIndex",
            "docs": [
              "Index of leaf in queue. Placeholder of batched Merkle tree updates",
              "currently unimplemented."
            ],
            "type": {
              "option": {
                "defined": "QueueIndex"
              }
            }
          }
        ]
      }
    },
    {
      "name": "QueueIndex",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "queueId",
            "docs": [
              "Id of queue in queue account."
            ],
            "type": "u8"
          },
          {
            "name": "index",
            "docs": [
              "Index of compressed account hash in queue."
            ],
            "type": "u16"
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
      "name": "TransferAsset",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "initializedPlugins",
            "type": "u16"
          },
          {
            "name": "owner",
            "type": "publicKey"
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
    },
    {
      "name": "MetadataUri",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "OffChain",
            "fields": [
              "string"
            ]
          },
          {
            "name": "TxHash",
            "fields": [
              "string"
            ]
          }
        ]
      }
    },
    {
      "name": "Plugin",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "TransferDelegateV1",
            "fields": [
              "publicKey"
            ]
          },
          {
            "name": "FreezeDelegateV1",
            "fields": [
              "publicKey"
            ]
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "GroupMaxSizeExceeded",
      "msg": "GroupMaxSizeExceeded"
    },
    {
      "code": 6001,
      "name": "GroupAuthorityOrDelegateMismatch",
      "msg": "GroupAuthorityOrDelegateMismatch"
    },
    {
      "code": 6002,
      "name": "AssetNotMutable",
      "msg": "AssetNotMutable"
    },
    {
      "code": 6003,
      "name": "InvalidAuthority",
      "msg": "Authority is not the owner or delegate"
    },
    {
      "code": 6004,
      "name": "InvalidMerkleTrees",
      "msg": "Invalid merkle trees"
    },
    {
      "code": 6005,
      "name": "PluginAlreadySet",
      "msg": "Plugin is already set"
    },
    {
      "code": 6006,
      "name": "TransferDelegatePluginNotEnabled",
      "msg": "Transfer delegate plugin is not enabled on this asset"
    },
    {
      "code": 6007,
      "name": "AssetIsFrozen",
      "msg": "Asset is frozen"
    },
    {
      "code": 6008,
      "name": "FreezeDelegateNotProvided",
      "msg": "Freeze delegate is not provided"
    },
    {
      "code": 6009,
      "name": "InvalidPluginIndex",
      "msg": "Invalid plugin index provided"
    },
    {
      "code": 6010,
      "name": "InvalidPluginsToInitialize",
      "msg": "Invalid plugins to initialize"
    }
  ]
};

export const IDL: ZkNft = {
  "version": "0.1.0",
  "name": "zk_nft",
  "instructions": [
    {
      "name": "createAsset",
      "accounts": [
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "updateAuthority",
          "isMut": false,
          "isSigner": true,
          "isOptional": true
        },
        {
          "name": "owner",
          "isMut": false,
          "isSigner": false
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
          "name": "proof",
          "type": {
            "defined": "AnchorCompressedProof"
          }
        },
        {
          "name": "addressMerkleTreeRootIndex",
          "type": "u16"
        },
        {
          "name": "randomBytes",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        },
        {
          "name": "pluginsToInit",
          "type": "u16"
        },
        {
          "name": "metadataUri",
          "type": {
            "defined": "MetadataUri"
          }
        }
      ]
    },
    {
      "name": "transfer",
      "accounts": [
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "updateAuthority",
          "isMut": false,
          "isSigner": false,
          "isOptional": true
        },
        {
          "name": "recipient",
          "isMut": false,
          "isSigner": false
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
          "isSigner": false,
          "isOptional": true
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
            "option": {
              "defined": "AnchorCompressedProof"
            }
          }
        },
        {
          "name": "merkleContext",
          "type": {
            "defined": "PackedMerkleContext"
          }
        },
        {
          "name": "merkleTreeRootIndex",
          "type": "u16"
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
          "name": "oldAsset",
          "type": {
            "defined": "TransferAsset"
          }
        }
      ]
    },
    {
      "name": "addPlugin",
      "accounts": [
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "updateAuthority",
          "isMut": false,
          "isSigner": false,
          "isOptional": true
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
        },
        {
          "name": "newPlugin",
          "type": {
            "defined": "Plugin"
          }
        }
      ]
    },
    {
      "name": "removePlugin",
      "accounts": [
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "updateAuthority",
          "isMut": false,
          "isSigner": false,
          "isOptional": true
        },
        {
          "name": "owner",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "freezeDelegate",
          "isMut": false,
          "isSigner": true,
          "isOptional": true
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
          "name": "proof",
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
          "name": "assetLeafIndex",
          "type": "u32"
        },
        {
          "name": "pluginLeafIndex",
          "type": "u32"
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
      "name": "PackedMerkleContext",
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
          },
          {
            "name": "leafIndex",
            "type": "u32"
          },
          {
            "name": "queueIndex",
            "docs": [
              "Index of leaf in queue. Placeholder of batched Merkle tree updates",
              "currently unimplemented."
            ],
            "type": {
              "option": {
                "defined": "QueueIndex"
              }
            }
          }
        ]
      }
    },
    {
      "name": "QueueIndex",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "queueId",
            "docs": [
              "Id of queue in queue account."
            ],
            "type": "u8"
          },
          {
            "name": "index",
            "docs": [
              "Index of compressed account hash in queue."
            ],
            "type": "u16"
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
      "name": "TransferAsset",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "initializedPlugins",
            "type": "u16"
          },
          {
            "name": "owner",
            "type": "publicKey"
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
    },
    {
      "name": "MetadataUri",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "OffChain",
            "fields": [
              "string"
            ]
          },
          {
            "name": "TxHash",
            "fields": [
              "string"
            ]
          }
        ]
      }
    },
    {
      "name": "Plugin",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "TransferDelegateV1",
            "fields": [
              "publicKey"
            ]
          },
          {
            "name": "FreezeDelegateV1",
            "fields": [
              "publicKey"
            ]
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "GroupMaxSizeExceeded",
      "msg": "GroupMaxSizeExceeded"
    },
    {
      "code": 6001,
      "name": "GroupAuthorityOrDelegateMismatch",
      "msg": "GroupAuthorityOrDelegateMismatch"
    },
    {
      "code": 6002,
      "name": "AssetNotMutable",
      "msg": "AssetNotMutable"
    },
    {
      "code": 6003,
      "name": "InvalidAuthority",
      "msg": "Authority is not the owner or delegate"
    },
    {
      "code": 6004,
      "name": "InvalidMerkleTrees",
      "msg": "Invalid merkle trees"
    },
    {
      "code": 6005,
      "name": "PluginAlreadySet",
      "msg": "Plugin is already set"
    },
    {
      "code": 6006,
      "name": "TransferDelegatePluginNotEnabled",
      "msg": "Transfer delegate plugin is not enabled on this asset"
    },
    {
      "code": 6007,
      "name": "AssetIsFrozen",
      "msg": "Asset is frozen"
    },
    {
      "code": 6008,
      "name": "FreezeDelegateNotProvided",
      "msg": "Freeze delegate is not provided"
    },
    {
      "code": 6009,
      "name": "InvalidPluginIndex",
      "msg": "Invalid plugin index provided"
    },
    {
      "code": 6010,
      "name": "InvalidPluginsToInitialize",
      "msg": "Invalid plugins to initialize"
    }
  ]
};