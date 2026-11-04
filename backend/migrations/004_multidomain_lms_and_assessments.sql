-- ============================================================================
-- Edunova Technologies Migration: 004_multidomain_lms_and_assessments.sql
-- Multi-Domain Structured LMS Schema Extensions:
-- Roadmaps, Roadmap Topics, External Video Resources, Quizzes, Questions, Submissions, Bookmarks
-- ============================================================================

-- 1. Canonical Career Roadmaps
CREATE TABLE IF NOT EXISTS roadmaps (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  subcategory TEXT NOT NULL DEFAULT 'Engineering',
  official_url TEXT NOT NULL,
  source_type TEXT NOT NULL DEFAULT 'official' CHECK(source_type IN ('official', 'community')),
  import_status TEXT NOT NULL DEFAULT 'imported' CHECK(import_status IN ('discovered', 'imported', 'pending_structure', 'failed')),
  has_detailed_structure INTEGER NOT NULL DEFAULT 1,
  level TEXT NOT NULL DEFAULT 'Intermediate' CHECK(level IN ('Beginner', 'Intermediate', 'Advanced')),
  estimated_duration TEXT NOT NULL DEFAULT '20 hours',
  thumbnail_url TEXT NOT NULL DEFAULT '/images/course-fullstack.jpg',
  tags TEXT NOT NULL DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'published' CHECK(status IN ('draft', 'published', 'archived')),
  last_verified_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_roadmaps_slug ON roadmaps(slug);
CREATE INDEX IF NOT EXISTS idx_roadmaps_category ON roadmaps(category);

-- 2. Roadmap Hierarchical Topics & Milestones
CREATE TABLE IF NOT EXISTS roadmap_topics (
  id TEXT PRIMARY KEY,
  roadmap_id TEXT NOT NULL REFERENCES roadmaps(id) ON DELETE CASCADE,
  parent_topic_id TEXT REFERENCES roadmap_topics(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  display_order INTEGER NOT NULL DEFAULT 1,
  learning_objectives TEXT NOT NULL DEFAULT '[]',
  prerequisites TEXT NOT NULL DEFAULT '[]',
  difficulty_level TEXT NOT NULL DEFAULT 'Beginner' CHECK(difficulty_level IN ('Beginner', 'Intermediate', 'Advanced')),
  estimated_duration TEXT NOT NULL DEFAULT '30 mins',
  reference_urls TEXT NOT NULL DEFAULT '[]',
  video_id TEXT DEFAULT '',
  video_title TEXT DEFAULT '',
  channel_name TEXT DEFAULT '',
  video_status TEXT NOT NULL DEFAULT 'none' CHECK(video_status IN ('none', 'auto_attached', 'admin_approved', 'pending_review', 'broken', 'unavailable')),
  resource_state TEXT NOT NULL DEFAULT 'no_resource' CHECK(resource_state IN ('video_available', 'alternative_available', 'pending_review', 'no_resource')),
  course_id TEXT REFERENCES courses(id) ON DELETE SET NULL,
  lesson_id TEXT REFERENCES lessons(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'published' CHECK(status IN ('draft', 'published', 'archived')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_roadmap_topics_roadmap_order ON roadmap_topics(roadmap_id, display_order);
CREATE INDEX IF NOT EXISTS idx_roadmap_topics_course ON roadmap_topics(course_id);

-- 3. Roadmap Student Enrollments
CREATE TABLE IF NOT EXISTS roadmap_enrollments (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  student_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  roadmap_id TEXT NOT NULL REFERENCES roadmaps(id) ON DELETE CASCADE,
  enrolled_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'completed')),
  UNIQUE(user_id, roadmap_id)
);
CREATE INDEX IF NOT EXISTS idx_roadmap_enroll_user ON roadmap_enrollments(user_id, roadmap_id);

-- 4. User Topic Milestone Progress
CREATE TABLE IF NOT EXISTS user_topic_progress (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  student_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  roadmap_id TEXT NOT NULL REFERENCES roadmaps(id) ON DELETE CASCADE,
  topic_id TEXT NOT NULL REFERENCES roadmap_topics(id) ON DELETE CASCADE,
  is_completed INTEGER NOT NULL DEFAULT 0 CHECK(is_completed IN (0, 1)),
  status TEXT NOT NULL DEFAULT 'in_progress',
  completed_at TEXT,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, topic_id)
);
CREATE INDEX IF NOT EXISTS idx_user_topic_progress_user ON user_topic_progress(user_id, topic_id);

-- 5. External Video Resources
-- Stores verified external YouTube educational resources (NO embedded iframes)
CREATE TABLE IF NOT EXISTS topic_video_resources (
    id TEXT PRIMARY KEY,
    lesson_id TEXT NOT NULL,
    video_id TEXT NOT NULL,
    title TEXT NOT NULL,
    channel_name TEXT NOT NULL,
    duration TEXT DEFAULT '',
    thumbnail_url TEXT DEFAULT '',
    external_url TEXT NOT NULL,
    is_primary INTEGER DEFAULT 1 CHECK(is_primary IN (0, 1)),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_video_resources_lesson ON topic_video_resources(lesson_id);
CREATE INDEX IF NOT EXISTS idx_video_resources_video_id ON topic_video_resources(video_id);

-- 6. Knowledge-Check Quizzes
CREATE TABLE IF NOT EXISTS quizzes (
    id TEXT PRIMARY KEY,
    lesson_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    passing_score INTEGER DEFAULT 70 CHECK(passing_score BETWEEN 0 AND 100),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_quizzes_lesson ON quizzes(lesson_id);

-- 7. Quiz Questions & Options
CREATE TABLE IF NOT EXISTS quiz_questions (
    id TEXT PRIMARY KEY,
    quiz_id TEXT NOT NULL,
    question_text TEXT NOT NULL,
    explanation TEXT DEFAULT '',
    options_json TEXT NOT NULL DEFAULT '[]',
    correct_option_index INTEGER NOT NULL CHECK(correct_option_index >= 0),
    position INTEGER DEFAULT 1 CHECK(position >= 1),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_quiz ON quiz_questions(quiz_id, position);

-- 8. Student Quiz Submissions & Verification
CREATE TABLE IF NOT EXISTS quiz_submissions (
    id TEXT PRIMARY KEY,
    quiz_id TEXT NOT NULL,
    student_id TEXT NOT NULL,
    score INTEGER NOT NULL CHECK(score BETWEEN 0 AND 100),
    passed INTEGER NOT NULL CHECK(passed IN (0, 1)),
    answers_json TEXT NOT NULL DEFAULT '{}',
    submitted_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_quiz_sub_student ON quiz_submissions(student_id, quiz_id);

-- 9. Student Lesson Bookmarks
CREATE TABLE IF NOT EXISTS student_bookmarks (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL,
    lesson_id TEXT NOT NULL,
    notes TEXT DEFAULT '',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE,
    UNIQUE(student_id, lesson_id)
);
CREATE INDEX IF NOT EXISTS idx_bookmarks_student ON student_bookmarks(student_id);
