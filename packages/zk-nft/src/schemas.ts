import * as borsh from "borsh";

export const accountKeySchema: borsh.Schema = {
  enum: [
    {
      struct: {
        uninitializedV1: "u16",
      },
    },
    {
      struct: {
        assetV1: {
          struct: {},
        },
      },
    },
    {
      struct: {
        metadataV1: {
          struct: {},
        },
      },
    },
    {
      struct: {
        transferDelegateV1: {
          struct: {},
        },
      },
    },
    {
      struct: {
        freezeDelegateV1: {
          struct: {},
        },
      },
    },
  ],
};

export const assetSchemaV1: borsh.Schema = {
  struct: {
    key: accountKeySchema,
    owner: { array: { type: "u8", len: 32 } },
    updateAuthorityType: "u8",
    updateAuthority: { array: { type: "u8", len: 32 } },
    initializedPlugins: "u16",
  },
};

export const metadataSchemaV1: borsh.Schema = {
  struct: {
    key: "u8",
    metadataUriType: "u8",
    uri: "string",
    assetId: { array: { type: "u8", len: 32 } },
  },
};

export const freezeDelegateSchemaV1: borsh.Schema = {
  struct: {
    key: accountKeySchema,
    authority: { array: { type: "u8", len: 32 } },
  },
};

export const stakeRecordSchemaV1: borsh.Schema = {
  struct: {
    assetId: { array: { type: "u8", len: 32 } },
    staker: { array: { type: "u8", len: 32 } },
    collectionId: { array: { type: "u8", len: 32 } },
    startTime: "i64",
  },
};
