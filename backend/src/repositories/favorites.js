function listKeys(db, userId) {
  return db.prepare('SELECT item_type, item_id, created_at FROM favorites WHERE user_id = ? ORDER BY created_at DESC')
    .all(userId)
    .map((r) => ({ itemType: r.item_type, itemId: r.item_id, createdAt: r.created_at }));
}

function add(db, userId, itemType, itemId) {
  db.prepare('INSERT OR IGNORE INTO favorites (user_id, item_type, item_id) VALUES (?, ?, ?)').run(userId, itemType, itemId);
}

function remove(db, userId, itemType, itemId) {
  db.prepare('DELETE FROM favorites WHERE user_id = ? AND item_type = ? AND item_id = ?').run(userId, itemType, itemId);
}

module.exports = { listKeys, add, remove };
