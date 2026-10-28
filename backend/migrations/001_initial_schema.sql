-- ==========================================================
-- LearnSphere Initial Database Schema (001_initial_schema.sql)
-- Relational SQLite schema with foreign-key integrity,
-- unique constraints, and performance indexes.
-- ==========================================================

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    full_name TEXT NOT NULL CHECK(length(trim(full_name)) >= 2),
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('admin', 'student')),
    is_active INTEGER NOT NULL DEFAULT 1 CHECK(is_active IN (0, 1)),
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

-- 2. Courses Table
CREATE TABLE IF NOT EXISTS courses (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL CHECK(length(trim(title)) >= 3),
    description TEXT DEFAULT '',
    category TEXT NOT NULL CHECK(length(trim(category)) >= 1),
    instructor_id TEXT NOT NULL,
    thumbnail_url TEXT DEFAULT '',
    status TEXT NOT NULL CHECK(status IN ('draft', 'published', 'archived')),
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (instructor_id) REFERENCES users(id) ON DELETE RESTRICT
);

-- 3. Lessons Table
CREATE TABLE IF NOT EXISTS lessons (
    id TEXT PRIMARY KEY,
    course_id TEXT NOT NULL,
    title TEXT NOT NULL CHECK(length(trim(title)) >= 1),
    content TEXT NOT NULL,
    position INTEGER NOT NULL DEFAULT 1 CHECK(position >= 1),
    status TEXT NOT NULL CHECK(status IN ('draft', 'published')),
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- 4. Enrollments Table
CREATE TABLE IF NOT EXISTS enrollments (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL,
    course_id TEXT NOT NULL,
    enrolled_at TEXT NOT NULL,
    status TEXT NOT NULL CHECK(status IN ('active', 'completed', 'dropped')),
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE RESTRICT,
    UNIQUE(student_id, course_id)
);

-- 5. Lesson Progress Table
CREATE TABLE IF NOT EXISTS lesson_progress (
    id TEXT PRIMARY KEY,
    enrollment_id TEXT NOT NULL,
    lesson_id TEXT NOT NULL,
    is_completed INTEGER NOT NULL CHECK(is_completed IN (0, 1)),
    completed_at TEXT,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (enrollment_id) REFERENCES enrollments(id) ON DELETE CASCADE,
    FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE,
    UNIQUE(enrollment_id, lesson_id)
);

-- 6. Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY,
    actor_user_id TEXT,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    metadata TEXT DEFAULT '{}',
    created_at TEXT NOT NULL,
    FOREIGN KEY (actor_user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- ==========================================================
-- Performance & Optimization Indexes
-- ==========================================================
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_courses_status ON courses(status);
CREATE INDEX IF NOT EXISTS idx_courses_category ON courses(category, status);
CREATE INDEX IF NOT EXISTS idx_courses_instructor ON courses(instructor_id);
CREATE INDEX IF NOT EXISTS idx_lessons_course_position ON lessons(course_id, position);
CREATE INDEX IF NOT EXISTS idx_lessons_course_status ON lessons(course_id, status);
CREATE INDEX IF NOT EXISTS idx_enrollments_student ON enrollments(student_id, status);
CREATE INDEX IF NOT EXISTS idx_enrollments_course ON enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_progress_enrollment ON lesson_progress(enrollment_id);
CREATE INDEX IF NOT EXISTS idx_progress_lesson ON lesson_progress(lesson_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
