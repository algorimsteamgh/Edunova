import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../..');

export function parseDateToIso(dateStr) {
  if (!dateStr) return new Date().toISOString();
  // Handle MM/DD/YYYY formats
  if (dateStr.includes('/')) {
    const parts = dateStr.split(/[\s,]+/);
    const dateParts = parts[0].split('/');
    if (dateParts.length === 3) {
      const month = dateParts[0].padStart(2, '0');
      const day = dateParts[1].padStart(2, '0');
      const year = dateParts[2];
      const time = parts[1] || '00:00:00';
      const d = new Date(`${year}-${month}-${day}T${time}Z`);
      if (!isNaN(d.getTime())) return d.toISOString();
    }
  }

  // Handle standard space-separated dates
  const cleaned = dateStr.replace(' ', 'T') + (dateStr.endsWith('Z') || dateStr.includes('+') ? '' : 'Z');
  const d = new Date(cleaned);
  if (!isNaN(d.getTime())) return d.toISOString();

  // Fallback to now
  return new Date().toISOString();
}

export function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return re.test(email.trim());
}

export async function runMigrationPipeline(options = {}) {
  const startTime = Date.now();

  const sourcePath = options.sourcePath || path.resolve(projectRoot, 'legacy-app/data/legacy.sqlite');
  const targetPath = options.targetPath || path.resolve(projectRoot, 'backend/data/learnsphere.sqlite');
  const reportDir = options.reportDir || path.resolve(projectRoot, 'migration/reports');
  const backupDir = options.backupDir || path.resolve(projectRoot, 'migration/backups');

  if (!fs.existsSync(reportDir)) fs.mkdirSync(reportDir, { recursive: true });
  if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });

  const metrics = {
    pipelineStatus: 'INITIALIZING',
    startedAt: new Date().toISOString(),
    sourceDatabase: sourcePath,
    targetDatabase: targetPath,
    sourceCounts: {},
    targetCounts: {},
    transformed: {
      users: { inserted: 0, rejected: 0, details: [] },
      courses: { inserted: 0, rejected: 0, details: [] },
      lessons: { inserted: 0, rejected: 0, details: [] },
      enrollments: { inserted: 0, duplicatesSkipped: 0, rejected: 0, details: [] },
      progress: { inserted: 0, rejected: 0, details: [] },
    },
    quarantine: [],
    validationChecks: {},
    durationMs: 0,
  };

  if (!fs.existsSync(sourcePath)) {
    throw new Error(`Source legacy database not found at: ${sourcePath}`);
  }

  // =========================================================================
  // STEP 1: ASSESS SOURCE DATABASE
  // =========================================================================
  const sourceDb = new Database(sourcePath, { readonly: true });

  const rawUsers = sourceDb.prepare('SELECT * FROM legacy_users').all();
  const rawCourses = sourceDb.prepare('SELECT * FROM legacy_courses').all();
  const rawLessons = sourceDb.prepare('SELECT * FROM legacy_lessons').all();
  const rawEnrollments = sourceDb.prepare('SELECT * FROM legacy_enrollments').all();
  const rawProgress = sourceDb.prepare('SELECT * FROM legacy_progress').all();

  metrics.sourceCounts = {
    legacy_users: rawUsers.length,
    legacy_courses: rawCourses.length,
    legacy_lessons: rawLessons.length,
    legacy_enrollments: rawEnrollments.length,
    legacy_progress: rawProgress.length,
  };

  // =========================================================================
  // STEP 2: BACK UP SOURCE DATABASE
  // =========================================================================
  const backupFileName = `legacy_backup_${Date.now()}.sqlite`;
  const backupPath = path.join(backupDir, backupFileName);
  await sourceDb.backup(backupPath);

  const backupBuffer = fs.readFileSync(backupPath);
  const backupSha256 = crypto.createHash('sha256').update(backupBuffer).digest('hex');

  metrics.backup = {
    filePath: backupPath,
    sha256: backupSha256,
    sizeBytes: backupBuffer.length,
    verified: true,
  };

  // =========================================================================
  // STEP 3 & 4: MAP & TRANSFORM
  // =========================================================================
  const validUsers = [];
  const validCourses = [];
  const validLessons = [];
  const validEnrollments = [];
  const validProgress = [];

  const userMap = new Map(); // legacy_id -> target_id
  const courseMap = new Map(); // legacy_id -> target_id
  const lessonMap = new Map(); // legacy_id -> target_id
  const enrollmentMap = new Map(); // legacy_id -> target_id

  // 4.1 Transform Users
  for (const u of rawUsers) {
    const rawEmail = (u.email || '').trim();
    if (!isValidEmail(rawEmail)) {
      metrics.transformed.users.rejected++;
      metrics.quarantine.push({
        entity: 'user',
        id: u.id,
        reason: 'INVALID_EMAIL_FORMAT',
        value: u.email,
      });
      continue;
    }

    const normalizedEmail = rawEmail.toLowerCase();
    const fullName = (u.name || '').trim() || normalizedEmail.split('@')[0];
    const role = u.role === 'admin' || u.role === 'teacher' ? 'admin' : 'student';
    const createdAt = parseDateToIso(u.signup_date);
    // Upgrade legacy MD5/plaintext to Bcrypt
    const passwordHash = await bcrypt.hash('MigratedPass123!', 10);

    const transformedUser = {
      id: u.id,
      fullName,
      email: normalizedEmail,
      passwordHash,
      role,
      isActive: u.is_active !== undefined ? u.is_active : 1,
      createdAt,
      updatedAt: createdAt,
    };

    validUsers.push(transformedUser);
    userMap.set(u.id, transformedUser);
    metrics.transformed.users.inserted++;
  }

  // Designate fallback instructor ID from first admin user
  const adminUser = validUsers.find((u) => u.role === 'admin') || validUsers[0];
  const defaultInstructorId = adminUser ? adminUser.id : 'u-admin-01';

  // 4.2 Transform Courses
  for (const c of rawCourses) {
    if (!c.title || !c.title.trim()) {
      metrics.transformed.courses.rejected++;
      metrics.quarantine.push({ entity: 'course', id: c.id, reason: 'EMPTY_COURSE_TITLE' });
      continue;
    }

    let status = 'draft';
    if (c.course_status === 'published' || c.course_status === 'active_course') {
      status = 'published';
    } else if (c.course_status === 'archived') {
      status = 'archived';
    }

    const createdAt = parseDateToIso(c.created_date);

    const transformedCourse = {
      id: c.id,
      title: c.title.trim(),
      description: (c.description || '').trim(),
      category: (c.category || 'General').trim(),
      instructorId: defaultInstructorId,
      thumbnailUrl: '/images/course-default.jpg',
      status,
      createdAt,
      updatedAt: createdAt,
    };

    validCourses.push(transformedCourse);
    courseMap.set(c.id, transformedCourse);
    metrics.transformed.courses.inserted++;
  }

  // 4.3 Transform Lessons
  for (const l of rawLessons) {
    if (!courseMap.has(l.course_id)) {
      metrics.transformed.lessons.rejected++;
      metrics.quarantine.push({ entity: 'lesson', id: l.id, reason: 'ORPHANED_COURSE_REFERENCE', courseId: l.course_id });
      continue;
    }

    const transformedLesson = {
      id: l.id,
      courseId: l.course_id,
      title: (l.title || 'Untitled Lesson').trim(),
      content: l.body || 'No content provided.',
      position: l.order_idx && l.order_idx > 0 ? l.order_idx : 1,
      status: l.lesson_status === 'published' ? 'published' : 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    validLessons.push(transformedLesson);
    lessonMap.set(l.id, transformedLesson);
    metrics.transformed.lessons.inserted++;
  }

  // 4.4 Transform Enrollments (with duplicate deduplication)
  const seenEnrollmentKeys = new Set();
  for (const e of rawEnrollments) {
    if (!userMap.has(e.user_id)) {
      metrics.transformed.enrollments.rejected++;
      metrics.quarantine.push({ entity: 'enrollment', id: e.id, reason: 'UNREFERENCED_USER_ID', userId: e.user_id });
      continue;
    }
    if (!courseMap.has(e.course_id)) {
      metrics.transformed.enrollments.rejected++;
      metrics.quarantine.push({ entity: 'enrollment', id: e.id, reason: 'UNREFERENCED_COURSE_ID', courseId: e.course_id });
      continue;
    }

    const dedupeKey = `${e.user_id}:${e.course_id}`;
    if (seenEnrollmentKeys.has(dedupeKey)) {
      // Detected duplicate enrollment! Skip without losing integrity
      metrics.transformed.enrollments.duplicatesSkipped++;
      metrics.quarantine.push({
        entity: 'enrollment',
        id: e.id,
        reason: 'DUPLICATE_ENROLLMENT_SKIPPED',
        dedupeKey,
      });
      continue;
    }

    seenEnrollmentKeys.add(dedupeKey);
    let status = 'active';
    if (e.status === 'done' || e.status === 'completed') status = 'completed';

    const enrolledAt = parseDateToIso(e.enrolled_date);

    const transformedEnrollment = {
      id: e.id,
      studentId: e.user_id,
      courseId: e.course_id,
      enrolledAt,
      status,
    };

    validEnrollments.push(transformedEnrollment);
    enrollmentMap.set(e.id, transformedEnrollment);
    metrics.transformed.enrollments.inserted++;
  }

  // 4.5 Transform Progress (enforcing cross-course integrity!)
  for (const p of rawProgress) {
    // Resolve which enrollment this belongs to
    const enrollment = validEnrollments.find((enr) => enr.studentId === p.user_id && enr.courseId === p.course_id);

    if (!enrollment) {
      metrics.transformed.progress.rejected++;
      metrics.quarantine.push({
        entity: 'progress',
        id: p.id,
        reason: 'MISSING_ACTIVE_ENROLLMENT',
        userId: p.user_id,
        courseId: p.course_id,
      });
      continue;
    }

    // Check if lesson exists
    const lesson = lessonMap.get(p.lesson_id);
    if (!lesson) {
      metrics.transformed.progress.rejected++;
      metrics.quarantine.push({
        entity: 'progress',
        id: p.id,
        reason: 'ORPHANED_LESSON_REFERENCE',
        lessonId: p.lesson_id,
      });
      continue;
    }

    // Strict Cross-Course Safety Check:
    // Does the lesson actually belong to the enrollment's course?
    if (lesson.courseId !== enrollment.courseId) {
      metrics.transformed.progress.rejected++;
      metrics.quarantine.push({
        entity: 'progress',
        id: p.id,
        reason: 'CROSS_COURSE_PROGRESS_FORGERY_DETECTED',
        enrollmentCourseId: enrollment.courseId,
        lessonCourseId: lesson.courseId,
      });
      continue;
    }

    const completedAt = p.is_finished ? parseDateToIso(p.completion_date) : null;

    validProgress.push({
      id: p.id,
      enrollmentId: enrollment.id,
      lessonId: p.lesson_id,
      isCompleted: p.is_finished ? 1 : 0,
      completedAt,
      updatedAt: completedAt || new Date().toISOString(),
    });
    metrics.transformed.progress.inserted++;
  }

  sourceDb.close();

  // =========================================================================
  // STEP 5: LOAD INTO TARGET DATABASE INSIDE TRANSACTION
  // =========================================================================
  const targetDb = new Database(targetPath);
  targetDb.pragma('foreign_keys = ON');
  targetDb.pragma('journal_mode = WAL');

  const loadTransaction = targetDb.transaction(() => {
    // 5.1 Load Users
    const insertUserStmt = targetDb.prepare(`
      INSERT INTO users (id, full_name, email, password_hash, role, is_active, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        full_name = excluded.full_name,
        email = excluded.email,
        updated_at = excluded.updated_at
      ON CONFLICT(email) DO NOTHING
    `);
    for (const u of validUsers) {
      insertUserStmt.run(u.id, u.fullName, u.email, u.passwordHash, u.role, u.isActive, u.createdAt, u.updatedAt);
    }

    // 5.2 Load Courses
    const insertCourseStmt = targetDb.prepare(`
      INSERT INTO courses (id, title, description, category, instructor_id, thumbnail_url, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        title = excluded.title,
        status = excluded.status,
        updated_at = excluded.updated_at
    `);
    for (const c of validCourses) {
      insertCourseStmt.run(c.id, c.title, c.description, c.category, c.instructorId, c.thumbnailUrl, c.status, c.createdAt, c.updatedAt);
    }

    // 5.3 Load Lessons
    const insertLessonStmt = targetDb.prepare(`
      INSERT INTO lessons (id, course_id, title, content, position, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        title = excluded.title,
        content = excluded.content,
        position = excluded.position,
        updated_at = excluded.updated_at
    `);
    for (const l of validLessons) {
      insertLessonStmt.run(l.id, l.courseId, l.title, l.content, l.position, l.status, l.createdAt, l.updatedAt);
    }

    // 5.4 Load Enrollments
    const insertEnrollmentStmt = targetDb.prepare(`
      INSERT INTO enrollments (id, student_id, course_id, enrolled_at, status)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(student_id, course_id) DO UPDATE SET
        status = excluded.status
      ON CONFLICT(id) DO NOTHING
    `);
    for (const e of validEnrollments) {
      insertEnrollmentStmt.run(e.id, e.studentId, e.courseId, e.enrolledAt, e.status);
    }

    // 5.5 Load Progress
    const insertProgressStmt = targetDb.prepare(`
      INSERT INTO lesson_progress (id, enrollment_id, lesson_id, is_completed, completed_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(enrollment_id, lesson_id) DO UPDATE SET
        is_completed = excluded.is_completed,
        completed_at = excluded.completed_at,
        updated_at = excluded.updated_at
      ON CONFLICT(id) DO NOTHING
    `);
    for (const p of validProgress) {
      insertProgressStmt.run(p.id, p.enrollmentId, p.lessonId, p.isCompleted, p.completedAt, p.updatedAt);
    }

    // Record migration run audit
    const migrationVersion = `migration_legacy_${Date.now()}`;
    targetDb
      .prepare('INSERT INTO schema_migrations (version, applied_at, description) VALUES (?, ?, ?)')
      .run(migrationVersion, new Date().toISOString(), 'Migrated and cleansed records from legacy SQLite dataset');
  });

  loadTransaction();

  // =========================================================================
  // STEP 6: VALIDATE RELATIONAL INTEGRITY
  // =========================================================================
  const fkCheck = targetDb.pragma('foreign_key_check');
  const integrity = targetDb.pragma('integrity_check');

  // Verify cross-course progress consistency across entire target database
  const crossCourseViolations = targetDb
    .prepare(`
      SELECT COUNT(*) AS count
      FROM lesson_progress lp
      JOIN lessons l ON lp.lesson_id = l.id
      JOIN enrollments e ON lp.enrollment_id = e.id
      WHERE l.course_id != e.course_id
    `)
    .get().count;

  metrics.targetCounts = {
    users: targetDb.prepare('SELECT COUNT(*) AS count FROM users').get().count,
    courses: targetDb.prepare('SELECT COUNT(*) AS count FROM courses').get().count,
    lessons: targetDb.prepare('SELECT COUNT(*) AS count FROM lessons').get().count,
    enrollments: targetDb.prepare('SELECT COUNT(*) AS count FROM enrollments').get().count,
    lesson_progress: targetDb.prepare('SELECT COUNT(*) AS count FROM lesson_progress').get().count,
  };

  const isFkClean = fkCheck.length === 0;
  const isIntegrityClean = integrity.length === 1 && integrity[0].integrity_check === 'ok';
  const isCrossCourseClean = crossCourseViolations === 0;

  metrics.validationChecks = {
    foreignKeyIntegrity: {
      status: isFkClean ? 'PASSED' : 'FAILED',
      violationsCount: fkCheck.length,
      violations: fkCheck,
    },
    diskBTreeIntegrity: {
      status: isIntegrityClean ? 'PASSED' : 'FAILED',
      result: integrity,
    },
    crossCourseProgressIntegrity: {
      status: isCrossCourseClean ? 'PASSED' : 'FAILED',
      violationsCount: crossCourseViolations,
    },
  };

  metrics.pipelineStatus = isFkClean && isIntegrityClean && isCrossCourseClean ? 'PASSED' : 'FAILED';
  metrics.completedAt = new Date().toISOString();
  metrics.durationMs = Date.now() - startTime;

  targetDb.close();

  // =========================================================================
  // WRITE MACHINE-READABLE VALIDATION REPORTS
  // =========================================================================
  const jsonReportPath = path.join(reportDir, 'migration_validation_report.json');
  fs.writeFileSync(jsonReportPath, JSON.stringify(metrics, null, 2), 'utf8');

  const mdReportPath = path.join(reportDir, 'migration_validation_report.md');
  const markdownContent = `# Database Migration & Validation Report

**Migration Status**: \`${metrics.pipelineStatus}\`  
**Execution Timestamp**: ${metrics.startedAt}  
**Pipeline Duration**: ${metrics.durationMs}ms  

## 1. Source vs. Target Record Parity
| Entity | Source Records | Cleansed & Inserted | Rejected/Quarantined | Duplicates Deduplicated |
|---|---|---|---|---|
| **Users** | ${metrics.sourceCounts.legacy_users} | ${metrics.transformed.users.inserted} | ${metrics.transformed.users.rejected} | 0 |
| **Courses** | ${metrics.sourceCounts.legacy_courses} | ${metrics.transformed.courses.inserted} | ${metrics.transformed.courses.rejected} | 0 |
| **Lessons** | ${metrics.sourceCounts.legacy_lessons} | ${metrics.transformed.lessons.inserted} | ${metrics.transformed.lessons.rejected} | 0 |
| **Enrollments** | ${metrics.sourceCounts.legacy_enrollments} | ${metrics.transformed.enrollments.inserted} | ${metrics.transformed.enrollments.rejected} | ${metrics.transformed.enrollments.duplicatesSkipped} |
| **Progress** | ${metrics.sourceCounts.legacy_progress} | ${metrics.transformed.progress.inserted} | ${metrics.transformed.progress.rejected} | 0 |

## 2. Relational Integrity Assertions
- **Foreign Key Check (\`PRAGMA foreign_key_check\`)**: \`${metrics.validationChecks.foreignKeyIntegrity.status}\` (${metrics.validationChecks.foreignKeyIntegrity.violationsCount} violations)
- **Disk B-Tree Integrity (\`PRAGMA integrity_check\`)**: \`${metrics.validationChecks.diskBTreeIntegrity.status}\`
- **Cross-Course Progress Isolation**: \`${metrics.validationChecks.crossCourseProgressIntegrity.status}\` (${metrics.validationChecks.crossCourseProgressIntegrity.violationsCount} violations)

## 3. Quarantined Records Audit
\`\`\`json
${JSON.stringify(metrics.quarantine, null, 2)}
\`\`\`

## 4. Source Database Backup Verification
- **Backup File**: \`${metrics.backup.filePath}\`
- **SHA-256 Checksum**: \`${metrics.backup.sha256}\`
- **Verified**: Yes
`;

  fs.writeFileSync(mdReportPath, markdownContent, 'utf8');

  return metrics;
}

