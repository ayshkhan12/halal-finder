const express = require('express');
const { z } = require('zod');
const { validate, boolParam, csvParam, pagination } = require('../middleware');
const { notFound } = require('../lib/errors');
const restaurants = require('../repositories/restaurants');
const products = require('../repositories/products');
const certifiers = require('../repositories/certifiers');

const CATEGORIES = ['restaurant', 'takeaway', 'cafe', 'dessert', 'butcher', 'grocery'];

const originParams = {
  lat: z.coerce.number().min(-90).max(90).optional(),
  lng: z.coerce.number().min(-180).max(180).optional(),
};
const withOrigin = (schema) => schema.refine((q) => (q.lat == null) === (q.lng == null), {
  message: 'lat and lng must be sent together',
  path: ['lat'],
});
const originOf = (q) => (q.lat != null ? { lat: q.lat, lng: q.lng } : undefined);

const restaurantQuery = withOrigin(z.object({
  ...originParams,
  ...pagination,
  q: z.string().trim().max(100).optional(),
  radiusKm: z.coerce.number().positive().max(500).optional(),
  category: z.string()
    .transform((v) => v.split(',').map((s) => s.trim()).filter(Boolean))
    .pipe(z.array(z.enum(CATEGORIES)))
    .optional(),
  cuisine: z.string().max(60).optional(),
  city: z.string().max(60).optional(),
  certifier: z.string().max(40).optional(),
  fullyHalal: boolParam,
  alcoholFree: boolParam,
  handSlaughtered: boolParam,
  openNow: boolParam,
  currentCertOnly: boolParam,
  ids: csvParam,
  sort: z.enum(['distance', 'rating', 'name']).optional(),
}));

const productQuery = z.object({
  ...pagination,
  q: z.string().trim().max(100).optional(),
  category: z.string().max(60).optional(),
  certifier: z.string().max(40).optional(),
  dietary: csvParam,
  ids: csvParam,
});

const idParam = z.object({ id: z.string().min(1).max(80) });
const barcodeParam = z.object({ code: z.string().regex(/^\d{8,14}$/, 'Barcodes are 8 to 14 digits') });

const page = ({ items, total, limit, offset }) => ({ data: items, meta: { total, limit, offset } });

function catalogueRouter(db) {
  const router = express.Router();

  router.get('/restaurants', validate('query', restaurantQuery), (req, res) => {
    res.json(page(restaurants.list(db, req.valid.query)));
  });

  router.get('/restaurants/:id', validate('params', idParam), validate('query', withOrigin(z.object(originParams))), (req, res) => {
    const restaurant = restaurants.getById(db, req.valid.params.id, { origin: originOf(req.valid.query) });
    if (!restaurant) throw notFound('Restaurant');
    res.json({ data: restaurant });
  });

  router.get('/products', validate('query', productQuery), (req, res) => {
    res.json(page(products.list(db, req.valid.query)));
  });

  router.get('/products/barcode/:code', validate('params', barcodeParam), (req, res) => {
    const product = products.getByBarcode(db, req.valid.params.code);
    if (!product) throw notFound('Product');
    res.json({ data: product });
  });

  router.get('/products/:id', validate('params', idParam), validate('query', withOrigin(z.object(originParams))), (req, res) => {
    const product = products.getById(db, req.valid.params.id);
    if (!product) throw notFound('Product');
    const stockists = products.stockists(db, product.id, { origin: originOf(req.valid.query) });
    res.json({ data: { ...product, stockists } });
  });

  router.get('/certifiers', (_req, res) => {
    res.json({ data: certifiers.list(db) });
  });

  router.get('/certifiers/:id', validate('params', idParam), (req, res) => {
    const certifier = certifiers.getById(db, req.valid.params.id);
    if (!certifier) throw notFound('Certification body');
    res.json({ data: certifier });
  });

  router.get('/meta', (_req, res) => {
    res.json({
      data: {
        ...restaurants.facets(db),
        productCategories: products.categories(db),
        areas: restaurants.areas(db),
      },
    });
  });

  return router;
}

module.exports = { catalogueRouter };
