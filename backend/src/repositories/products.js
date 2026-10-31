const { certificationFromRow } = require('../lib/verification');
const restaurants = require('./restaurants');

const BASE_SELECT = `
  SELECT p.*, c.name AS certifier_name, c.short_name AS certifier_short_name
  FROM products p
  LEFT JOIN certifiers c ON c.id = p.certifier_id`;

function toProduct(row, now) {
  return {
    id: row.id,
    name: row.name,
    brand: row.brand,
    category: row.category,
    description: row.description,
    size: row.size,
    barcode: row.barcode,
    imageUrl: row.image_url,
    dietary: JSON.parse(row.dietary),
    certification: certificationFromRow(row, now),
  };
}

function list(db, query, now = new Date()) {
  const where = [];
  const params = {};
  if (query.q) {
    where.push('(p.name LIKE $q OR p.brand LIKE $q OR p.category LIKE $q OR p.barcode = $exact)');
    params.q = `%${query.q}%`;
    params.exact = query.q;
  }
  if (query.category) { where.push('p.category = $category'); params.category = query.category; }
  if (query.certifier) { where.push('p.certifier_id = $certifier'); params.certifier = query.certifier; }
  if (query.dietary?.length) {
    // Each requested tag must be present in the JSON array.
    query.dietary.forEach((tag, i) => {
      where.push(`EXISTS (SELECT 1 FROM json_each(p.dietary) WHERE value = $diet${i})`);
      params[`diet${i}`] = tag;
    });
  }
  if (query.ids?.length) {
    const keys = query.ids.map((_, i) => `$id${i}`);
    where.push(`p.id IN (${keys.join(', ')})`);
    query.ids.forEach((id, i) => { params[`id${i}`] = id; });
  }

  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const { total } = db.prepare(`SELECT COUNT(*) AS total FROM products p ${whereSql}`).get(params);
  const limit = query.limit ?? 20;
  const offset = query.offset ?? 0;
  const rows = db.prepare(`${BASE_SELECT} ${whereSql} ORDER BY p.name LIMIT $limit OFFSET $offset`)
    .all({ ...params, limit, offset });
  return { items: rows.map((r) => toProduct(r, now)), total, limit, offset };
}

function getById(db, id, now = new Date()) {
  const row = db.prepare(`${BASE_SELECT} WHERE p.id = ?`).get(id);
  return row ? toProduct(row, now) : null;
}

function getByBarcode(db, barcode, now = new Date()) {
  const row = db.prepare(`${BASE_SELECT} WHERE p.barcode = ?`).get(barcode);
  return row ? toProduct(row, now) : null;
}

/** Shops that stock a product, nearest first when we know where the user is. */
function stockists(db, productId, { origin, now = new Date() } = {}) {
  const ids = db.prepare('SELECT restaurant_id FROM product_stockists WHERE product_id = ?').all(productId)
    .map((r) => r.restaurant_id);
  if (!ids.length) return [];
  return restaurants.list(db, { ids, lat: origin?.lat, lng: origin?.lng, limit: 50 }, now).items;
}

function exists(db, id) {
  return Boolean(db.prepare('SELECT 1 FROM products WHERE id = ?').get(id));
}

function categories(db) {
  return db.prepare('SELECT category AS value, COUNT(*) AS count FROM products GROUP BY category ORDER BY category').all();
}

module.exports = { list, getById, getByBarcode, stockists, exists, categories };