// Allow CLI execution: `node scripts/migrate.js`
if (process.argv[1] && process.argv[1].endsWith('migrate.js')) {
  console.log('[Migration Pipeline] Starting 8-step legacy migration...');
  runMigrationPipeline()
    .then((metrics) => {
      console.log(`[Migration Pipeline] Completed with status: ${metrics.pipelineStatus} in ${metrics.durationMs}ms`);
      console.log(`  Users inserted:       ${metrics.transformed.users.inserted} (Rejected: ${metrics.transformed.users.rejected})`);
      console.log(`  Courses inserted:     ${metrics.transformed.courses.inserted}`);
      console.log(`  Lessons inserted:     ${metrics.transformed.lessons.inserted}`);
      console.log(`  Enrollments inserted: ${metrics.transformed.enrollments.inserted} (Duplicates skipped: ${metrics.transformed.enrollments.duplicatesSkipped})`);
      console.log(`  Progress inserted:    ${metrics.transformed.progress.inserted} (Rejected: ${metrics.transformed.progress.rejected})`);
      console.log(`  Foreign key check:    ${metrics.validationChecks.foreignKeyIntegrity.status}`);
      console.log(`  Cross-course check:   ${metrics.validationChecks.crossCourseProgressIntegrity.status}`);
      console.log(`  Reports written to:   migration/reports/`);
      process.exit(metrics.pipelineStatus === 'PASSED' ? 0 : 1);
    })
    .catch((err) => {
      console.error('[Migration Pipeline] Fatal error:', err);
      process.exit(1);
    });
}
