import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import { UnauthorizedError, ForbiddenError } from '../utils/errors.js';
import { getDatabase } from '../database/index.js';

export function requireAuth(req, _res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new UnauthorizedError('Authentication token required', null, 'MISSING_TOKEN'));
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, config.jwtSecret, { algorithms: ['HS256'] });
    const db = getDatabase();
    const user = db.prepare('SELECT id, full_name, email, role, is_active FROM users WHERE id = ?').get(decoded.sub);

    if (!user) {
      return next(new UnauthorizedError('User account not found', null, 'USER_NOT_FOUND'));
    }

    if (!user.is_active) {
      return next(new ForbiddenError('User account is deactivated', null, 'ACCOUNT_DEACTIVATED'));
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return next(new UnauthorizedError('Authentication token has expired', null, 'TOKEN_EXPIRED'));
    }
    return next(new UnauthorizedError('Invalid authentication token', null, 'INVALID_TOKEN'));
  }
}

export function optionalAuth(req, _res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = null;
    return next();
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, config.jwtSecret, { algorithms: ['HS256'] });
    const db = getDatabase();
    const user = db.prepare('SELECT id, full_name, email, role, is_active FROM users WHERE id = ?').get(decoded.sub);
    req.user = user && user.is_active ? user : null;
  } catch {
    req.user = null;
  }
  next();
}

export function requireRole(...allowedRoles) {
  return (req, _res, next) => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required'));
    }
    if (!allowedRoles.includes(req.user.role)) {
      return next(new ForbiddenError(`Access restricted to roles: [${allowedRoles.join(', ')}]`, null, 'INSUFFICIENT_PERMISSIONS'));
    }
    next();
  };
}
