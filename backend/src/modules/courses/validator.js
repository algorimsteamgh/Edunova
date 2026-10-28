import { z } from 'zod';
import { extractYouTubeVideoId } from '../../utils/youtube.js';

const youtubeUrlOptional = z
  .string()
  .trim()
  .optional()
  .refine(
    (val) => {
      if (!val) return true;
      return extractYouTubeVideoId(val) !== null;
    },
    { message: 'Invalid YouTube URL or unsupported video host' }
  );

export const listCoursesQuerySchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  status: z.enum(['draft', 'published', 'archived', 'all']).optional().default('published'),
  sortBy: z.enum(['created_at', 'title', 'category']).optional().default('created_at'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(12),
});

export const createCourseSchema = z.object({
  title: z.string().trim().min(3, 'Title must be at least 3 characters'),
  description: z.string().default(''),
  category: z.string().trim().min(1, 'Category is required'),
  thumbnailUrl: z.string().optional().default(''),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
  estimatedDuration: z.string().trim().optional().default(''),
  previewVideoId: z.string().trim().optional().default(''),
  previewVideoUrl: youtubeUrlOptional,
  difficultyLevel: z.enum(['Beginner', 'Intermediate', 'Advanced']).optional().default('Beginner'),
  learningObjectives: z.union([z.string(), z.array(z.string())]).optional().default([]),
});

export const updateCourseSchema = z.object({
  title: z.string().trim().min(3, 'Title must be at least 3 characters').optional(),
  description: z.string().optional(),
  category: z.string().trim().min(1).optional(),
  thumbnailUrl: z.string().optional(),
  status: z.enum(['draft', 'published', 'archived']).optional(),
  estimatedDuration: z.string().trim().optional(),
  previewVideoId: z.string().trim().optional(),
  previewVideoUrl: youtubeUrlOptional,
  difficultyLevel: z.enum(['Beginner', 'Intermediate', 'Advanced']).optional(),
  learningObjectives: z.union([z.string(), z.array(z.string())]).optional(),
});
