import { z } from 'zod';
import { extractYouTubeVideoId } from '../../utils/youtube.js';

const youtubeUrlSchema = z
  .string()
  .trim()
  .optional()
  .refine(
    (val) => {
      if (!val) return true;
      return extractYouTubeVideoId(val) !== null;
    },
    { message: 'Invalid YouTube URL or unsupported video host. Please provide a valid YouTube watch, embed, or short link.' }
  );

export const createLessonSchema = z.object({
  title: z.string().trim().min(1, 'Title is required'),
  content: z.string().default(''),
  position: z.coerce.number().int().min(1).optional(),
  status: z.enum(['draft', 'published']).default('published'),
  videoUrl: youtubeUrlSchema,
  videoId: z.string().trim().optional(),
  duration: z.string().trim().optional().default(''),
  description: z.string().trim().optional().default(''),
  channelName: z.string().trim().optional().default(''),
  isPreview: z.union([z.boolean(), z.number()]).optional().default(false),
  topicTitle: z.string().trim().optional().default(''),
  subtopicTitle: z.string().trim().optional().default(''),
  practicalExercise: z.string().trim().optional().default(''),
  referenceUrls: z.union([z.string(), z.array(z.string())]).optional().default([]),
});

export const updateLessonSchema = z.object({
  title: z.string().trim().min(1).optional(),
  content: z.string().optional(),
  position: z.coerce.number().int().min(1).optional(),
  status: z.enum(['draft', 'published']).optional(),
  videoUrl: youtubeUrlSchema,
  videoId: z.string().trim().optional(),
  duration: z.string().trim().optional(),
  description: z.string().trim().optional(),
  channelName: z.string().trim().optional(),
  isPreview: z.union([z.boolean(), z.number()]).optional(),
  topicTitle: z.string().trim().optional(),
  subtopicTitle: z.string().trim().optional(),
  practicalExercise: z.string().trim().optional(),
  referenceUrls: z.union([z.string(), z.array(z.string())]).optional(),
});
