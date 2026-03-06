import { z } from 'zod';

export const ticketCreateSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(5),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  propertyId: z.uuid(),
  unit: z.string().min(1),
  imageUrls: z.array(z.url()).optional(),
});

export type TicketCreateInput = z.infer<typeof ticketCreateSchema>;

export const ticketListQuerySchema = z.object({
  status: z.enum(['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'DONE']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
  propertyId: z.uuid().optional(),
});

// Add to ticket.validations.ts

export const ticketAssignSchema = z.object({
  technicianId: z.string().uuid('technicianId must be a valid UUID'),
});

export type TicketAssignInput = z.infer<typeof ticketAssignSchema>;

export const ticketUpdateSchema = z
  .object({
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
    status: z.enum(['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'DONE']).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one of priority or status must be provided',
  });

export const ticketProgressSchema = z.object({
  status: z.enum(['IN_PROGRESS', 'DONE']),
});
export type TicketProgressInput = z.infer<typeof ticketProgressSchema>;

export type TicketUpdateInput = z.infer<typeof ticketUpdateSchema>;

export type TicketListQuery = z.infer<typeof ticketListQuerySchema>;
