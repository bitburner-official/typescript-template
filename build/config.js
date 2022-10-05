const fileSyncJson = require('../filesync.json');
const dist = fileSyncJson['scriptsFolder'];
const src = 'src';
const allowedFiletypes = fileSyncJson['allowedFiletypes'];

module.exports = {
  dist,
  src,
  allowedFiletypes,
};
