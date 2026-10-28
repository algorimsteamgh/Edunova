import { z } from 'zod';

export const registerSchema = z.object({
  fullName: z.string().trim().min(2, 'Full name must be at least 2 characters'),
  email: z.string().trim().email('Invalid email address format').toLowerCase(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
});

// ponytail: single string accepts email, username or full name without redundant schema branches. Upgrade path: discriminated union if distinct username policy introduced.
export const loginSchema = z.object({
  email: z.string().trim().min(1, 'Email or username is required').toLowerCase(),
  password: z.string().min(1, 'Password is required'),
});
