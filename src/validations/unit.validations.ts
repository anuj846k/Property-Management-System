import { z } from "zod";

export const createUnitSchema = z.object({
  unitNumber: z.string().min(1, "Unit number is required"),
  floor: z.number().int().min(0, "Floor must be 0 or greater"),
  tenantId: z.string().uuid().optional().nullable(),
});

export type CreateUnitInput = z.infer<typeof createUnitSchema>;