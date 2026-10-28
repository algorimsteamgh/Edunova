import { z } from 'zod';

export const updateProgressSchema = z.object({
  isCompleted: z.boolean({ required_error: 'isCompleted boolean flag is required' }),
});
