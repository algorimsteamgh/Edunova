-- ==========================================================
-- LearnSphere Migration: 002_add_video_lessons.sql
-- Add YouTube Video Lesson support, channels, and metadata
-- ==========================================================

-- 1. Extend courses table with estimated duration and preview video
ALTER TABLE courses ADD COLUMN estimated_duration TEXT DEFAULT '';
ALTER TABLE courses ADD COLUMN preview_video_id TEXT DEFAULT '';

-- 2. Extend lessons table with YouTube video metadata
ALTER TABLE lessons ADD COLUMN video_id TEXT DEFAULT '';
ALTER TABLE lessons ADD COLUMN video_url TEXT DEFAULT '';
ALTER TABLE lessons ADD COLUMN duration TEXT DEFAULT '';
ALTER TABLE lessons ADD COLUMN description TEXT DEFAULT '';
ALTER TABLE lessons ADD COLUMN channel_name TEXT DEFAULT '';
ALTER TABLE lessons ADD COLUMN is_preview INTEGER DEFAULT 0;

-- 3. Optimization index for video queries
CREATE INDEX IF NOT EXISTS idx_lessons_video_id ON lessons(video_id);
