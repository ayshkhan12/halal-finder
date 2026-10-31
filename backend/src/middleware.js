const jwt = require('jsonwebtoken');
const { z } = require('zod');
const { HttpError } = require('./lib/errors');

/** Parses `source` (query/body/params) with a zod schema and stores the result on req.valid. */
const validate = (source, schema) => (req, _res, next) => {
  const result = schema.safeParse(req[source] ?? {});
  if (!result.success) {
    const fields = {};
    for (const issue of result.error.issues) {
      const key = issue.path.join('.') || source;
      fields[key] ??= issue.message;
    }
    return next(new HttpError(400, 'validation_error', 'Some fields are missing or invalid.', fields));
  }
  req.valid = { ...req.valid, [source]: result.data };
  return next();
};

function readToken(req, secret) {
  const header = req.get('authorization') || '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) return null;
  try {
    return jwt.verify(token, secret);
  } catch {
    return undefined; // present but invalid
  }
}

const requireAuth = (secret) => (req, _res, next) => {
  const payload = readToken(req, secret);
  if (!payload) return next(new HttpError(401, 'unauthorized', 'Please sign in to continue.'));
  req.userId = payload.sub;
  return next();
};

/** Attaches the user if a valid token is sent, but never blocks the request. */
const optionalAuth = (secret) => (req, _res, next) => {
  const payload = readToken(req, secret);
  if (payload) req.userId = payload.sub;
  next();
};

// Shared query helpers ---------------------------------------------------------

const boolParam = z
  .enum(['true', 'false', '1', '0'])
  .transform((v) => v === 'true' || v === '1')
  .optional();

const csvParam = z
  .string()
  .transform((v) => v.split(',').map((s) => s.trim()).filter(Boolean))
  .optional();

const pagination = {
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
};

function errorHandler(err, _req, res, _next) {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: { code: err.code, message: err.message, fields: err.details } });
  }
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: { code: 'bad_json', message: 'Request body is not valid JSON.' } });
  }
  console.error(err);
  return res.status(500).json({ error: { code: 'server_error', message: 'Something went wrong on our side.' } });
}

module.exports = { validate, requireAuth, optionalAuth, boolParam, csvParam, pagination, errorHandler };
