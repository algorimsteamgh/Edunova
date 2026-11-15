import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';
import { authRepository } from './repository.js';
import { ConflictError, UnauthorizedError } from '../../utils/errors.js';
import { config } from '../../config/index.js';
import { logAuditEvent } from '../../utils/auditLogger.js';

export class AuthService {
  async register({ fullName, email, password }) {
    const existing = await authRepository.findByEmail(email);
    if (existing) {
      throw new ConflictError('A user with this email address already exists', null, 'EMAIL_ALREADY_REGISTERED');
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    const userId = crypto.randomUUID();
    const now = new Date().toISOString();

    // Students are registered with role 'student' strictly
    const user = await authRepository.createUser({
      id: userId,
      fullName,
      email,
      passwordHash,
      role: 'student',
      createdAt: now,
      updatedAt: now,
    });

    await logAuditEvent(userId, 'USER_REGISTERED', 'user', userId, { email, role: 'student' });

    const token = this.generateToken(user);
    return { user, token };
  }

  async login({ email, password }) {
    const user = await authRepository.findByEmail(email);
    if (!user) {
      throw new UnauthorizedError('Invalid email or password', null, 'INVALID_CREDENTIALS');
    }

    if (!user.is_active) {
      throw new UnauthorizedError('This account has been deactivated', null, 'ACCOUNT_DEACTIVATED');
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      await logAuditEvent(user.id, 'USER_LOGIN_FAILED', 'user', user.id, { email });
      throw new UnauthorizedError('Invalid email or password', null, 'INVALID_CREDENTIALS');
    }

    const { password_hash, ...safeUser } = user;
    const token = this.generateToken(safeUser);

    await logAuditEvent(user.id, 'USER_LOGIN_SUCCESS', 'user', user.id, { email });
    return { user: safeUser, token };
  }

  generateToken(user) {
    return jwt.sign(
      {
        sub: user.id,
        email: user.email,
        role: user.role,
      },
      config.jwtSecret,
      { algorithm: 'HS256', expiresIn: config.jwtExpiresIn }
    );
  }

  async getCurrentUser(userId) {
    const user = await authRepository.findById(userId);
    if (!user) {
      throw new UnauthorizedError('User account no longer exists');
    }
    return user;
  }
}

export const authService = new AuthService();
