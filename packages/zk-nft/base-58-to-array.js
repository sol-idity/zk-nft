const bs58 = require("bs58");

console.log(
  JSON.stringify(Array.from(Uint8Array.from(bs58.default.decode(process.argv[2]))))
);
