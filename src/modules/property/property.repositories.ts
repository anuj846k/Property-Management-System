import { eq } from 'drizzle-orm';
import { db } from '#db/db.ts';
import { properties } from './property.models.ts';
import { units } from '../unit/unit.models.ts';

type CreatePropertyRepoInput = {
  name: string;
  address: string;
  managerId: string;
};

export const createProperty = async (data: CreatePropertyRepoInput) => {
  const [property] = await db
    .insert(properties)
    .values({
      name: data.name,
      address: data.address,
      managerId: data.managerId,
    })
    .returning();

  return property;
};

export const findPropertiesByManagerId = async (managerId: string) => {
  const results = await db
    .select()
    .from(properties)
    .where(eq(properties.managerId, managerId));
  return results;
};

export const findPropertyById = async (id: string) => {
  const [property] = await db
    .select()
    .from(properties)
    .where(eq(properties.id, id))
    .limit(1);
  return property ?? null;
};

export const findUnitsByPropertyId = async (propertyId: string) => {
  return db.select().from(units).where(eq(units.propertyId, propertyId));
};

export const updatePropertyManager = async (
  propertyId: string,
  managerId: string,
) => {
  const [updated] = await db
    .update(properties)
    .set({ managerId })
    .where(eq(properties.id, propertyId))
    .returning();
  return updated ?? null;
};
