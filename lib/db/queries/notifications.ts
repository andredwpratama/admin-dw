import { db } from "../index";
import { notifications } from "../schema";
import { eq, desc } from "drizzle-orm";

export async function listNotifications(limit = 50) {
  return await db.query.notifications.findMany({
    orderBy: [desc(notifications.createdAt)],
    limit,
  });
}

export async function addNotification(data: typeof notifications.$inferInsert) {
  const result = await db.insert(notifications).values({
    ...data,
    createdAt: new Date(),
  }).returning();
  return result[0];
}

export async function markAsRead(id: string) {
  const result = await db
    .update(notifications)
    .set({ isRead: true })
    .where(eq(notifications.id, id))
    .returning();
  return result[0];
}

export async function markAllAsRead() {
  return await db
    .update(notifications)
    .set({ isRead: true })
    .returning();
}
