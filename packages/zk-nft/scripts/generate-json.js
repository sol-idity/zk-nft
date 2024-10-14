const path = require("path");
const formattedMetadata = require("./collection/formatted-metadata.json");
const fs = require("fs");

for (let i = 0; i < formattedMetadata.length; i++) {
  const metadata = formattedMetadata[i];
  metadata.image = `https://files.tinys.pl/zkN5FTcJzrwp2c9G4fL3qXo9tnVhiACG3xzoP3tV3Hh/${i + 1}.webp`;
  fs.writeFileSync(
    path.join(__dirname, "collection", "json", `${i + 1}.json`),
    JSON.stringify(metadata)
  );
}
