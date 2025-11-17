import logger from '../utils/logger.js';

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  const message = err.message || 'Beklenmeyen bir hata oluştu';

  logger.error(message, { status, stack: err.stack });

  res.status(status).json({
    status: 'error',
    message,
    details: err.details || undefined,
  });
}

export function notFound(req, res) {
  res.status(404).json({
    status: 'error',
    message: `Endpoint bulunamadı: ${req.originalUrl}`,
  });
}

