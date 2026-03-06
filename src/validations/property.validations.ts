import { z } from 'zod';

export const propertyCreateSchema = z.object({
  name: z.string().min(3, 'Property name must be at least 3 characters'),
  address: z.string().min(5, 'Address must be at least 5 characters'),
});

export const assignManagerSchema = z.object({
  managerId: z.uuid('Invalid manager id'),
});

export type AssignManagerInput = z.infer<typeof assignManagerSchema>;

export type PropertyCreateInput = z.infer<typeof propertyCreateSchema>;
