const bs58 = require("bs58");

console.log(bs58.default.encode(Buffer.from(process.argv[2], "base64")));
