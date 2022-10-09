const fs = require('node:fs');
const { dist } = require('./config');

// ensure dist exist
if (!fs.existsSync(dist)) {
  fs.mkdirSync(dist);
}
