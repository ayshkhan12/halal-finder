const { distanceKm, boundingBox } = require('../lib/geo');
const { openStatus } = require('../lib/hours');
const { certificationFromRow, isCurrent } = require('../lib/verification');

const BASE_SELECT = `
  SELECT r.*, c.name AS certifier_name, c.short_name AS certifier_short_name
  FROM restaurants r
  LEFT JOIN certifiers c ON c.id = r.certifier_id`;

const round = (n, dp) => Math.round(n * 10 ** dp) / 10 ** dp;

function toRestaurant(row, { origin, now }) {
  const hours = JSON.parse(row.hours);
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    category: row.category,
    cuisine: row.cuisine,
    address: { line1: row.address, city: row.city, postcode: row.postcode, country: row.country },
    location: { lat: row.lat, lng: row.lng },
    distanceKm: origin ? round(distanceKm(origin, { lat: row.lat, lng: row.lng }), 2) : null,
    phone: row.phone,
    priceLevel: row.price_level,
    rating: row.rating,
    reviewCount: row.review_count,
    halal: {
      status: row.halal_status,
      alcoholFree: Boolean(row.alcohol_free),
      handSlaughtered: Boolean(row.hand_slaughtered),
    },
    features: JSON.parse(row.features),
    imageUrl: row.image_url,
    hours,
    timezone: row.timezone,
    openStatus: openStatus(hours, row.timezone, now),
    certification: certificationFromRow(row, now),
  };
}

/**
 * Search restaurants. Coarse filters run in SQL; distance, opening hours and
 * certificate status are computed per row, then the result is sorted and paged.
 * At larger scale the geo part moves to PostGIS or a geohash index.
 */
function list(db, query, now = new Date()) {
  const where = [];
  const params = {};
  const origin = query.lat != null && query.lng != null ? { lat: query.lat, lng: query.lng } : null;

  if (query.q) {
    where.push('(r.name LIKE $q OR r.cuisine LIKE $q OR r.description LIKE $q OR r.city LIKE $q OR r.postcode LIKE $q)');
    params.q = `%${query.q}%`;
  }
  if (query.category?.length) {
    const keys = query.category.map((_, i) => `$cat${i}`);
    where.push(`r.category IN (${keys.join(', ')})`);
    query.category.forEach((c, i) => { params[`cat${i}`] = c; });
  }
  if (query.cuisine) { where.push('r.cuisine = $cuisine'); params.cuisine = query.cuisine; }
  if (query.city) { where.push('r.city = $city COLLATE NOCASE'); params.city = query.city; }
  if (query.certifier) { where.push('r.certifier_id = $certifier'); params.certifier = query.certifier; }
  if (query.fullyHalal) where.push("r.halal_status = 'fully_halal'");
  if (query.alcoholFree) where.push('r.alcohol_free = 1');
  if (query.handSlaughtered) where.push('r.hand_slaughtered = 1');
  if (query.ids?.length) {
    const keys = query.ids.map((_, i) => `$id${i}`);
    where.push(`r.id IN (${keys.join(', ')})`);
    query.ids.forEach((id, i) => { params[`id${i}`] = id; });
  }
  if (origin && query.radiusKm) {
    const box = boundingBox(origin, query.radiusKm);
    where.push('r.lat BETWEEN $minLat AND $maxLat AND r.lng BETWEEN $minLng AND $maxLng');
    Object.assign(params, box);
  }

  const sql = `${BASE_SELECT} ${where.length ? `WHERE ${where.join(' AND ')}` : ''}`;
  let items = db.prepare(sql).all(params).map((row) => toRestaurant(row, { origin, now }));

  if (origin && query.radiusKm) items = items.filter((r) => r.distanceKm <= query.radiusKm);
  if (query.openNow) items = items.filter((r) => r.openStatus.isOpen);
  if (query.currentCertOnly) items = items.filter((r) => isCurrent(r.certification.status));

  const sort = query.sort || (origin ? 'distance' : 'rating');
  const byRating = (a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount;
  if (sort === 'distance' && origin) items.sort((a, b) => a.distanceKm - b.distanceKm);
  else if (sort === 'name') items.sort((a, b) => a.name.localeCompare(b.name));
  else items.sort(byRating);

  const total = items.length;
  const offset = query.offset ?? 0;
  const limit = query.limit ?? 20;
  return { items: items.slice(offset, offset + limit), total, limit, offset };
}

function getById(db, id, { origin, now = new Date() } = {}) {
  const row = db.prepare(`${BASE_SELECT} WHERE r.id = ?`).get(id);
  return row ? toRestaurant(row, { origin, now }) : null;
}

function exists(db, id) {
  return Boolean(db.prepare('SELECT 1 FROM restaurants WHERE id = ?').get(id));
}

/** Cities with a centre point, used when the user hasn't shared their location. */
function areas(db) {
  return db.prepare(`
    SELECT city, COUNT(*) AS count, AVG(lat) AS lat, AVG(lng) AS lng
    FROM restaurants GROUP BY city ORDER BY city`).all()
    .map((a) => ({ city: a.city, count: a.count, lat: round(a.lat, 4), lng: round(a.lng, 4) }));
}

function facets(db) {
  return {
    categories: db.prepare('SELECT category AS value, COUNT(*) AS count FROM restaurants GROUP BY category ORDER BY count DESC').all(),
    cuisines: db.prepare('SELECT cuisine AS value, COUNT(*) AS count FROM restaurants GROUP BY cuisine ORDER BY cuisine').all(),
  };
}

module.exports = { list, getById, exists, areas, facets, toRestaurant };
