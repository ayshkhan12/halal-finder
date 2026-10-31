const fs = require('node:fs');
const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');
const { seed } = require('./seed');

const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');

/**
 * Opens (or creates) the database, applies the schema and seeds demo data
 * the first time. Pass ':memory:' for tests.
 */
function openDatabase(file) {
  if (file !== ':memory:') fs.mkdirSync(path.dirname(file), { recursive: true });
  const db = new DatabaseSync(file);
  db.exec('PRAGMA foreign_keys = ON;');
  if (file !== ':memory:') db.exec('PRAGMA journal_mode = WAL;');
  db.exec(schema);

  const { n } = db.prepare('SELECT COUNT(*) AS n FROM restaurants').get();
  if (n === 0) seed(db);
  return db;
}

module.exports = { openDatabase };
