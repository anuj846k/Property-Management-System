import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core';
import { users } from '../user/user.models.ts';

export const properties = pgTable('properties', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  address: text('address').notNull(),
  managerId: uuid('manager_id')
    .notNull()
    .references(() => users.id),
  createdAt: timestamp('created_at').defaultNow(),
});
