import {
  accountCompressionProgram,
  addressQueue,
  addressTree,
  buildAndSignTx,
  getAccountCompressionAuthority,
  getRegisteredProgramPda,
  lightProgram,
  merkletreePubkey,
  noopProgram,
  nullifierQueuePubkey,
} from "@lightprotocol/stateless.js";
import {
  AddressLookupTableProgram,
  Connection,
  Keypair,
  PublicKey,
} from "@solana/web3.js";
import fs from "fs";

const keypair = Keypair.fromSecretKey(
  Uint8Array.from(
    JSON.parse(fs.readFileSync("target/deploy/authority-keypair.json", "utf-8"))
  )
);
const connection = new Connection("http://localhost:8899", {
  commitment: "confirmed",
});
// const connection = new Connection(process.env.MAINNET_RPC as string, {
//   commitment: "confirmed",
// });

(async () => {
  const ix = AddressLookupTableProgram.extendLookupTable({
    authority: keypair.publicKey,
    payer: keypair.publicKey,
    // lookupTable: new PublicKey("Dh74qoNrgMYzk4ZFZenKS2f9gSA9AqXrcgYzyBia1r3W"),
    lookupTable: new PublicKey("DrN7o6QST1mMAfNiVLXSSghuiawp4CYdYSzWR8PnP9Gj"),
    addresses: [
      new PublicKey(getRegisteredProgramPda()),
      new PublicKey(noopProgram),
      new PublicKey(accountCompressionProgram),
      new PublicKey(getAccountCompressionAuthority()),
      PublicKey.findProgramAddressSync(
        [Buffer.from("cpi_authority")],
        new PublicKey("zkNFTi24GW95YYfM8jNM2tDDPmDnDm7EQuze8jJ66sn")
      )[0],
      new PublicKey(nullifierQueuePubkey),
      new PublicKey(merkletreePubkey),
      new PublicKey(addressTree),
      new PublicKey(addressQueue),
      new PublicKey(lightProgram),
    ],
  });

  const blockhash = await connection.getLatestBlockhash();
  const tx = buildAndSignTx([ix], keypair, blockhash.blockhash);

  const txHash = await connection.sendRawTransaction(tx.serialize());
  await connection.confirmTransaction({
    signature: txHash,
    blockhash: blockhash.blockhash,
    lastValidBlockHeight: blockhash.lastValidBlockHeight,
  });
  console.log("txHash", txHash);
})();
