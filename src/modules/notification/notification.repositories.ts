import { db } from "#db/db.ts";
import { eq, and, desc } from "drizzle-orm";
import { notifications } from "./notification.models.ts";
// "Find all notifications for this user" – like asking the DB for a list
export const findNotificationsByUserId = async (userId: string) => {
  const rows = await db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt));
  return rows;
};