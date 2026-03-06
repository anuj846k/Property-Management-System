import { z } from 'zod';
import { ALLOWED_USER_ROLES, type UserRole } from '#modules/user/user.types.ts';

export const userSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().regex(/^\d{10}$/, 'Phone number must be exactly 10 digits'),
  role: z.enum(ALLOWED_USER_ROLES as [UserRole, ...UserRole[]]),
});

export type UserCreateInput = z.infer<typeof userSchema>;
