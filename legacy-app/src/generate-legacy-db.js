import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.resolve(__dirname, '../data');
const dbPath = path.join(dataDir, 'legacy.sqlite');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

if (fs.existsSync(dbPath)) {
  fs.unlinkSync(dbPath);
}

const db = new Database(dbPath);

// Create legacy schema (intentionally missing foreign key constraints and checks)
db.exec(`
  CREATE TABLE legacy_users (
    id TEXT PRIMARY KEY,
    name TEXT,
    email TEXT,
    password TEXT,
    role TEXT,
    is_active INTEGER,
    signup_date TEXT
  );

  CREATE TABLE legacy_courses (
    id TEXT PRIMARY KEY,
    title TEXT,
    category TEXT,
    description TEXT,
    instructor_name TEXT,
    course_status TEXT,
    created_date TEXT
  );

  CREATE TABLE legacy_lessons (
    id TEXT PRIMARY KEY,
    course_id TEXT,
    title TEXT,
    body TEXT,
    order_idx INTEGER,
    lesson_status TEXT
  );

  CREATE TABLE legacy_enrollments (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    course_id TEXT,
    enrolled_date TEXT,
    status TEXT
  );

  CREATE TABLE legacy_progress (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    course_id TEXT,
    lesson_id TEXT,
    is_finished INTEGER,
    completion_date TEXT
  );
`);

function md5(val) {
  return crypto.createHash('md5').update(val).digest('hex');
}

const insertUser = db.prepare('INSERT INTO legacy_users VALUES (?, ?, ?, ?, ?, ?, ?)');
const insertCourse = db.prepare('INSERT INTO legacy_courses VALUES (?, ?, ?, ?, ?, ?, ?)');
const insertLesson = db.prepare('INSERT INTO legacy_lessons VALUES (?, ?, ?, ?, ?, ?)');
const insertEnrollment = db.prepare('INSERT INTO legacy_enrollments VALUES (?, ?, ?, ?, ?)');
const insertProgress = db.prepare('INSERT INTO legacy_progress VALUES (?, ?, ?, ?, ?, ?)');

// 1. Populate Legacy Users
insertUser.run('usr-001', 'Legacy Admin', 'admin@legacy.edu', md5('AdminOld123'), 'admin', 1, '2023-01-15 09:30:00');
insertUser.run('usr-002', '  John Doe  ', '  JOHN.DOE@LEGACY.EDU ', md5('Pass123!'), 'student', 1, '10/12/2023 04:30 PM'); // Dirty email & date
insertUser.run('usr-003', 'Alice Smith', 'ALICE.SMITH@LEGACY.EDU', md5('Pass123!'), 'student', 1, '2023-03-20');
insertUser.run('usr-004', 'Bob Johnson', 'bob.j@legacy.edu', md5('Pass123!'), 'student', 1, '2023-04-10 14:00:00');
insertUser.run('usr-005', 'Carol White', 'carol.w@legacy.edu', md5('Pass123!'), 'teacher', 1, '2023-05-01 10:15:00'); // Legacy role 'teacher'
insertUser.run('usr-006', 'David Brown', 'david.b@legacy.edu', md5('Pass123!'), 'student', 0, '2023-06-11 11:20:00');
insertUser.run('usr-bad-001', 'Corrupt User', 'invalid-email-address', md5('test'), 'student', 1, '2023-07-01'); // Quality defect: invalid email

// 2. Populate Legacy Courses
insertCourse.run('crs-001', 'Introduction to Python Systems', 'Computer Science', 'Learn python systems programming.', 'Carol White', 'active_course', '2023-01-10'); // Status: active_course
insertCourse.run('crs-002', 'Web Fundamentals with HTML/JS', 'Web Dev', 'Foundational web development.', 'Carol White', 'published', '2023-02-15');
insertCourse.run('crs-003', 'Database Architecture and SQL', 'Databases', 'Relational design and SQL queries.', 'Legacy Admin', 'in_review', '2023-03-01'); // Status: in_review
insertCourse.run('crs-004', 'Retired Fortran Computing', 'Legacy Systems', 'Historical computing architecture.', 'Legacy Admin', 'archived', '2022-01-01');

// 3. Populate Legacy Lessons
// Course 1 lessons
insertLesson.run('lsn-001', 'crs-001', 'Variables and Data Types', 'Python variables tutorial...', 1, 'published');
insertLesson.run('lsn-002', 'crs-001', 'Control Flow and Loops', 'Python loops tutorial...', 2, 'published');
insertLesson.run('lsn-003', 'crs-001', 'Functions and Modules', 'Python functions tutorial...', 3, 'published');

// Course 2 lessons
insertLesson.run('lsn-004', 'crs-002', 'HTML5 Semantic Tags', 'Semantic HTML tutorial...', 1, 'published');
insertLesson.run('lsn-005', 'crs-002', 'CSS Box Model and Grid', 'CSS layout tutorial...', 2, 'published');

// Course 3 lessons
insertLesson.run('lsn-006', 'crs-003', 'Tables and Primary Keys', 'Database primary keys...', 1, 'published');

// 4. Populate Legacy Enrollments
insertEnrollment.run('enr-001', 'usr-002', 'crs-001', '2023-02-01 10:00:00', 'active');
insertEnrollment.run('enr-002', 'usr-002', 'crs-001', '2023-02-02 11:00:00', 'active'); // Quality defect: duplicate enrollment!
insertEnrollment.run('enr-003', 'usr-003', 'crs-001', '2023-03-25 15:30:00', 'done'); // Legacy status: 'done'
insertEnrollment.run('enr-004', 'usr-004', 'crs-002', '2023-04-12 09:00:00', 'active');
insertEnrollment.run('enr-005', 'usr-003', 'crs-002', '2023-04-15 16:45:00', 'active');

// 5. Populate Legacy Progress
// usr-002 on crs-001: finished lesson 1
insertProgress.run('prg-001', 'usr-002', 'crs-001', 'lsn-001', 1, '2023-02-05 14:20:00');
// usr-003 on crs-001: finished all 3 lessons (lsn-001, lsn-002, lsn-003)
insertProgress.run('prg-002', 'usr-003', 'crs-001', 'lsn-001', 1, '2023-03-26 10:00:00');
insertProgress.run('prg-003', 'usr-003', 'crs-001', 'lsn-002', 1, '2023-03-27 11:00:00');
insertProgress.run('prg-004', 'usr-003', 'crs-001', 'lsn-003', 1, '2023-03-28 12:00:00');

// Quality defect: Orphaned progress record pointing to non-existent lesson
insertProgress.run('prg-bad-orphan', 'usr-004', 'crs-002', 'lsn-999-nonexistent', 1, '2023-04-15');

// Quality defect: Cross-course progress anomaly!
// User usr-003 enrolled in crs-002, but this progress row records completion for lsn-001 (which belongs to crs-001!)
insertProgress.run('prg-bad-cross', 'usr-003', 'crs-002', 'lsn-001', 1, '2023-04-20');

db.close();

console.log('[Legacy DB Generator] Created legacy database at:', dbPath);
console.log('  Injected 7 users (including 1 invalid email)');
console.log('  Injected 4 courses (including legacy status enums)');
console.log('  Injected 6 lessons');
console.log('  Injected 5 enrollments (including 1 duplicate)');
console.log('  Injected 6 progress records (including 1 orphaned lesson and 1 cross-course anomaly)');
