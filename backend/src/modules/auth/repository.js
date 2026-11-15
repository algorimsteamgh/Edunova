import { getDatabase } from '../../database/index.js';

export class AuthRepository {
  // ponytail: matches email, full name, or email username prefix case-insensitively in a single query. Upgrade path: dedicated unique username column and B-tree index.
  async findByEmail(identifier) {
    const db = getDatabase();
    return await db.prepare(`
      SELECT * FROM users 
      WHERE lower(email) = lower(?) 
         OR lower(full_name) = lower(?)
         OR lower(split_part(email, '@', 1)) = lower(?)
    `).get(identifier, identifier, identifier);
  }

  async findById(id) {
    const db = getDatabase();
    return await db.prepare('SELECT id, full_name, email, role, is_active, created_at, updated_at FROM users WHERE id = ?').get(id);
  }

  async createUser({ id, fullName, email, passwordHash, role = 'student', createdAt, updatedAt }) {
    const db = getDatabase();
    await db.prepare(`
      INSERT INTO users (id, full_name, email, password_hash, role, is_active, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, 1, ?, ?)
    `).run(id, fullName, email, passwordHash, role, createdAt, updatedAt);

    return await this.findById(id);
  }
}

export const authRepository = new AuthRepository();
