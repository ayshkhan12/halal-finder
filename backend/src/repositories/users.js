const { randomUUID } = require('node:crypto');

const toUser = (row) => ({ id: row.id, name: row.name, email: row.email, createdAt: row.created_at });

function create(db, { name, email, passwordHash }) {
  const id = randomUUID();
  db.prepare('INSERT INTO users (id, name, email, password_hash) VALUES (?, ?, ?, ?)').run(id, name, email, passwordHash);
  return getById(db, id);
}

function getById(db, id) {
  const row = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
  return row ? toUser(row) : null;
}

/** Includes the password hash; only for the login check. */
function getAuthRecordByEmail(db, email) {
  return db.prepare('SELECT * FROM users WHERE email = ?').get(email) || null;
}

module.exports = { create, getById, getAuthRecordByEmail, toUser };
