import { db } from "../index";
import { userSettings } from "../schema";
import { eq } from "drizzle-orm";

export async function getSettings() {
  const result = await db.query.userSettings.findFirst({
    where: eq(userSettings.id, "default"),
  });
  
  if (!result) {
    // Initialize default settings if not exists
    const newSettings = await db.insert(userSettings).values({
      id: "default",
      theme: "light",
      currency: "IDR",
      language: "id",
      emailNotifications: true,
      pushNotifications: true,
      updatedAt: new Date(),
    }).returning();
    return newSettings[0];
  }
  
  return result;
}

export async function updateSettings(data: Partial<typeof userSettings.$inferInsert>) {
  const result = await db
    .update(userSettings)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(userSettings.id, "default"))
    .returning();
  return result[0];
}
