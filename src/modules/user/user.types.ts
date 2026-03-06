import { pgEnum } from 'drizzle-orm/pg-core';

export const roleEnum = pgEnum('role', [
  'TENANT',
  'MANAGER',
  'TECHNICIAN',
  'ADMIN',
]);

export type UserRole = 'TENANT' | 'MANAGER' | 'TECHNICIAN' | 'ADMIN';

export const ALLOWED_USER_ROLES: UserRole[] = [
  'TENANT',
  'MANAGER',
  'TECHNICIAN',
  'ADMIN',
];

export type PublicUser = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: UserRole;
  createdAt: Date | null;
};

export type UpdateUserPayload = {
  name?: string;
  phone?: string;
  role?: UserRole;
};

export type TokenPayload = {
  userId: string;
  role: string;
};
