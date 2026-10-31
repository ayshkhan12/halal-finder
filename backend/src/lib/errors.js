class HttpError extends Error {
  constructor(status, code, message, details) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

const notFound = (what = 'Resource') => new HttpError(404, 'not_found', `${what} not found.`);

module.exports = { HttpError, notFound };
