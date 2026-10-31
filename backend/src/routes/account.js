const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { randomUUID } = require('node:crypto');
const { rateLimit } = require('express-rate-limit');
const { z } = require('zod');
const { validate, requireAuth, optionalAuth } = require('../middleware');
const { HttpError, notFound } = require('../lib/errors');
const users = require('../repositories/users');
const favorites = require('../repositories/favorites');
const restaurants = require('../repositories/restaurants');
const products = require('../repositories/products');

const email = z.string().trim().toLowerCase().pipe(z.email('Enter a valid email address'));

const registerBody = z.object({
  name: z.string().trim().min(1, 'Enter your name').max(80),
  email,
  password: z.string().min(8, 'Use at least 8 characters').max(128),
});
const loginBody = z.object({ email, password: z.string().min(1, 'Enter your password').max(128) });

const itemType = z.enum(['restaurant', 'product']);
const favoriteParams = z.object({ itemType, itemId: z.string().min(1).max(80) });
const syncBody = z.object({
  items: z.array(z.object({ itemType, itemId: z.string().min(1).max(80) })).max(500),
});

const REPORT_REASONS = ['not_halal', 'certificate_expired', 'permanently_closed', 'wrong_details', 'other'];
const reportBody = z.object({
  itemType,
  itemId: z.string().min(1).max(80),
  reason: z.enum(REPORT_REASONS),
  details: z.string().trim().max(1000).optional(),
});

function accountRouter(db, config) {
  const router = express.Router();
  const strictLimit = rateLimit({ windowMs: 15 * 60 * 1000, limit: config.isTest ? 1000 : 30, standardHeaders: 'draft-8', legacyHeaders: false });
  const issueToken = (user) => jwt.sign({ sub: user.id }, config.jwtSecret, { expiresIn: config.jwtExpiresIn });
  const auth = requireAuth(config.jwtSecret);
  const itemExists = (type, id) => (type === 'restaurant' ? restaurants.exists(db, id) : products.exists(db, id));

  // Auth -----------------------------------------------------------------------

  router.post('/auth/register', strictLimit, validate('body', registerBody), async (req, res) => {
    const { name, email: address, password } = req.valid.body;
    if (users.getAuthRecordByEmail(db, address)) {
      throw new HttpError(409, 'email_taken', 'An account with this email already exists.', { email: 'Already registered' });
    }
    const user = users.create(db, { name, email: address, passwordHash: await bcrypt.hash(password, 10) });
    res.status(201).json({ data: { token: issueToken(user), user } });
  });

  router.post('/auth/login', strictLimit, validate('body', loginBody), async (req, res) => {
    const { email: address, password } = req.valid.body;
    const record = users.getAuthRecordByEmail(db, address);
    const ok = record && (await bcrypt.compare(password, record.password_hash));
    if (!ok) throw new HttpError(401, 'invalid_credentials', 'Email or password is incorrect.');
    const user = users.toUser(record);
    res.json({ data: { token: issueToken(user), user } });
  });

  router.get('/auth/me', auth, (req, res) => {
    const user = users.getById(db, req.userId);
    if (!user) throw new HttpError(401, 'unauthorized', 'Please sign in again.');
    res.json({ data: user });
  });

  // Favourites -----------------------------------------------------------------

  const favouritesPayload = (userId) => {
    const keys = favorites.listKeys(db, userId);
    const ids = (type) => keys.filter((k) => k.itemType === type).map((k) => k.itemId);
    const restaurantIds = ids('restaurant');
    const productIds = ids('product');
    return {
      items: keys,
      restaurants: restaurantIds.length ? restaurants.list(db, { ids: restaurantIds, limit: 500 }).items : [],
      products: productIds.length ? products.list(db, { ids: productIds, limit: 100 }).items : [],
    };
  };

  router.get('/favorites', auth, (req, res) => {
    res.json({ data: favouritesPayload(req.userId) });
  });

  router.put('/favorites/:itemType/:itemId', auth, validate('params', favoriteParams), (req, res) => {
    const { itemType: type, itemId } = req.valid.params;
    if (!itemExists(type, itemId)) throw notFound(type === 'restaurant' ? 'Restaurant' : 'Product');
    favorites.add(db, req.userId, type, itemId);
    res.status(204).end();
  });

  router.delete('/favorites/:itemType/:itemId', auth, validate('params', favoriteParams), (req, res) => {
    const { itemType: type, itemId } = req.valid.params;
    favorites.remove(db, req.userId, type, itemId);
    res.status(204).end();
  });

  /** Merges favourites saved on the device before signing in. */
  router.post('/favorites/sync', auth, validate('body', syncBody), (req, res) => {
    for (const { itemType: type, itemId } of req.valid.body.items) {
      if (itemExists(type, itemId)) favorites.add(db, req.userId, type, itemId);
    }
    res.json({ data: favouritesPayload(req.userId) });
  });

  // Community reports ----------------------------------------------------------

  router.post('/reports', strictLimit, optionalAuth(config.jwtSecret), validate('body', reportBody), (req, res) => {
    const { itemType: type, itemId, reason, details } = req.valid.body;
    if (!itemExists(type, itemId)) throw notFound(type === 'restaurant' ? 'Restaurant' : 'Product');
    const id = randomUUID();
    db.prepare('INSERT INTO reports (id, user_id, item_type, item_id, reason, details) VALUES (?, ?, ?, ?, ?, ?)')
      .run(id, req.userId ?? null, type, itemId, reason, details ?? null);
    res.status(201).json({ data: { id, status: 'open' } });
  });

  return router;
}

module.exports = { accountRouter, REPORT_REASONS };
