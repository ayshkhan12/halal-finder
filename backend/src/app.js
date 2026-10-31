const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { catalogueRouter } = require('./routes/catalogue');
const { accountRouter } = require('./routes/account');
const { errorHandler } = require('./middleware');
const { notFound } = require('./lib/errors');

function createApp({ db, config }) {
  const app = express();
  app.disable('x-powered-by');
  app.use(helmet());
  app.use(cors({ origin: config.corsOrigins }));
  app.use(express.json({ limit: '50kb' }));

  app.get('/', (_req, res) => {
    res.json({ name: 'Halal Finder API', version: 'v1', docs: '/api/v1/health' });
  });
  app.get('/api/v1/health', (_req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  app.use('/api/v1', catalogueRouter(db));
  app.use('/api/v1', accountRouter(db, config));

  app.use((_req, _res, next) => next(notFound('Route')));
  app.use(errorHandler);
  return app;
}

module.exports = { createApp };
