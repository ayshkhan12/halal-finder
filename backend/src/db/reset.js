// Deletes the local database so the next start re-creates it from seed data.
const fs = require('node:fs');
const config = require('../config');

for (const suffix of ['', '-wal', '-shm']) {
  fs.rmSync(config.dbPath + suffix, { force: true });
}
const { openDatabase } = require('./index');
openDatabase(config.dbPath).close();
console.log(`Database reset with demo data at ${config.dbPath}`);
