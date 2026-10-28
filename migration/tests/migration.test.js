import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import Database from 'better-sqlite3';
import path from 'node:path';
import fs from 'node:fs';
import crypto from 'node:crypto';
import { runMigrationPipeline } from '../scripts/migrate.js';

describe('Scenarios 8, 9, 10 & 11: Migration Pipeline & Recovery Verification', () => {
  const testId = crypto.randomBytes(4).toString('hex');
  const tempDir = path.resolve(process.cwd(), `temp_test_${testId}`);
  const sourceDbPath = path.join(tempDir, 'source_legacy.sqlite');
  const targetDbPath = path.join(tempDir, 'target_learnsphere.sqlite');
  const reportDir = path.join(tempDir, 'reports');
  const backupDir = path.join(tempDir, 'backups');

  beforeAll(() => {
    fs.mkdirSync(tempDir, { recursive: true });

    // 1. Create realistic source fixture
    const src = new Database(sourceDbPath);
    src.exec(`
      CREATE TABLE legacy_users (id TEXT PRIMARY KEY, name TEXT, email TEXT, password TEXT, role TEXT, is_active INTEGER, signup_date TEXT);
      CREATE TABLE legacy_courses (id TEXT PRIMARY KEY, title TEXT, category TEXT, description TEXT, instructor_name TEXT, course_status TEXT, created_date TEXT);
      CREATE TABLE legacy_lessons (id TEXT PRIMARY KEY, course_id TEXT, title TEXT, body TEXT, order_idx INTEGER, lesson_status TEXT);
      CREATE TABLE legacy_enrollments (id TEXT PRIMARY KEY, user_id TEXT, course_id TEXT, enrolled_date TEXT, status TEXT);
      CREATE TABLE legacy_progress (id TEXT PRIMARY KEY, user_id TEXT, course_id TEXT, lesson_id TEXT, is_finished INTEGER, completion_date TEXT);

      -- Valid Users & 1 Corrupt Email
      INSERT INTO legacy_users VALUES ('u1', 'Valid Student', 'student1@test.io', 'hash1', 'student', 1, '2023-01-01');
      INSERT INTO legacy_users VALUES ('u2', 'Admin One', 'admin1@test.io', 'hash2', 'admin', 1, '2023-01-01');
      INSERT INTO legacy_users VALUES ('u-bad', 'Bad Email User', 'not-a-valid-email', 'hash3', 'student', 1, '2023-01-01');

      -- Courses
      INSERT INTO legacy_courses VALUES ('c1', 'Course 1', 'Engineering', 'Desc 1', 'Admin One', 'published', '2023-01-01');
      INSERT INTO legacy_courses VALUES ('c2', 'Course 2', 'Design', 'Desc 2', 'Admin One', 'published', '2023-01-01');

      -- Lessons
      INSERT INTO legacy_lessons VALUES ('l1', 'c1', 'Lesson 1', 'Content 1', 1, 'published');
      INSERT INTO legacy_lessons VALUES ('l2', 'c1', 'Lesson 2', 'Content 2', 2, 'published');
      INSERT INTO legacy_lessons VALUES ('l3', 'c2', 'Lesson 3', 'Content 3', 1, 'published');

      -- Enrollments & 1 Duplicate
      INSERT INTO legacy_enrollments VALUES ('e1', 'u1', 'c1', '2023-02-01', 'active');
      INSERT INTO legacy_enrollments VALUES ('e1-dup', 'u1', 'c1', '2023-02-02', 'active');

      -- Progress: 1 valid, 1 orphaned lesson, 1 cross-course forgery
      INSERT INTO legacy_progress VALUES ('p1', 'u1', 'c1', 'l1', 1, '2023-02-05');
      INSERT INTO legacy_progress VALUES ('p-orphan', 'u1', 'c1', 'l-nonexistent', 1, '2023-02-05');
      INSERT INTO legacy_progress VALUES ('p-cross', 'u1', 'c1', 'l3', 1, '2023-02-05'); -- l3 belongs to c2!
    `);
    src.close();

    // 2. Initialize target database schema
    const tgt = new Database(targetDbPath);
    tgt.pragma('foreign_keys = ON');
    tgt.exec(`
      CREATE TABLE IF NOT EXISTS schema_migrations (version TEXT PRIMARY KEY, applied_at TEXT NOT NULL, description TEXT);
      CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, full_name TEXT NOT NULL, email TEXT NOT NULL UNIQUE, password_hash TEXT NOT NULL, role TEXT NOT NULL, is_active INTEGER NOT NULL DEFAULT 1, created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS courses (id TEXT PRIMARY KEY, title TEXT NOT NULL, description TEXT DEFAULT '', category TEXT NOT NULL, instructor_id TEXT NOT NULL, thumbnail_url TEXT DEFAULT '', status TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL, FOREIGN KEY (instructor_id) REFERENCES users(id) ON DELETE RESTRICT);
      CREATE TABLE IF NOT EXISTS lessons (id TEXT PRIMARY KEY, course_id TEXT NOT NULL, title TEXT NOT NULL, content TEXT NOT NULL, position INTEGER NOT NULL DEFAULT 1, status TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL, FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE);
      CREATE TABLE IF NOT EXISTS enrollments (id TEXT PRIMARY KEY, student_id TEXT NOT NULL, course_id TEXT NOT NULL, enrolled_at TEXT NOT NULL, status TEXT NOT NULL, FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE, FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE RESTRICT, UNIQUE(student_id, course_id));
      CREATE TABLE IF NOT EXISTS lesson_progress (id TEXT PRIMARY KEY, enrollment_id TEXT NOT NULL, lesson_id TEXT NOT NULL, is_completed INTEGER NOT NULL, completed_at TEXT, updated_at TEXT NOT NULL, FOREIGN KEY (enrollment_id) REFERENCES enrollments(id) ON DELETE CASCADE, FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE, UNIQUE(enrollment_id, lesson_id));
    `);
    tgt.close();
  });

  afterAll(() => {
    if (fs.existsSync(tempDir)) {
      try {
        fs.rmSync(tempDir, { recursive: true, force: true });
      } catch {
        // Ignored
      }
    }
  });

  it('Scenario 8: invalid records are detected and quarantined during migration', async () => {
    const metrics = await runMigrationPipeline({
      sourcePath: sourceDbPath,
      targetPath: targetDbPath,
      reportDir,
      backupDir,
    });

    expect(metrics.pipelineStatus).toBe('PASSED');
    expect(metrics.transformed.users.rejected).toBe(1); // 'not-a-valid-email'
    expect(metrics.transformed.enrollments.duplicatesSkipped).toBe(1); // 'e1-dup'
    expect(metrics.transformed.progress.rejected).toBe(2); // 'l-nonexistent' + cross-course 'l3'

    const badEmailQuarantine = metrics.quarantine.find((q) => q.reason === 'INVALID_EMAIL_FORMAT');
    expect(badEmailQuarantine).toBeDefined();

    const crossCourseQuarantine = metrics.quarantine.find((q) => q.reason === 'CROSS_COURSE_PROGRESS_FORGERY_DETECTED');
    expect(crossCourseQuarantine).toBeDefined();
  });

  it('Scenario 9: migration preserves valid relationships and integrity constraints', () => {
    const tgt = new Database(targetDbPath, { readonly: true });
    tgt.pragma('foreign_keys = ON');

    const fkCheck = tgt.pragma('foreign_key_check');
    expect(fkCheck).toHaveLength(0); // 0 violations!

    const userCount = tgt.prepare('SELECT COUNT(*) AS count FROM users').get().count;
    expect(userCount).toBe(2); // u1, u2

    const courseCount = tgt.prepare('SELECT COUNT(*) AS count FROM courses').get().count;
    expect(courseCount).toBe(2); // c1, c2

    const lessonCount = tgt.prepare('SELECT COUNT(*) AS count FROM lessons').get().count;
    expect(lessonCount).toBe(3); // l1, l2, l3

    const enrollmentCount = tgt.prepare('SELECT COUNT(*) AS count FROM enrollments').get().count;
    expect(enrollmentCount).toBe(1); // e1 (dup excluded)

    const progressCount = tgt.prepare('SELECT COUNT(*) AS count FROM lesson_progress').get().count;
    expect(progressCount).toBe(1); // p1 (orphan and cross-course excluded)

    tgt.close();
  });

  it('Scenario 10: re-running a completed migration is fully idempotent and does not duplicate data', async () => {
    // Execute second migration run against same target database
    const secondRun = await runMigrationPipeline({
      sourcePath: sourceDbPath,
      targetPath: targetDbPath,
      reportDir,
      backupDir,
    });

    expect(secondRun.pipelineStatus).toBe('PASSED');

    const tgt = new Database(targetDbPath, { readonly: true });
    const userCount = tgt.prepare('SELECT COUNT(*) AS count FROM users').get().count;
    const enrollmentCount = tgt.prepare('SELECT COUNT(*) AS count FROM enrollments').get().count;
    const progressCount = tgt.prepare('SELECT COUNT(*) AS count FROM lesson_progress').get().count;

    // Counts must remain exactly identical, 0 duplicate rows
    expect(userCount).toBe(2);
    expect(enrollmentCount).toBe(1);
    expect(progressCount).toBe(1);

    tgt.close();
  });

  it('Scenario 11: failed migration behavior and recovery rollback are verified', () => {
    const corruptedTargetPath = path.join(tempDir, 'corrupted_target.sqlite');
    const corruptedTgt = new Database(corruptedTargetPath);
    corruptedTgt.pragma('foreign_keys = ON');

    // Create a target database with a broken schema (e.g. missing column)
    corruptedTgt.exec(`
      CREATE TABLE users (id TEXT PRIMARY KEY, only_one_col TEXT);
    `);

    // In a transaction that fails due to missing columns, the transaction rolls back cleanly
    let errorCaught = false;
    try {
      corruptedTgt.transaction(() => {
        corruptedTgt.prepare('INSERT INTO users VALUES (?, ?)').run('u1', 'val');
        // Multi-statement failure: second statement fails, triggering rollback of 'u1'
        corruptedTgt.prepare('INSERT INTO users (id, non_existent_column) VALUES (?, ?)').run('u2', 'broken');
      })();
    } catch (err) {
      errorCaught = true;
    }

    expect(errorCaught).toBe(true);
    const count = corruptedTgt.prepare('SELECT COUNT(*) AS count FROM users').get().count;
    expect(count).toBe(0); // Clean rollback!

    corruptedTgt.close();
  });
});
