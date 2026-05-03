import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { notifications, userSettings } from "../lib/db/schema";
import { nanoid } from "nanoid";

const sqlite = new Database("admind.db");
const db = drizzle(sqlite);

async function seed() {
  console.log("🌱 Seeding system data...");

  // Seed Settings
  await db.insert(userSettings).values({
    id: "default",
    theme: "light",
    currency: "IDR",
    language: "id",
    emailNotifications: true,
    pushNotifications: true,
    updatedAt: new Date(),
  }).onConflictDoNothing();

  // Seed Notifications
  const sampleNotifications = [
    {
      id: nanoid(),
      title: "Welcome to AdMind AI",
      message: "Start by uploading your first campaign data CSV from Meta or Google Ads.",
      type: "info",
      isRead: false,
      createdAt: new Date(),
    },
    {
      id: nanoid(),
      title: "Analysis Complete",
      message: "Your morning campaign analysis is ready. We found 3 high-impact opportunities.",
      type: "success",
      isRead: false,
      createdAt: new Date(Date.now() - 3600000), // 1 hour ago
    },
    {
      id: nanoid(),
      title: "Budget Alert",
      message: "Meta Ads campaign 'Summer Sale' is approaching its daily budget limit.",
      type: "warning",
      isRead: true,
      createdAt: new Date(Date.now() - 86400000), // 1 day ago
    }
  ];

  for (const n of sampleNotifications) {
    await db.insert(notifications).values(n);
  }

  console.log("✅ Seeding complete!");
}

seed().catch(console.error);
