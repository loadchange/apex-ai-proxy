// update-wrangler-config.js
// This script reads the configuration from wrangler-config.js and updates wrangler.jsonc

const fs = require('fs');
const { configJson } = require('./wrangler-config.js');

// Write the configuration to wrangler.jsonc
fs.writeFileSync('wrangler.jsonc', configJson);
console.log('wrangler.jsonc has been updated with the new configuration.');
