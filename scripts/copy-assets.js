const fs = require("fs");
const path = require("path");

const assets = [
  {
    from: path.join(__dirname, "..", "src", "nodes", "telegram.svg"),
    to: path.join(__dirname, "..", "dist", "nodes", "telegram.svg"),
  },
];

for (const asset of assets) {
  fs.mkdirSync(path.dirname(asset.to), { recursive: true });
  fs.copyFileSync(asset.from, asset.to);
}
