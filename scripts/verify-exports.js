const assert = require('node:assert/strict');
const path = require('node:path');

const credentialsPath = path.join(
  __dirname,
  '..',
  'dist',
  'credentials',
  'TelegramMtproto.credentials.js',
);
const nodePath = path.join(__dirname, '..', 'dist', 'nodes', 'TelegramMtproto.node.js');

const credentialsModule = require(credentialsPath);
const nodeModule = require(nodePath);

assert.equal(
  typeof credentialsModule.TelegramMtproto,
  'function',
  'Expected credentials export TelegramMtproto class',
);
assert.equal(
  typeof nodeModule.TelegramMtproto,
  'function',
  'Expected node export TelegramMtproto class',
);

new credentialsModule.TelegramMtproto();
new nodeModule.TelegramMtproto();

console.log('Export verification passed.');
