import { Program } from "@coral-xyz/anchor";
import * as idl from "../target/idl/zk_nft.json";
import * as anchor from "@coral-xyz/anchor";
import { ZkNft } from "../target/types/zk_nft";
import metadatas from "./collection/formatted-metadata.json";
import fs from "fs";
import { BlobUploader } from "./blob-uploader";

const keypair = anchor.web3.Keypair.fromSecretKey(
  Uint8Array.from(
    JSON.parse(
      fs.readFileSync(
        __dirname + "/../target/deploy/authority-keypair.json",
        "utf-8"
      )
    )
  )
);

const program = new Program(
  idl as unknown as ZkNft,
  "zkNFTi24GW95YYfM8jNM2tDDPmDnDm7EQuze8jJ66sn",
  {
    // connection: new anchor.web3.Connection("http://localhost:8899"),
    connection: new anchor.web3.Connection(
      "https://zk-testnet.helius.dev:8899"
    ),
  }
);

const metadatasSlice = metadatas;
(async () => {
  const signatures = [];
  for (let i = 0; i < metadatasSlice.length; i++) {
    console.log(`Uploading metadata ${i + 1} of ${metadatasSlice.length}`);
    const metadata = metadatasSlice[i];
    const blobUploader = new BlobUploader(
      program,
      keypair,
      Buffer.from(JSON.stringify(metadata)),
      true
    );
    const signature = await blobUploader.uploadBlob();
    signatures.push(signature);
    fs.writeFileSync(
      __dirname + "/testnet-blobs.json",
      JSON.stringify(signatures, null, 2)
    );
  }
})();
