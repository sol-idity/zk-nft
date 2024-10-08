import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { ZkNft } from "../target/types/zk_nft";
import {
  CompressedAccountWithMerkleContext,
  LightSystemProgram,
  NewAddressParams,
  Rpc,
  bn,
  buildAndSignTx,
  createAccount,
  createRpc,
  defaultStaticAccountsStruct,
  defaultTestStateTreeAccounts,
  deriveAddress,
  hashToBn254FieldSizeBe,
  packCompressedAccounts,
  packNewAddressParams,
  sendAndConfirmTx,
} from "@lightprotocol/stateless.js";
import fs from "fs";
import { expect } from "chai";
import { Connection, Keypair, SendTransactionError } from "@solana/web3.js";
import idl from "../target/idl/zk_nft.json";
import * as borsh from "borsh";

import "dotenv/config";
import { bs58 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";
import { assetSchemaV1, metadataSchemaV1 } from "../src";
import { freezeDelegateSchemaV1, stakeRecordSchemaV1 } from "../src/schemas";
import { Stake } from "../target/types/stake";
import stakeIdl from "../target/idl/stake.json";

const { PublicKey } = anchor.web3;

const keypair = anchor.web3.Keypair.fromSecretKey(
  Uint8Array.from(
    JSON.parse(fs.readFileSync("target/deploy/authority-keypair.json", "utf-8"))
  )
);

const setComputeUnitLimitIx =
  anchor.web3.ComputeBudgetProgram.setComputeUnitLimit({
    units: 900_000,
  });
const setComputeUnitPriceIx =
  anchor.web3.ComputeBudgetProgram.setComputeUnitPrice({
    microLamports: 1,
  });

describe("zk-nft", () => {
  // Configure the client to use the local cluster.
  const program = new Program<ZkNft>(
    idl as any,
    // "zkN5FTcJzrwp2c9G4fL3qXo9tnVhiACG3xzoP3tV3Hh",
    "zkNFTi24GW95YYfM8jNM2tDDPmDnDm7EQuze8jJ66sn",
    new anchor.AnchorProvider(
      // new Connection(process.env.MAINNET_RPC as string, {
      //   commitment: "confirmed",
      // }),
      new Connection("http://localhost:8899", {
        commitment: "confirmed",
      }),
      new anchor.Wallet(keypair),
      {
        commitment: "confirmed",
      }
    )
  );

  const stakeProgram = new Program<Stake>(
    stakeIdl as any,
    "stk3g78wHcLTHgAqedaaxpqAvaDDRkxFj4qY4ew3CG4",
    new anchor.AnchorProvider(
      new Connection("http://localhost:8899", {
        commitment: "confirmed",
      }),
      new anchor.Wallet(keypair),
      {
        commitment: "confirmed",
      }
    )
  );

  const connection: Rpc = createRpc(
    program.provider.connection.rpcEndpoint,
    // program.provider.connection.rpcEndpoint,
    undefined,
    undefined,
    {
      commitment: "confirmed",
    }
  );

  it.skip("Can create compressed account", async () => {
    const seed = Keypair.generate().publicKey.toBytes();

    const txSig = await createAccount(
      connection,
      keypair,
      seed,
      program.programId,
      undefined,
      undefined,
      undefined
    );

    console.log("Your transaction signature", txSig);
  });

  const LOOKUP_TABLE_ADDRESS = // new PublicKey("Dh74qoNrgMYzk4ZFZenKS2f9gSA9AqXrcgYzyBia1r3W") // prod lookup table
    new PublicKey("3UQtx7pqXu2jZADF8YW3uaFq7EzASs55rZzxSRCibqb7"); // dev lookup table
  const METADATA_URIS = [
    "https://files.tinys.pl/zkN5FTcJzrwp2c9G4fL3qXo9tnVhiACG3xzoP3tV3Hh/1.json",
    "https://files.tinys.pl/zkN5FTcJzrwp2c9G4fL3qXo9tnVhiACG3xzoP3tV3Hh/2.json",
    "https://files.tinys.pl/zkN5FTcJzrwp2c9G4fL3qXo9tnVhiACG3xzoP3tV3Hh/3.json",
    "https://files.tinys.pl/zkN5FTcJzrwp2c9G4fL3qXo9tnVhiACG3xzoP3tV3Hh/4.json",
    "https://files.tinys.pl/zkN5FTcJzrwp2c9G4fL3qXo9tnVhiACG3xzoP3tV3Hh/5.json",
    "https://files.tinys.pl/zkN5FTcJzrwp2c9G4fL3qXo9tnVhiACG3xzoP3tV3Hh/6.json",
    "https://files.tinys.pl/zkN5FTcJzrwp2c9G4fL3qXo9tnVhiACG3xzoP3tV3Hh/7.json",
    "https://files.tinys.pl/zkN5FTcJzrwp2c9G4fL3qXo9tnVhiACG3xzoP3tV3Hh/8.json",
    "https://files.tinys.pl/zkN5FTcJzrwp2c9G4fL3qXo9tnVhiACG3xzoP3tV3Hh/9.json",
    "https://files.tinys.pl/zkN5FTcJzrwp2c9G4fL3qXo9tnVhiACG3xzoP3tV3Hh/10.json",
    "https://files.tinys.pl/zkN5FTcJzrwp2c9G4fL3qXo9tnVhiACG3xzoP3tV3Hh/11.json",
    "https://files.tinys.pl/zkN5FTcJzrwp2c9G4fL3qXo9tnVhiACG3xzoP3tV3Hh/12.json",
    "https://files.tinys.pl/zkN5FTcJzrwp2c9G4fL3qXo9tnVhiACG3xzoP3tV3Hh/13.json",
    "https://files.tinys.pl/zkN5FTcJzrwp2c9G4fL3qXo9tnVhiACG3xzoP3tV3Hh/14.json",
    "https://files.tinys.pl/zkN5FTcJzrwp2c9G4fL3qXo9tnVhiACG3xzoP3tV3Hh/15.json",
    "https://files.tinys.pl/zkN5FTcJzrwp2c9G4fL3qXo9tnVhiACG3xzoP3tV3Hh/16.json",
    "https://files.tinys.pl/zkN5FTcJzrwp2c9G4fL3qXo9tnVhiACG3xzoP3tV3Hh/17.json",
    "https://files.tinys.pl/zkN5FTcJzrwp2c9G4fL3qXo9tnVhiACG3xzoP3tV3Hh/18.json",
    "https://files.tinys.pl/zkN5FTcJzrwp2c9G4fL3qXo9tnVhiACG3xzoP3tV3Hh/19.json",
    "https://files.tinys.pl/zkN5FTcJzrwp2c9G4fL3qXo9tnVhiACG3xzoP3tV3Hh/20.json",
    "https://files.tinys.pl/zkN5FTcJzrwp2c9G4fL3qXo9tnVhiACG3xzoP3tV3Hh/21.json",
    "https://files.tinys.pl/zkN5FTcJzrwp2c9G4fL3qXo9tnVhiACG3xzoP3tV3Hh/22.json",
    "https://files.tinys.pl/zkN5FTcJzrwp2c9G4fL3qXo9tnVhiACG3xzoP3tV3Hh/23.json",
    "https://files.tinys.pl/zkN5FTcJzrwp2c9G4fL3qXo9tnVhiACG3xzoP3tV3Hh/24.json",
    "https://files.tinys.pl/zkN5FTcJzrwp2c9G4fL3qXo9tnVhiACG3xzoP3tV3Hh/25.json",
    "https://files.tinys.pl/zkN5FTcJzrwp2c9G4fL3qXo9tnVhiACG3xzoP3tV3Hh/26.json",
    "https://files.tinys.pl/zkN5FTcJzrwp2c9G4fL3qXo9tnVhiACG3xzoP3tV3Hh/27.json",
    "https://files.tinys.pl/zkN5FTcJzrwp2c9G4fL3qXo9tnVhiACG3xzoP3tV3Hh/28.json",
    "https://files.tinys.pl/zkN5FTcJzrwp2c9G4fL3qXo9tnVhiACG3xzoP3tV3Hh/29.json",
    "https://files.tinys.pl/zkN5FTcJzrwp2c9G4fL3qXo9tnVhiACG3xzoP3tV3Hh/30.json",
    "https://files.tinys.pl/zkN5FTcJzrwp2c9G4fL3qXo9tnVhiACG3xzoP3tV3Hh/31.json",
    "https://files.tinys.pl/zkN5FTcJzrwp2c9G4fL3qXo9tnVhiACG3xzoP3tV3Hh/32.json",
  ];

  const updateAuthority = Keypair.generate();
  // const updateAuthority = Keypair.fromSecretKey(
  //   Uint8Array.from(
  //     JSON.parse(
  //       fs.readFileSync("target/deploy/update-authority-keypair.json", "utf-8")
  //     )
  //   )
  // );
  const randomBytes = Keypair.generate().publicKey.toBytes();
  const recipient = Keypair.generate();
  // const recipient = keypair;
  const METADATA_URI =
    METADATA_URIS[Math.floor(Math.random() * METADATA_URIS.length)];
  it("Can create asset", async () => {
    const addressTree = defaultTestStateTreeAccounts().addressTree;
    const addressQueue = defaultTestStateTreeAccounts().addressQueue;
    const assetSeed = await hashToBn254FieldSizeBe(
      Buffer.from([1, ...program.programId.toBytes(), ...randomBytes])
    );
    const assetAddress = await deriveAddress(assetSeed[0], addressTree);

    const metadataSeed = await hashToBn254FieldSizeBe(
      Buffer.from([
        2,
        ...program.programId.toBytes(),
        ...assetAddress.toBytes(),
      ])
    );
    const metadataAddress = await deriveAddress(metadataSeed[0], addressTree);

    const proof = await connection.getValidityProofV0(undefined, [
      {
        address: bn(assetAddress.toBytes()),
        tree: addressTree,
        queue: addressQueue,
      },
      {
        address: bn(metadataAddress.toBytes()),
        tree: addressTree,
        queue: addressQueue,
      },
    ]);

    const newAddressParams: NewAddressParams = {
      seed: assetSeed[0],
      addressMerkleTreeRootIndex: proof.rootIndices[0],
      addressMerkleTreePubkey: proof.merkleTrees[0],
      addressQueuePubkey: proof.nullifierQueues[0],
    };

    const outputCompressedAccounts =
      LightSystemProgram.createNewAddressOutputState(
        Array.from(assetAddress.toBytes()),
        program.programId
      );
    const { remainingAccounts: _remainingAccounts } = packCompressedAccounts(
      [],
      [],
      outputCompressedAccounts
    );

    const { newAddressParamsPacked, remainingAccounts } = packNewAddressParams(
      [newAddressParams],
      _remainingAccounts
    );

    const {
      accountCompressionAuthority,
      noopProgram,
      registeredProgramPda,
      accountCompressionProgram,
    } = defaultStaticAccountsStruct();

    const ix = await program.methods
      .createAsset(
        {
          a: proof.compressedProof.a,
          b: proof.compressedProof.b,
          c: proof.compressedProof.c,
        },
        newAddressParamsPacked[0].addressMerkleTreeRootIndex,
        Array.from(randomBytes),
        0,
        {
          offChain: {
            0: METADATA_URI,
          },
        }
      )
      .accounts({
        payer: keypair.publicKey,
        updateAuthority: updateAuthority.publicKey,
        owner: recipient.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
        cpiAuthorityPda: PublicKey.findProgramAddressSync(
          [Buffer.from("cpi_authority")],
          program.programId
        )[0],
        selfProgram: program.programId,
        lightSystemProgram: LightSystemProgram.programId,
        accountCompressionAuthority,
        accountCompressionProgram,
        noopProgram,
        registeredProgramPda,
      })
      .remainingAccounts(
        remainingAccounts.map((account) => ({
          pubkey: account,
          isSigner: false,
          isWritable: true,
        }))
      )
      .instruction();

    // const lookupTable = (
    //   await connection.getAddressLookupTable(LOOKUP_TABLE_ADDRESS)
    // ).value;
    const blockhash = await connection.getLatestBlockhash();
    const tx = buildAndSignTx(
      [setComputeUnitLimitIx, setComputeUnitPriceIx, ix],
      keypair,
      blockhash.blockhash,
      [updateAuthority]
      // [lookupTable]
    );

    console.log("txSize:", tx.serialize().byteLength);

    const signature = await sendAndConfirmTx(connection, tx, {
      commitment: "confirmed",
    });

    console.log("Your transaction signature", signature);
    console.log("asset id:", assetAddress.toBase58());
    console.log("owner:", recipient.publicKey.toBase58());
  });

  it("can fetch asset and asset metadata by owner", async () => {
    const assets = await connection.getCompressedAccountsByOwner(
      program.programId,
      {
        filters: [
          {
            memcmp: {
              bytes: bs58.encode([1]),
              offset: 0,
            },
          },
          {
            memcmp: {
              bytes: recipient.publicKey.toBase58(),
              offset: 1,
            },
          },
        ],
      }
    );

    const newlyCreatedAsset = assets.items.find((asset) => {
      const decoded: any = borsh.deserialize(assetSchemaV1, asset.data.data);
      const owner = new PublicKey(Uint8Array.from(decoded.owner)).toBase58();
      const isFound = owner === recipient.publicKey.toBase58();
      if (isFound) {
        console.log("asset:", {
          ...decoded,
          owner,
          updateAuthority: new PublicKey(
            Uint8Array.from(decoded.updateAuthority)
          ).toBase58(),
          collectionInfo: {
            assetId: new PublicKey(Uint8Array.from(asset.address)).toBase58(),
            updateAuthority: updateAuthority.publicKey.toBase58(),
          },
        });
      }
      return isFound;
    });

    expect(newlyCreatedAsset).to.not.be.undefined;

    const metadataSeed = await hashToBn254FieldSizeBe(
      Buffer.from([
        2,
        ...program.programId.toBytes(),
        ...newlyCreatedAsset.address,
      ])
    );
    const addressTree = defaultTestStateTreeAccounts().addressTree;
    const metadataAddress = await deriveAddress(metadataSeed[0], addressTree);
    const metadataAccount = await connection.getCompressedAccount(
      bn(metadataAddress.toBytes())
    );
    const metadata: any = borsh.deserialize(
      metadataSchemaV1,
      metadataAccount.data.data
    );
    console.log("metadata:", {
      ...metadata,
      assetId: new PublicKey(Uint8Array.from(metadata.assetId)).toBase58(),
    });
    expect(metadata.uri).to.equal(METADATA_URI);
  });

  const recipient2 = Keypair.generate();
  it("can transfer asset", async () => {
    const assets = await connection.getCompressedAccountsByOwner(
      program.programId,
      {
        filters: [
          {
            memcmp: {
              bytes: bs58.encode([1]),
              offset: 0,
            },
          },
          {
            memcmp: {
              bytes: recipient.publicKey.toBase58(),
              offset: 1,
            },
          },
        ],
      }
    );

    const addressTree = defaultTestStateTreeAccounts().addressTree;
    const addressQueue = defaultTestStateTreeAccounts().addressQueue;
    const merkleTree = defaultTestStateTreeAccounts().merkleTree;
    const nullifierQueue = defaultTestStateTreeAccounts().nullifierQueue;

    const asset = assets.items[0];
    const assetProof = await connection.getValidityProofV0(
      [
        {
          hash: bn(Uint8Array.from(asset.hash)),
          tree: addressTree,
          queue: addressQueue,
        },
      ],
      undefined
    );

    const inputCompressedAccount: CompressedAccountWithMerkleContext = {
      merkleTree,
      nullifierQueue,
      hash: asset.hash,
      leafIndex: asset.leafIndex,
      readOnly: false,
      owner: asset.owner,
      lamports: asset.lamports,
      address: asset.address,
      data: asset.data,
    };

    const { packedInputCompressedAccounts, remainingAccounts } =
      packCompressedAccounts(
        [inputCompressedAccount],
        assetProof.rootIndices,
        []
      );

    const decodedAsset: any = borsh.deserialize(assetSchemaV1, asset.data.data);
    const {
      accountCompressionAuthority,
      noopProgram,
      registeredProgramPda,
      accountCompressionProgram,
    } = defaultStaticAccountsStruct();
    const ix = await program.methods
      .transfer(
        {
          a: assetProof.compressedProof.a,
          b: assetProof.compressedProof.b,
          c: assetProof.compressedProof.c,
        },
        null,
        {
          leafIndex: asset.leafIndex,
          merkleTreePubkeyIndex:
            packedInputCompressedAccounts[0].merkleContext
              .merkleTreePubkeyIndex,
          nullifierQueuePubkeyIndex:
            packedInputCompressedAccounts[0].merkleContext
              .nullifierQueuePubkeyIndex,
          queueIndex: packedInputCompressedAccounts[0].merkleContext.queueIndex,
        },
        packedInputCompressedAccounts[0].rootIndex,
        asset.address,
        {
          initializedPlugins: decodedAsset.initializedPlugins,
          owner: recipient.publicKey,
        }
      )
      .accounts({
        payer: keypair.publicKey,
        authority: recipient.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
        updateAuthority: updateAuthority.publicKey,
        cpiAuthorityPda: PublicKey.findProgramAddressSync(
          [Buffer.from("cpi_authority")],
          program.programId
        )[0],
        accountCompressionAuthority,
        accountCompressionProgram,
        noopProgram,
        registeredProgramPda,
        selfProgram: program.programId,
        lightSystemProgram: LightSystemProgram.programId,
        recipient: recipient2.publicKey,
        freezeDelegate: null,
      })
      .remainingAccounts(
        remainingAccounts.map((account) => ({
          pubkey: account,
          isSigner: false,
          isWritable: true,
        }))
      )
      .instruction();

    const blockhash = await connection.getLatestBlockhash();
    // const lookupTable = (
    //   await connection.getAddressLookupTable(LOOKUP_TABLE_ADDRESS)
    // ).value;
    const tx = buildAndSignTx(
      [setComputeUnitLimitIx, setComputeUnitPriceIx, ix],
      keypair,
      blockhash.blockhash,
      [recipient]
      // [lookupTable]
    );

    console.log("txSize:", tx.serialize().byteLength);

    const signature = await sendAndConfirmTx(connection, tx, {
      commitment: "confirmed",
    });

    console.log("Your transaction signature", signature);

    const transferredAssets = await connection.getCompressedAccountsByOwner(
      program.programId,
      {
        filters: [
          {
            memcmp: {
              bytes: recipient2.publicKey.toBase58(),
              offset: 1,
            },
          },
        ],
      }
    );

    const transferredAsset = transferredAssets.items.find((asset) => {
      const decoded: any = borsh.deserialize(assetSchemaV1, asset.data.data);
      const owner = new PublicKey(Uint8Array.from(decoded.owner)).toBase58();
      const isFound = owner === recipient2.publicKey.toBase58();

      if (isFound) {
        console.log("asset:", {
          ...decoded,
          owner,
          updateAuthority: new PublicKey(
            Uint8Array.from(decoded.updateAuthority)
          ).toBase58(),
          collectionInfo: {
            assetId: new PublicKey(Uint8Array.from(asset.address)).toBase58(),
            updateAuthority: updateAuthority.publicKey.toBase58(),
          },
        });
      }

      return isFound;
    });

    expect(transferredAsset).to.not.be.undefined;
  });

  const freezeDelegate = Keypair.generate();
  it("can add freeze delegate plugin", async () => {
    const assets = await connection.getCompressedAccountsByOwner(
      program.programId,
      {
        filters: [
          {
            memcmp: {
              bytes: bs58.encode([1]),
              offset: 0,
            },
          },
          {
            memcmp: {
              bytes: recipient2.publicKey.toBase58(),
              offset: 1,
            },
          },
        ],
      }
    );

    const addressTree = defaultTestStateTreeAccounts().addressTree;
    const addressQueue = defaultTestStateTreeAccounts().addressQueue;
    const merkleTree = defaultTestStateTreeAccounts().merkleTree;
    const nullifierQueue = defaultTestStateTreeAccounts().nullifierQueue;

    const asset = assets.items[0];
    const decodedAsset: any = borsh.deserialize(assetSchemaV1, asset.data.data);
    const freezeDelegateSeed = await hashToBn254FieldSizeBe(
      Buffer.from([
        4,
        ...program.programId.toBytes(),
        ...Uint8Array.from(asset.address),
      ])
    );
    const freezeDelegateAddress = await deriveAddress(
      freezeDelegateSeed[0],
      addressTree
    );
    const assetProof = await connection.getValidityProofV0([
      {
        hash: bn(Uint8Array.from(asset.hash)),
        tree: addressTree,
        queue: addressQueue,
      },
    ]);

    const pluginProof = await connection.getValidityProofV0(undefined, [
      {
        address: bn(Uint8Array.from(freezeDelegateAddress.toBytes())),
        tree: addressTree,
        queue: addressQueue,
      },
    ]);

    const newAddressParams: NewAddressParams = {
      seed: freezeDelegateSeed[0],
      addressMerkleTreeRootIndex: pluginProof.rootIndices[0],
      addressMerkleTreePubkey: addressTree,
      addressQueuePubkey: pluginProof.nullifierQueues[0],
    };

    const inputCompressedAccount: CompressedAccountWithMerkleContext = {
      merkleTree,
      nullifierQueue,
      hash: asset.hash,
      leafIndex: asset.leafIndex,
      readOnly: false,
      owner: asset.owner,
      lamports: asset.lamports,
      address: asset.address,
      data: asset.data,
    };
    const outputCompressedAccounts =
      LightSystemProgram.createNewAddressOutputState(
        Array.from(freezeDelegateAddress.toBytes()),
        program.programId
      );
    const {
      packedInputCompressedAccounts,
      remainingAccounts: _remainingAccounts,
    } = packCompressedAccounts(
      [inputCompressedAccount],
      assetProof.rootIndices,
      outputCompressedAccounts
    );
    const { newAddressParamsPacked, remainingAccounts } = packNewAddressParams(
      [newAddressParams],
      _remainingAccounts
    );

    const {
      accountCompressionAuthority,
      noopProgram,
      registeredProgramPda,
      accountCompressionProgram,
    } = defaultStaticAccountsStruct();

    const ix = await program.methods
      .addPlugin(
        {
          a: assetProof.compressedProof.a,
          b: assetProof.compressedProof.b,
          c: assetProof.compressedProof.c,
        },
        {
          a: pluginProof.compressedProof.a,
          b: pluginProof.compressedProof.b,
          c: pluginProof.compressedProof.c,
        },
        {
          uninitializedAddress: {
            "0": newAddressParamsPacked[0].addressMerkleTreeRootIndex,
          },
        },
        {
          merkleTreePubkeyIndex:
            packedInputCompressedAccounts[0].merkleContext
              .merkleTreePubkeyIndex,
          nullifierQueuePubkeyIndex:
            packedInputCompressedAccounts[0].merkleContext
              .nullifierQueuePubkeyIndex,
        },
        {
          addressMerkleTreePubkeyIndex:
            newAddressParamsPacked[0].addressMerkleTreeAccountIndex,
          addressQueuePubkeyIndex:
            newAddressParamsPacked[0].addressQueueAccountIndex,
        },
        packedInputCompressedAccounts[0].rootIndex,
        asset.leafIndex,
        0,
        {
          assetId: asset.address,
          initializedPlugins: decodedAsset.initializedPlugins,
          key: decodedAsset.key,
        },
        {
          freezeDelegateV1: {
            0: freezeDelegate.publicKey,
          },
        }
      )
      .accounts({
        payer: keypair.publicKey,
        updateAuthority: new PublicKey(
          Uint8Array.from(decodedAsset.updateAuthority)
        ),
        owner: recipient2.publicKey,
        cpiAuthorityPda: PublicKey.findProgramAddressSync(
          [Buffer.from("cpi_authority")],
          program.programId
        )[0],
        selfProgram: program.programId,
        accountCompressionAuthority,
        accountCompressionProgram,
        noopProgram,
        registeredProgramPda,
        lightSystemProgram: LightSystemProgram.programId,
      })
      .remainingAccounts(
        remainingAccounts.map((account) => ({
          pubkey: account,
          isSigner: false,
          isWritable: true,
        }))
      )
      .instruction();

    const blockhash = await connection.getLatestBlockhash();
    const tx = buildAndSignTx(
      [setComputeUnitLimitIx, ix],
      keypair,
      blockhash.blockhash,
      [recipient2]
    );

    const signature = await sendAndConfirmTx(connection, tx, {
      commitment: "confirmed",
    });

    console.log("Your transaction signature for add plugin", signature);

    const updatedAsset = await connection.getCompressedAccount(
      bn(Uint8Array.from(asset.address))
    );
    const decodedUpdatedAsset: any = borsh.deserialize(
      assetSchemaV1,
      updatedAsset.data.data
    );
    expect(decodedUpdatedAsset.initializedPlugins.toString(2)).to.deep.equal(
      "10"
    );

    const freezeDelegatePlugin = await connection.getCompressedAccount(
      bn(Uint8Array.from(freezeDelegateAddress.toBytes()))
    );

    const decodedFreezeDelegatePlugin: any = borsh.deserialize(
      freezeDelegateSchemaV1,
      freezeDelegatePlugin.data.data
    );
    const freezeAuthority = new PublicKey(
      Uint8Array.from(decodedFreezeDelegatePlugin.authority)
    ).toBase58();

    console.log("decodedFreezeDelegatePlugin:", {
      ...decodedFreezeDelegatePlugin,
      authority: freezeAuthority,
    });
    expect(freezeAuthority).to.deep.equal(freezeDelegate.publicKey.toBase58());
  });

  it("cannot transfer frozen asset", async () => {
    const assets = await connection.getCompressedAccountsByOwner(
      program.programId,
      {
        filters: [
          {
            memcmp: {
              bytes: bs58.encode([1]),
              offset: 0,
            },
          },
          {
            memcmp: {
              bytes: recipient2.publicKey.toBase58(),
              offset: 1,
            },
          },
        ],
      }
    );

    const addressTree = defaultTestStateTreeAccounts().addressTree;
    const addressQueue = defaultTestStateTreeAccounts().addressQueue;
    const merkleTree = defaultTestStateTreeAccounts().merkleTree;
    const nullifierQueue = defaultTestStateTreeAccounts().nullifierQueue;

    const asset = assets.items[0];
    const assetProof = await connection.getValidityProofV0(
      [
        {
          hash: bn(Uint8Array.from(asset.hash)),
          tree: addressTree,
          queue: addressQueue,
        },
      ],
      undefined
    );

    const freezeDelegateSeed = await hashToBn254FieldSizeBe(
      Buffer.from([
        4,
        ...program.programId.toBytes(),
        ...Uint8Array.from(asset.address),
      ])
    );
    const freezeDelegateAddress = await deriveAddress(
      freezeDelegateSeed[0],
      addressTree
    );

    const inputCompressedAccount: CompressedAccountWithMerkleContext = {
      merkleTree,
      nullifierQueue,
      hash: asset.hash,
      leafIndex: asset.leafIndex,
      readOnly: false,
      owner: asset.owner,
      lamports: asset.lamports,
      address: asset.address,
      data: asset.data,
    };

    const { packedInputCompressedAccounts, remainingAccounts } =
      packCompressedAccounts(
        [inputCompressedAccount],
        assetProof.rootIndices,
        []
      );

    const decodedAsset: any = borsh.deserialize(assetSchemaV1, asset.data.data);
    const {
      accountCompressionAuthority,
      noopProgram,
      registeredProgramPda,
      accountCompressionProgram,
    } = defaultStaticAccountsStruct();
    const ix = await program.methods
      .transfer(
        {
          a: assetProof.compressedProof.a,
          b: assetProof.compressedProof.b,
          c: assetProof.compressedProof.c,
        },
        null,
        {
          leafIndex: asset.leafIndex,
          merkleTreePubkeyIndex:
            packedInputCompressedAccounts[0].merkleContext
              .merkleTreePubkeyIndex,
          nullifierQueuePubkeyIndex:
            packedInputCompressedAccounts[0].merkleContext
              .nullifierQueuePubkeyIndex,
          queueIndex: packedInputCompressedAccounts[0].merkleContext.queueIndex,
        },
        packedInputCompressedAccounts[0].rootIndex,
        asset.address,
        {
          initializedPlugins: decodedAsset.initializedPlugins,
          owner: new PublicKey(Uint8Array.from(decodedAsset.owner)),
        }
      )
      .accounts({
        payer: keypair.publicKey,
        authority: recipient2.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
        updateAuthority: updateAuthority.publicKey,
        cpiAuthorityPda: PublicKey.findProgramAddressSync(
          [Buffer.from("cpi_authority")],
          program.programId
        )[0],
        accountCompressionAuthority,
        accountCompressionProgram,
        noopProgram,
        registeredProgramPda,
        selfProgram: program.programId,
        lightSystemProgram: LightSystemProgram.programId,
        recipient: recipient2.publicKey,
        freezeDelegate: freezeDelegate.publicKey,
      })
      .remainingAccounts(
        remainingAccounts.map((account) => ({
          pubkey: account,
          isSigner: false,
          isWritable: true,
        }))
      )
      .instruction();

    const blockhash = await connection.getLatestBlockhash();
    const tx = buildAndSignTx(
      [setComputeUnitLimitIx, setComputeUnitPriceIx, ix],
      keypair,
      blockhash.blockhash,
      [recipient2]
    );

    try {
      await sendAndConfirmTx(connection, tx, {
        commitment: "confirmed",
      });
      throw new Error();
    } catch (e: unknown) {
      const error = e as SendTransactionError;
      expect(error.logs.join("")).to.include(
        "Error Number: 6007. Error Message: Asset is frozen."
      );
    }

    // attempt to forge asset data
    const ix2 = await program.methods
      .transfer(
        {
          a: assetProof.compressedProof.a,
          b: assetProof.compressedProof.b,
          c: assetProof.compressedProof.c,
        },
        null,
        {
          leafIndex: asset.leafIndex,
          merkleTreePubkeyIndex:
            packedInputCompressedAccounts[0].merkleContext
              .merkleTreePubkeyIndex,
          nullifierQueuePubkeyIndex:
            packedInputCompressedAccounts[0].merkleContext
              .nullifierQueuePubkeyIndex,
          queueIndex: packedInputCompressedAccounts[0].merkleContext.queueIndex,
        },
        packedInputCompressedAccounts[0].rootIndex,
        asset.address,
        {
          initializedPlugins: 0, // set that the freeze delegate plugin is removed
          owner: new PublicKey(Uint8Array.from(decodedAsset.owner)),
        }
      )
      .accounts({
        payer: keypair.publicKey,
        authority: recipient2.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
        updateAuthority: updateAuthority.publicKey,
        cpiAuthorityPda: PublicKey.findProgramAddressSync(
          [Buffer.from("cpi_authority")],
          program.programId
        )[0],
        accountCompressionAuthority,
        accountCompressionProgram,
        noopProgram,
        registeredProgramPda,
        selfProgram: program.programId,
        lightSystemProgram: LightSystemProgram.programId,
        recipient: recipient2.publicKey,
        freezeDelegate: freezeDelegate.publicKey,
      })
      .remainingAccounts(
        remainingAccounts.map((account) => ({
          pubkey: account,
          isSigner: false,
          isWritable: true,
        }))
      )
      .instruction();

    const tx2 = buildAndSignTx(
      [setComputeUnitLimitIx, setComputeUnitPriceIx, ix2],
      keypair,
      blockhash.blockhash,
      [recipient2]
    );

    try {
      await sendAndConfirmTx(connection, tx2, {
        commitment: "confirmed",
      });
      throw new Error();
    } catch (e: unknown) {
      const error = e as SendTransactionError;
      expect(error.logs.join("")).to.include("custom program error: 0x32ce");
    }
  });

  it("can remove freeze delegate plugin", async () => {
    const assets = await connection.getCompressedAccountsByOwner(
      program.programId,
      {
        filters: [
          {
            memcmp: {
              bytes: bs58.encode([1]),
              offset: 0,
            },
          },
          {
            memcmp: {
              bytes: recipient2.publicKey.toBase58(),
              offset: 1,
            },
          },
        ],
      }
    );

    const addressTree = defaultTestStateTreeAccounts().addressTree;
    const addressQueue = defaultTestStateTreeAccounts().addressQueue;
    const merkleTree = defaultTestStateTreeAccounts().merkleTree;
    const nullifierQueue = defaultTestStateTreeAccounts().nullifierQueue;

    const asset = assets.items[0];
    const freezeDelegateSeed = await hashToBn254FieldSizeBe(
      Buffer.from([
        4,
        ...program.programId.toBytes(),
        ...Uint8Array.from(asset.address),
      ])
    );
    const freezeDelegateAddress = await deriveAddress(
      freezeDelegateSeed[0],
      addressTree
    );

    const freezeDelegateAccount = await connection.getCompressedAccount(
      bn(Uint8Array.from(freezeDelegateAddress.toBytes()))
    );

    const assetProof = await connection.getValidityProofV0([
      {
        hash: bn(Uint8Array.from(freezeDelegateAccount.hash)),
        tree: addressTree,
        queue: addressQueue,
      },
      {
        hash: bn(Uint8Array.from(asset.hash)),
        tree: addressTree,
        queue: addressQueue,
      },
    ]);

    const inputCompressedAccount: CompressedAccountWithMerkleContext = {
      merkleTree,
      nullifierQueue,
      hash: asset.hash,
      leafIndex: asset.leafIndex,
      readOnly: false,
      owner: asset.owner,
      lamports: asset.lamports,
      address: asset.address,
      data: asset.data,
    };

    const { packedInputCompressedAccounts, remainingAccounts } =
      packCompressedAccounts(
        [inputCompressedAccount],
        assetProof.rootIndices,
        []
      );
    const decodedAsset: any = borsh.deserialize(assetSchemaV1, asset.data.data);
    const {
      accountCompressionAuthority,
      noopProgram,
      registeredProgramPda,
      accountCompressionProgram,
    } = defaultStaticAccountsStruct();

    const ix = await program.methods
      .removePlugin(
        {
          a: assetProof.compressedProof.a,
          b: assetProof.compressedProof.b,
          c: assetProof.compressedProof.c,
        },
        {
          merkleTreePubkeyIndex:
            packedInputCompressedAccounts[0].merkleContext
              .merkleTreePubkeyIndex,
          nullifierQueuePubkeyIndex:
            packedInputCompressedAccounts[0].merkleContext
              .nullifierQueuePubkeyIndex,
        },
        assetProof.rootIndices[0],
        asset.leafIndex,
        freezeDelegateAccount.leafIndex,
        asset.address,
        1,
        decodedAsset.initializedPlugins
      )
      .accounts({
        payer: keypair.publicKey,
        updateAuthority: updateAuthority.publicKey,
        owner: recipient2.publicKey,
        freezeDelegate: freezeDelegate.publicKey,
        cpiAuthorityPda: PublicKey.findProgramAddressSync(
          [Buffer.from("cpi_authority")],
          program.programId
        )[0],
        accountCompressionAuthority,
        accountCompressionProgram,
        noopProgram,
        registeredProgramPda,
        selfProgram: program.programId,
        lightSystemProgram: LightSystemProgram.programId,
      })
      .remainingAccounts(
        remainingAccounts.map((account) => ({
          pubkey: account,
          isSigner: false,
          isWritable: true,
        }))
      )
      .instruction();

    const blockhash = await connection.getLatestBlockhash();
    const tx = buildAndSignTx(
      [setComputeUnitLimitIx, ix],
      keypair,
      blockhash.blockhash,
      [freezeDelegate]
    );

    const signature = await sendAndConfirmTx(connection, tx, {
      commitment: "confirmed",
    });

    console.log("Your transaction signature for remove plugin", signature);

    const updatedAsset = await connection.getCompressedAccount(
      bn(Uint8Array.from(asset.address))
    );
    const decodedUpdatedAsset: any = borsh.deserialize(
      assetSchemaV1,
      updatedAsset.data.data
    );
    expect(decodedUpdatedAsset.initializedPlugins.toString(2)).to.deep.equal(
      "0"
    );
  });

  const freezeDelegate2 = Keypair.generate();
  it("can add freeze delegate plugin again", async () => {
    const assets = await connection.getCompressedAccountsByOwner(
      program.programId,
      {
        filters: [
          {
            memcmp: {
              bytes: bs58.encode([1]),
              offset: 0,
            },
          },
          {
            memcmp: {
              bytes: recipient2.publicKey.toBase58(),
              offset: 1,
            },
          },
        ],
      }
    );

    const addressTree = defaultTestStateTreeAccounts().addressTree;
    const addressQueue = defaultTestStateTreeAccounts().addressQueue;
    const merkleTree = defaultTestStateTreeAccounts().merkleTree;
    const nullifierQueue = defaultTestStateTreeAccounts().nullifierQueue;

    const asset = assets.items[0];
    const decodedAsset: any = borsh.deserialize(assetSchemaV1, asset.data.data);
    const freezeDelegateSeed = await hashToBn254FieldSizeBe(
      Buffer.from([
        4,
        ...program.programId.toBytes(),
        ...Uint8Array.from(asset.address),
      ])
    );
    const freezeDelegateAddress = await deriveAddress(
      freezeDelegateSeed[0],
      addressTree
    );

    const freezeDelegateAccount = await connection.getCompressedAccount(
      bn(Uint8Array.from(freezeDelegateAddress.toBytes()))
    );

    const assetProof = await connection.getValidityProofV0([
      {
        hash: bn(Uint8Array.from(asset.hash)),
        tree: addressTree,
        queue: addressQueue,
      },
    ]);

    const pluginProof = await connection.getValidityProofV0([
      {
        hash: bn(Uint8Array.from(freezeDelegateAccount.hash)),
        tree: addressTree,
        queue: addressQueue,
      },
    ]);

    const newAddressParams: NewAddressParams = {
      seed: freezeDelegateSeed[0],
      addressMerkleTreeRootIndex: pluginProof.rootIndices[0],
      addressMerkleTreePubkey: addressTree,
      addressQueuePubkey: pluginProof.nullifierQueues[0],
    };

    const inputCompressedAccount: CompressedAccountWithMerkleContext = {
      merkleTree,
      nullifierQueue,
      hash: asset.hash,
      leafIndex: asset.leafIndex,
      readOnly: false,
      owner: asset.owner,
      lamports: asset.lamports,
      address: asset.address,
      data: asset.data,
    };
    const outputCompressedAccounts =
      LightSystemProgram.createNewAddressOutputState(
        Array.from(freezeDelegateAddress.toBytes()),
        program.programId
      );
    const {
      packedInputCompressedAccounts,
      remainingAccounts: _remainingAccounts,
    } = packCompressedAccounts(
      [inputCompressedAccount],
      assetProof.rootIndices,
      outputCompressedAccounts
    );
    const { newAddressParamsPacked, remainingAccounts } = packNewAddressParams(
      [newAddressParams],
      _remainingAccounts
    );

    const {
      accountCompressionAuthority,
      noopProgram,
      registeredProgramPda,
      accountCompressionProgram,
    } = defaultStaticAccountsStruct();

    const ix = await program.methods
      .addPlugin(
        {
          a: assetProof.compressedProof.a,
          b: assetProof.compressedProof.b,
          c: assetProof.compressedProof.c,
        },
        {
          a: pluginProof.compressedProof.a,
          b: pluginProof.compressedProof.b,
          c: pluginProof.compressedProof.c,
        },
        {
          initializedAddress: {
            "0": Buffer.from(
              Uint8Array.from(
                freezeDelegateAccount.data.dataHash.slice().reverse()
              )
            ),
          },
        },
        {
          merkleTreePubkeyIndex:
            packedInputCompressedAccounts[0].merkleContext
              .merkleTreePubkeyIndex,
          nullifierQueuePubkeyIndex:
            packedInputCompressedAccounts[0].merkleContext
              .nullifierQueuePubkeyIndex,
        },
        {
          addressMerkleTreePubkeyIndex:
            newAddressParamsPacked[0].addressMerkleTreeAccountIndex,
          addressQueuePubkeyIndex:
            newAddressParamsPacked[0].addressQueueAccountIndex,
        },
        packedInputCompressedAccounts[0].rootIndex,
        asset.leafIndex,
        freezeDelegateAccount.leafIndex,
        {
          assetId: asset.address,
          initializedPlugins: decodedAsset.initializedPlugins,
          key: decodedAsset.key,
        },
        {
          freezeDelegateV1: {
            0: freezeDelegate2.publicKey,
          },
        }
      )
      .accounts({
        payer: keypair.publicKey,
        updateAuthority: new PublicKey(
          Uint8Array.from(decodedAsset.updateAuthority)
        ),
        owner: recipient2.publicKey,
        cpiAuthorityPda: PublicKey.findProgramAddressSync(
          [Buffer.from("cpi_authority")],
          program.programId
        )[0],
        selfProgram: program.programId,
        accountCompressionAuthority,
        accountCompressionProgram,
        noopProgram,
        registeredProgramPda,
        lightSystemProgram: LightSystemProgram.programId,
      })
      .remainingAccounts(
        remainingAccounts.map((account) => ({
          pubkey: account,
          isSigner: false,
          isWritable: true,
        }))
      )
      .instruction();

    const blockhash = await connection.getLatestBlockhash();
    const tx = buildAndSignTx(
      [setComputeUnitLimitIx, ix],
      keypair,
      blockhash.blockhash,
      [recipient2]
    );

    const signature = await sendAndConfirmTx(connection, tx, {
      commitment: "confirmed",
      skipPreflight: true,
    });

    console.log("Your transaction signature", signature);

    const updatedAsset = await connection.getCompressedAccount(
      bn(Uint8Array.from(asset.address))
    );
    const decodedUpdatedAsset: any = borsh.deserialize(
      assetSchemaV1,
      updatedAsset.data.data
    );
    expect(decodedUpdatedAsset.initializedPlugins.toString(2)).to.deep.equal(
      "10"
    );

    const freezeDelegatePlugin = await connection.getCompressedAccount(
      bn(Uint8Array.from(freezeDelegateAddress.toBytes()))
    );

    const decodedFreezeDelegatePlugin: any = borsh.deserialize(
      freezeDelegateSchemaV1,
      freezeDelegatePlugin.data.data
    );
    const freezeAuthority = new PublicKey(
      Uint8Array.from(decodedFreezeDelegatePlugin.authority)
    ).toBase58();

    console.log("decodedFreezeDelegatePlugin:", {
      ...decodedFreezeDelegatePlugin,
      authority: freezeAuthority,
    });
    expect(freezeAuthority).to.deep.equal(freezeDelegate2.publicKey.toBase58());
  });
});
