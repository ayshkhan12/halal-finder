const fs = require('node:fs');
const path = require('node:path');

const envFile = path.join(__dirname, '..', '.env');
if (fs.existsSync(envFile)) process.loadEnvFile(envFile);

const isProduction = process.env.NODE_ENV === 'production';
const isTest = process.env.NODE_ENV === 'test';

const jwtSecret = process.env.JWT_SECRET || (isProduction ? null : 'dev-only-not-a-secret');
if (!jwtSecret) {
  throw new Error('JWT_SECRET must be set when NODE_ENV=production');
}

module.exports = {
  isProduction,
  isTest,
  port: Number(process.env.PORT) || 3000,
  // 0.0.0.0 so a phone running Expo Go on the same Wi-Fi can reach the API.
  host: process.env.HOST || '0.0.0.0',
  dbPath: process.env.DB_PATH || path.join(__dirname, '..', 'data', 'halal-finder.db'),
  jwtSecret,
  jwtExpiresIn: '7d',
  corsOrigins: process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',').map((o) => o.trim())
    : '*',
};
