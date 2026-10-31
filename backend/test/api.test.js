process.env.NODE_ENV = 'test';

const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const config = require('../src/config');
const { openDatabase } = require('../src/db');
const { createApp } = require('../src/app');
const { ean13 } = require('../src/db/seed');

let server;
let base;
let db;

before(async () => {
  db = openDatabase(':memory:');
  const app = createApp({ db, config });
  await new Promise((resolve) => { server = app.listen(0, '127.0.0.1', resolve); });
  base = `http://127.0.0.1:${server.address().port}/api/v1`;
});

after(() => {
  server.close();
  db.close();
});

const get = async (path, token) => {
  const res = await fetch(base + path, { headers: token ? { authorization: `Bearer ${token}` } : {} });
  return { status: res.status, body: res.status === 204 ? null : await res.json() };
};
const send = async (method, path, body, token) => {
  const res = await fetch(base + path, {
    method,
    headers: { 'content-type': 'application/json', ...(token ? { authorization: `Bearer ${token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  return { status: res.status, body: res.status === 204 ? null : await res.json() };
};

const HULL = { lat: 53.7446, lng: -0.3352 };

describe('restaurants', () => {
  test('lists restaurants with paging metadata', async () => {
    const { status, body } = await get('/restaurants?limit=5');
    assert.equal(status, 200);
    assert.equal(body.data.length, 5);
    assert.ok(body.meta.total > 30);
    const r = body.data[0];
    assert.ok(r.certification.certifier.shortName);
    assert.equal(typeof r.openStatus.isOpen, 'boolean');
  });

  test('sorts by distance and respects the radius', async () => {
    const { body } = await get(`/restaurants?lat=${HULL.lat}&lng=${HULL.lng}&radiusKm=10&limit=100`);
    assert.ok(body.data.length >= 6);
    assert.ok(body.data.every((r) => r.address.city === 'Hull'));
    assert.ok(body.data.every((r) => r.distanceKm <= 10));
    const distances = body.data.map((r) => r.distanceKm);
    assert.deepEqual(distances, [...distances].sort((a, b) => a - b));
  });

  test('filters by halal attributes and category', async () => {
    const { body } = await get('/restaurants?fullyHalal=true&alcoholFree=true&limit=100');
    assert.ok(body.data.every((r) => r.halal.status === 'fully_halal' && r.halal.alcoholFree));

    const butchers = await get('/restaurants?category=butcher,grocery&limit=100');
    assert.ok(butchers.body.data.length > 0);
    assert.ok(butchers.body.data.every((r) => ['butcher', 'grocery'].includes(r.category)));
  });

  test('can hide venues whose certificate has lapsed', async () => {
    const all = await get('/restaurants?limit=100');
    const current = await get('/restaurants?currentCertOnly=true&limit=100');
    assert.ok(all.body.data.some((r) => r.certification.status === 'expired'));
    assert.ok(current.body.data.every((r) => r.certification.status !== 'expired'));
    assert.ok(current.body.meta.total < all.body.meta.total);
  });

  test('searches by name, cuisine or city', async () => {
    const { body } = await get('/restaurants?q=syrian');
    assert.ok(body.data.length >= 2);
    assert.ok(body.data.every((r) => /syrian/i.test(r.name + r.cuisine + r.description)));
  });

  test('rejects invalid query parameters with field errors', async () => {
    const { status, body } = await get('/restaurants?lat=999&lng=0');
    assert.equal(status, 400);
    assert.equal(body.error.code, 'validation_error');
    assert.ok(body.error.fields.lat);

    const half = await get('/restaurants?lat=53');
    assert.equal(half.status, 400);

    const badCategory = await get('/restaurants?category=nightclub');
    assert.equal(badCategory.status, 400);
  });

  test('returns detail with distance and 404 for unknown ids', async () => {
    const { status, body } = await get(`/restaurants/levant-kitchen-hull?lat=${HULL.lat}&lng=${HULL.lng}`);
    assert.equal(status, 200);
    assert.equal(body.data.name, 'Levant Kitchen');
    assert.ok(body.data.distanceKm > 0);
    assert.ok(body.data.hours.mon);

    const missing = await get('/restaurants/nope');
    assert.equal(missing.status, 404);
  });
});

describe('products', () => {
  test('lists, filters and searches products', async () => {
    const { body } = await get('/products?category=Dairy');
    assert.ok(body.data.length >= 2);
    assert.ok(body.data.every((p) => p.category === 'Dairy'));

    const vegan = await get('/products?dietary=vegan&limit=100');
    assert.ok(vegan.body.data.every((p) => p.dietary.includes('vegan')));

    const search = await get('/products?q=noor');
    assert.ok(search.body.data.every((p) => p.brand === 'Noor Dairy'));
  });

  test('looks up a product by barcode', async () => {
    const code = ean13('200100000005');
    const { status, body } = await get(`/products/barcode/${code}`);
    assert.equal(status, 200);
    assert.equal(body.data.name, 'Greek-Style Yoghurt');

    const expired = await get(`/products/barcode/${ean13('200100000009')}`);
    assert.equal(expired.body.data.certification.status, 'expired');

    assert.equal((await get('/products/barcode/5000000000000')).status, 404);
    assert.equal((await get('/products/barcode/abc')).status, 400);
  });

  test('includes nearest stockists in product detail', async () => {
    const { body } = await get(`/products/beef-mince-pure-halal?lat=${HULL.lat}&lng=${HULL.lng}`);
    assert.ok(body.data.stockists.length >= 2);
    assert.equal(body.data.stockists[0].id, 'medina-butchers-hull');
  });
});

describe('reference data', () => {
  test('lists certifiers with counts, and meta facets', async () => {
    const { body } = await get('/certifiers');
    const hmc = body.data.find((c) => c.id === 'hmc');
    assert.ok(hmc.restaurantCount > 0);
    assert.equal(hmc.slaughterPolicy, 'hand_only');

    const meta = await get('/meta');
    assert.ok(meta.body.data.areas.some((a) => a.city === 'Hull'));
    assert.ok(meta.body.data.categories.length >= 5);
  });
});

describe('accounts and favourites', () => {
  let token;

  test('registers, rejects duplicates and logs in', async () => {
    const reg = await send('POST', '/auth/register', { name: 'Amina', email: 'Amina@Example.com', password: 'correct horse' });
    assert.equal(reg.status, 201);
    assert.equal(reg.body.data.user.email, 'amina@example.com');
    assert.ok(!('password_hash' in reg.body.data.user));

    const dup = await send('POST', '/auth/register', { name: 'A', email: 'amina@example.com', password: 'another one' });
    assert.equal(dup.status, 409);

    const bad = await send('POST', '/auth/login', { email: 'amina@example.com', password: 'wrong password' });
    assert.equal(bad.status, 401);

    const ok = await send('POST', '/auth/login', { email: 'AMINA@example.com', password: 'correct horse' });
    assert.equal(ok.status, 200);
    token = ok.body.data.token;

    const me = await get('/auth/me', token);
    assert.equal(me.body.data.name, 'Amina');
  });

  test('validates registration input', async () => {
    const { status, body } = await send('POST', '/auth/register', { name: '', email: 'not-an-email', password: 'short' });
    assert.equal(status, 400);
    assert.ok(body.error.fields.name && body.error.fields.email && body.error.fields.password);
  });

  test('requires auth for favourites', async () => {
    assert.equal((await get('/favorites')).status, 401);
    assert.equal((await get('/favorites', 'garbage')).status, 401);
  });

  test('adds, lists, syncs and removes favourites', async () => {
    assert.equal((await send('PUT', '/favorites/restaurant/levant-kitchen-hull', null, token)).status, 204);
    assert.equal((await send('PUT', '/favorites/restaurant/levant-kitchen-hull', null, token)).status, 204); // idempotent
    assert.equal((await send('PUT', '/favorites/restaurant/does-not-exist', null, token)).status, 404);

    const synced = await send('POST', '/favorites/sync', {
      items: [{ itemType: 'product', itemId: 'tahini-levant' }, { itemType: 'product', itemId: 'ghost' }],
    }, token);
    assert.equal(synced.status, 200);
    assert.equal(synced.body.data.items.length, 2);
    assert.equal(synced.body.data.restaurants[0].id, 'levant-kitchen-hull');
    assert.equal(synced.body.data.products[0].id, 'tahini-levant');

    assert.equal((await send('DELETE', '/favorites/product/tahini-levant', null, token)).status, 204);
    const after = await get('/favorites', token);
    assert.equal(after.body.data.items.length, 1);
  });

  test('accepts community reports without signing in', async () => {
    const ok = await send('POST', '/reports', { itemType: 'restaurant', itemId: 'saffron-lounge-hull', reason: 'wrong_details', details: 'New phone number' });
    assert.equal(ok.status, 201);
    const bad = await send('POST', '/reports', { itemType: 'restaurant', itemId: 'saffron-lounge-hull', reason: 'meh' });
    assert.equal(bad.status, 400);
  });
});
