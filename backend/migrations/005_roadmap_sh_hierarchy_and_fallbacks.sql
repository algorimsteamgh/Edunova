-- ============================================================================
-- LearnSphere LMS Migration: 005_roadmap_sh_hierarchy_and_fallbacks.sql
-- Roadmap.sh Hierarchy & Article Fallback Schema Enhancements
-- Modules, Subtopics, Rich Content, Resources, Learning Activity Tracking
-- ============================================================================

-- 1. Roadmap Modules (Milestone Groupings: Foundations, Core Concepts, Production, etc.)
CREATE TABLE IF NOT EXISTS roadmap_modules (
  id TEXT PRIMARY KEY,
  roadmap_id TEXT NOT NULL REFERENCES roadmaps(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  display_order INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'published' CHECK(status IN ('draft', 'published', 'archived')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_roadmap_modules_roadmap ON roadmap_modules(roadmap_id, display_order);

-- 2. Enhance roadmaps with skills, prerequisites, and module counts
ALTER TABLE roadmaps ADD COLUMN skills_covered TEXT DEFAULT '[]';
ALTER TABLE roadmaps ADD COLUMN prerequisites_list TEXT DEFAULT '[]';
ALTER TABLE roadmaps ADD COLUMN related_roadmap_ids TEXT DEFAULT '[]';
ALTER TABLE roadmaps ADD COLUMN modules_count INTEGER DEFAULT 0;

-- 3. Enhance roadmap_topics with module association, subtopics, rich explanation, and article fallback
ALTER TABLE roadmap_topics ADD COLUMN module_id TEXT REFERENCES roadmap_modules(id) ON DELETE SET NULL;
ALTER TABLE roadmap_topics ADD COLUMN module_title TEXT DEFAULT '';
ALTER TABLE roadmap_topics ADD COLUMN detailed_explanation TEXT DEFAULT '';
ALTER TABLE roadmap_topics ADD COLUMN subtopics_json TEXT DEFAULT '[]';
ALTER TABLE roadmap_topics ADD COLUMN video_duration TEXT DEFAULT '';
ALTER TABLE roadmap_topics ADD COLUMN video_thumbnail TEXT DEFAULT '';
ALTER TABLE roadmap_topics ADD COLUMN article_title TEXT DEFAULT '';
ALTER TABLE roadmap_topics ADD COLUMN article_url TEXT DEFAULT '';
ALTER TABLE roadmap_topics ADD COLUMN article_source TEXT DEFAULT '';
ALTER TABLE roadmap_topics ADD COLUMN article_description TEXT DEFAULT '';
ALTER TABLE roadmap_topics ADD COLUMN resource_type TEXT DEFAULT 'video';

CREATE INDEX IF NOT EXISTS idx_roadmap_topics_module ON roadmap_topics(module_id);

-- 4. Learning Activity & History Logging (Powers Student Dashboard Recent Activity & History)
CREATE TABLE IF NOT EXISTS learning_activity (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  title TEXT NOT NULL,
  metadata TEXT DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_learning_activity_user ON learning_activity(user_id, created_at DESC);

