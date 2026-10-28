/**
 * =========================================================================
 * LEGACY LMS MONOLITHIC SERVER (FOR MODERNIZATION REFERENCE ONLY)
 * =========================================================================
 * WARNING: This file illustrates legacy anti-patterns:
 * 1. Monolithic route handlers mixing SQL, business logic, and presentation.
 * 2. Disabled foreign keys (PRAGMA foreign_keys = OFF).
 * 3. Weak MD5 password hashing.
 * 4. Inconsistent error responses (random strings or 500 dumps).
 * 5. Direct editable progress percentage stored as source of truth.
 * 6. Missing transactions during multi-step mutations.
 * =========================================================================
 */

import express from 'express';
import Database from 'better-sqlite3';
import crypto from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.resolve(__dirname, '../data/legacy.sqlite');

const app = express();
app.use(express.json());

// Legacy: foreign keys disabled by default in SQLite
const db = new Database(dbPath);
console.log('[LEGACY] Connected to legacy sqlite database at', dbPath);

function md5Hash(str) {
  return crypto.createHash('md5').update(str).digest('hex');
}

// Insecure Login with MD5 and plaintext comparison
app.post('/legacy/login', (req, res) => {
  const { email, password } = req.body;
  const hash = md5Hash(password);

  // Anti-pattern: string concatenation or raw query
  const user = db.prepare(`SELECT * FROM legacy_users WHERE email = ? AND password = ?`).get(email, hash);

  if (!user) {
    return res.status(401).send('Invalid user or pass'); // Non-standard error
  }

  // Anti-pattern: returning full user record including password hash
  res.json({ success: true, user });
});

// Monolithic Course + Lesson Fetch
app.get('/legacy/courses/:id', (req, res) => {
  try {
    const course = db.prepare('SELECT * FROM legacy_courses WHERE id = ?').get(req.params.id);
    if (!course) return res.status(404).send('Not found');

    const lessons = db.prepare('SELECT * FROM legacy_lessons WHERE course_id = ?').all(req.params.id);
    res.json({ course, lessons });
  } catch (err) {
    res.status(500).send(err.stack); // Anti-pattern: leaking stack trace
  }
});

// Anti-pattern: Editable progress percentage directly stored without derivation
app.post('/legacy/progress', (req, res) => {
  const { userId, courseId, progressPercent } = req.body;

  // No cross-course validation, no foreign key check
  db.prepare(`
    INSERT INTO legacy_progress (user_id, course_id, progress_percent)
    VALUES (?, ?, ?)
  `).run(userId, courseId, progressPercent);

  res.send('Progress saved');
});

const PORT = 5099;
if (process.argv[1] && process.argv[1].endsWith('server.js')) {
  app.listen(PORT, () => console.log(`[LEGACY] Server running on port ${PORT}`));
}

export default app;
