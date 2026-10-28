import { getDatabase } from '../../database/index.js';

export class AuthRepository {
  // ponytail: matches email, full name, or email username prefix case-insensitively in a single query. Upgrade path: dedicated unique username column and B-tree index.
  findByEmail(identifier) {
    const db = getDatabase();
    return db.prepare(`
      SELECT * FROM users 
      WHERE lower(email) = lower(?) 
         OR lower(full_name) = lower(?)
         OR lower(substr(email, 1, instr(email, '@') - 1)) = lower(?)
    `).get(identifier, identifier, identifier);
  }

  findById(id) {
    const db = getDatabase();
    return db.prepare('SELECT id, full_name, email, role, is_active, created_at, updated_at FROM users WHERE id = ?').get(id);
  }

  createUser({ id, fullName, email, passwordHash, role = 'student', createdAt, updatedAt }) {
    const db = getDatabase();
    db.prepare(`
      INSERT INTO users (id, full_name, email, password_hash, role, is_active, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, 1, ?, ?)
    `).run(id, fullName, email, passwordHash, role, createdAt, updatedAt);

    return this.findById(id);
  }
}

export const authRepository = new AuthRepository();
