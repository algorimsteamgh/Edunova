-- ==========================================================
-- LearnSphere Migration: 003_add_course_topics_hierarchy.sql
-- Add course difficulty, objectives, and lesson topic/subtopic hierarchy
-- ==========================================================

-- 1. Extend courses table with difficulty level and learning objectives
ALTER TABLE courses ADD COLUMN difficulty_level TEXT DEFAULT 'Beginner';
ALTER TABLE courses ADD COLUMN learning_objectives TEXT DEFAULT '[]';

-- 2. Extend lessons table with topic, subtopic, practical exercise, and reference URLs
ALTER TABLE lessons ADD COLUMN topic_title TEXT DEFAULT '';
ALTER TABLE lessons ADD COLUMN subtopic_title TEXT DEFAULT '';
ALTER TABLE lessons ADD COLUMN practical_exercise TEXT DEFAULT '';
ALTER TABLE lessons ADD COLUMN reference_urls TEXT DEFAULT '[]';

-- 3. Optimization index for topic-based queries
CREATE INDEX IF NOT EXISTS idx_lessons_course_topic ON lessons(course_id, topic_title);
