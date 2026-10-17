// node tests/node_patch.js STOCK.syx PATCH.json OUT.syx  -- runs the browser patcher's core in Node
const fs = require('fs');
const P = require('../public/patcher/sidecar-patch.js');
const [stock, patch, out] = process.argv.slice(2);
const t = Date.now();
const res = P.patch(new Uint8Array(fs.readFileSync(stock)), JSON.parse(fs.readFileSync(patch, 'utf8')), (m) => console.log(m));
fs.writeFileSync(out, res);
console.log('wrote', out, res.length, 'bytes in', Date.now() - t, 'ms');
