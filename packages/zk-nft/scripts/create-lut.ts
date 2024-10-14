import { buildAndSignTx } from "@lightprotocol/stateless.js";
import { AddressLookupTableProgram, Connection, Keypair } from "@solana/web3.js";
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
  const [ix] = AddressLookupTableProgram.createLookupTable({
    authority: keypair.publicKey,
    payer: keypair.publicKey,
    // recentSlot: await connection.getSlot(),
    recentSlot: 135
  });

  const blockhash = await connection.getLatestBlockhash();
  const tx = buildAndSignTx(
    [ix],
    keypair,
    blockhash.blockhash,
  );

  const txHash = await connection.sendRawTransaction(tx.serialize());
  await connection.confirmTransaction({
    signature: txHash,
    blockhash: blockhash.blockhash,
    lastValidBlockHeight: blockhash.lastValidBlockHeight,
  });
  console.log("txHash", txHash);
})();
