import { db } from "#db/db.ts";
import { units } from "./unit.models.ts";
import { and, eq } from "drizzle-orm";
type CreateUnitRepoInput = {
  propertyId: string;
  unitNumber: string;
  floor: number;
  tenantId?: string | null;
};
export const createUnit = async (data: CreateUnitRepoInput) => {
  const [unit] = await db
    .insert(units)
    .values({
      propertyId: data.propertyId,
      unitNumber: data.unitNumber,
      floor: data.floor,
      tenantId: data.tenantId ?? null,
    })
    .returning();
  return unit ?? null;
};