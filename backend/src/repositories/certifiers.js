function toCertifier(row) {
  return {
    id: row.id,
    name: row.name,
    shortName: row.short_name,
    country: row.country,
    website: row.website,
    description: row.description,
    slaughterPolicy: row.slaughter_policy,
    restaurantCount: row.restaurant_count ?? 0,
    productCount: row.product_count ?? 0,
  };
}

const SELECT = `
  SELECT c.*,
    (SELECT COUNT(*) FROM restaurants r WHERE r.certifier_id = c.id) AS restaurant_count,
    (SELECT COUNT(*) FROM products p WHERE p.certifier_id = c.id) AS product_count
  FROM certifiers c`;

function list(db) {
  return db.prepare(`${SELECT} ORDER BY restaurant_count + product_count DESC, c.name`).all().map(toCertifier);
}

function getById(db, id) {
  const row = db.prepare(`${SELECT} WHERE c.id = ?`).get(id);
  return row ? toCertifier(row) : null;
}

module.exports = { list, getById };
