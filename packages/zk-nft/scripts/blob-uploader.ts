import { Program } from "@coral-xyz/anchor";
import { ZkNft } from "../target/types/zk_nft";
import {
  ComputeBudgetProgram,
  Keypair,
  PublicKey,
  SystemProgram,
} from "@solana/web3.js";
import {
  buildAndSignTx,
  confirmTransaction,
} from "@lightprotocol/stateless.js";
import { chunk } from "lodash";

const PART_LENGTH = 920;
const TRANSACTION_CHUNK_SIZE = 10;
const UPLOADED_BLOB_BUFFER_START =
  8 + // discriminator
  32; // authority

export class BlobUploader {
  private readonly program: Program<ZkNft>;
  private readonly blob: Buffer;
  private readonly keypair: Keypair;
  private readonly skipPreflight: boolean;

  constructor(
    program: Program<ZkNft>,
    keypair: Keypair,
    blob: Buffer,
    skipPreflight: boolean = false
  ) {
    this.program = program;
    this.blob = blob;
    this.keypair = keypair;
    this.skipPreflight = skipPreflight;
  }

  async uploadBlob() {
    const uploadedBlobAccount = await this.createUploadedBlobAccount();

    await this.initBlobUpload(uploadedBlobAccount.publicKey);
    await this.runUploadBlob(uploadedBlobAccount.publicKey);
    return this.logBlob(uploadedBlobAccount.publicKey);
  }

  private async createUploadedBlobAccount() {
    const uploadedBlobAccount = Keypair.generate();

    const space = UPLOADED_BLOB_BUFFER_START + this.blob.length;

    const ix = SystemProgram.createAccount({
      fromPubkey: this.keypair.publicKey,
      newAccountPubkey: uploadedBlobAccount.publicKey,
      space,
      lamports:
        await this.program.provider.connection.getMinimumBalanceForRentExemption(
          space
        ),
      programId: this.program.programId,
    });

    const blockhash =
      await this.program.provider.connection.getLatestBlockhash();
    const tx = buildAndSignTx([ix], this.keypair, blockhash.blockhash, [
      uploadedBlobAccount,
    ]);
    const signature = await this.program.provider.connection.sendTransaction(
      tx,
      {
        skipPreflight: this.skipPreflight,
      }
    );
    await confirmTransaction(
      this.program.provider.connection,
      signature,
      "confirmed"
    );
    console.log(
      `Created uploaded blob account: ${uploadedBlobAccount.publicKey.toBase58()}`
    );

    return uploadedBlobAccount;
  }

  private async initBlobUpload(uploadedBlob: PublicKey) {
    const ix = await this.program.methods
      .initBlobUpload(this.blob.length)
      .accounts({
        authority: this.keypair.publicKey,
        uploadedBlob,
      })
      .instruction();

    const blockhash =
      await this.program.provider.connection.getLatestBlockhash();
    const tx = buildAndSignTx([ix], this.keypair, blockhash.blockhash, []);
    const signature = await this.program.provider.connection.sendTransaction(
      tx,
      { skipPreflight: this.skipPreflight }
    );
    await confirmTransaction(
      this.program.provider.connection,
      signature,
      "confirmed"
    );
    console.log(`Initialized blob upload in tx: ${signature}`);
  }

  private async runUploadBlob(uploadedBlobAccount: PublicKey) {
    const transactionsCount = Math.ceil(this.blob.length / PART_LENGTH);
    const blobParts = Array.from({ length: transactionsCount }, (_, i) =>
      this.blob.subarray(i * PART_LENGTH, (i + 1) * PART_LENGTH)
    );

    const chunks = chunk(blobParts, TRANSACTION_CHUNK_SIZE);

    // I know this is not the best way to do it, but it works decently
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      await Promise.all(
        chunk.map(async (part, j) => {
          const index = (i * TRANSACTION_CHUNK_SIZE + j) * PART_LENGTH;
          const ix = await this.program.methods
            .uploadBlob(index, part)
            .accounts({
              authority: this.keypair.publicKey,
              uploadedBlob: uploadedBlobAccount,
            })
            .instruction();

          const blockhash =
            await this.program.provider.connection.getLatestBlockhash();
          const tx = buildAndSignTx(
            [ix],
            this.keypair,
            blockhash.blockhash,
            []
          );
          const signature =
            await this.program.provider.connection.sendTransaction(tx, {
              skipPreflight: this.skipPreflight,
            });
          await confirmTransaction(
            this.program.provider.connection,
            signature,
            "confirmed"
          );
        })
      );

      console.log(
        `Sent ${Math.min(
          (i + 1) * TRANSACTION_CHUNK_SIZE,
          transactionsCount
        )}/${transactionsCount} transactions`
      );
    }
  }

  private async logBlob(uploadedBlobAccount: PublicKey) {
    const ix = await this.program.methods
      .logBlob()
      .accounts({
        authority: this.keypair.publicKey,
        uploadedBlob: uploadedBlobAccount,
        noopProgram: "noopb9bkMVfRPU8AsbpTUg8AQkHtKwMYZiFUjNRtMmV",
      })
      .instruction();

    const blockhash =
      await this.program.provider.connection.getLatestBlockhash();
    const tx = buildAndSignTx([ix], this.keypair, blockhash.blockhash, []);
    const signature = await this.program.provider.connection.sendTransaction(
      tx,
      { skipPreflight: this.skipPreflight }
    );
    await confirmTransaction(
      this.program.provider.connection,
      signature,
      "confirmed"
    );

    console.log(`Logged blob in tx: ${signature}`);
    return signature;
  }
}
