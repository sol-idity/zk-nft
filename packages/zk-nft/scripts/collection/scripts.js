const attributes = require("./attributes.json");
const fs = require("fs");

const formattedMetadata = attributes.map((attribute) => {
  return attribute.attributes;
});

fs.writeFileSync(
  "./attributes.json",
  JSON.stringify(formattedMetadata, null, 2)
);
