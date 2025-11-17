import jwt from 'jsonwebtoken';

export function authenticate(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ status: 'error', message: 'Token gerekli' });
    }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    return next();
  } catch (err) {
    return res.status(401).json({ status: 'error', message: 'Geçersiz veya süresi dolmuş token' });
  }
}

export function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ status: 'error', message: 'Yetkisiz erişim' });
    }
    if (roles.length && !roles.includes(req.user.role)) {
      return res.status(403).json({ status: 'error', message: 'Bu işlem için yetkiniz yok' });
    }
    return next();
  };
}

export function optionalAuthenticate(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace('Bearer ', '');
  if (!token) {
    return next();
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
  } catch (err) {
    return res.status(401).json({ status: 'error', message: 'Geçersiz veya süresi dolmuş token' });
  }
  return next();
}

