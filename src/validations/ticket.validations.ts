import { z } from "zod";

export const ticketCreateSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(5),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
  propertyId: z.uuid(),
  unit: z.string().optional(),
  imageUrls: z.array(z.url()).optional(),
});

export type TicketCreateInput = z.infer<typeof ticketCreateSchema>;

export const ticketListQuerySchema = z.object({
  status: z.enum(["OPEN", "ASSIGNED", "IN_PROGRESS", "DONE"]).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
  propertyId: z.string().uuid().optional(),
});

export type TicketListQuery = z.infer<typeof ticketListQuerySchema>;