import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { campaigns, metrics, userSettings } from "../lib/db/schema";
import { nanoid } from "nanoid";
import { format, subDays } from "date-fns";
import * as dotenv from "dotenv";

dotenv.config();

async function seed() {
  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    console.error("❌ Missing DATABASE_URL in environment variables.");
    process.exit(1);
  }

  console.log("🌱 Reseeding data to Neon...");

  const sql = neon(connectionString);
  const db = drizzle(sql);

  try {
    const campaignData = [
      { name: "Summer Sale 2024", platform: "meta", status: "active" },
      { name: "Product Launch - X1", platform: "google", status: "active" },
      { name: "B2B Lead Gen - Q3", platform: "linkedin", status: "active" },
      { name: "Brand Awareness - ID", platform: "meta", status: "paused" },
      { name: "Retargeting - Cart", platform: "google", status: "active" },
      { name: "Holiday Season 2023", platform: "meta", status: "ended" },
      { name: "Recruitment Drive", platform: "linkedin", status: "paused" },
    ];

    for (const c of campaignData) {
      const [insertedCampaign] = await db.insert(campaigns).values({
        platform: c.platform,
        campaignId: `EXT-${nanoid(8)}`,
        campaignName: c.name,
        status: c.status,
        objective: "CONVERSIONS",
        createdAt: new Date(),
        updatedAt: new Date(),
      }).onConflictDoNothing().returning();

      if (!insertedCampaign) {
        console.log(`  Campaign ${c.name} already exists, skipping metrics generation.`);
        continue;
      }

      console.log(`  Added campaign: ${c.name} (${c.platform})`);

      const metricsToInsert = [];
      for (let i = 0; i < 30; i++) {
        const date = format(subDays(new Date(), i), "yyyy-MM-dd");
        const impressions = Math.floor(Math.random() * 10000) + 1000;
        const clicks = Math.floor(impressions * 0.02);
        const spend = Math.random() * 500000 + 50000;
        const conversions = Math.floor(clicks * 0.05);
        
        metricsToInsert.push({
          campaignId: insertedCampaign.id,
          date,
          impressions,
          clicks,
          spend,
          conversions,
          ctr: (clicks / impressions) * 100,
          cpc: clicks > 0 ? spend / clicks : 0,
          cpa: conversions > 0 ? spend / conversions : 0,
        });
      }
      await db.insert(metrics).values(metricsToInsert);
    }

    // Seed Settings
    await db.insert(userSettings).values({
      id: "default",
      theme: "light",
      currency: "IDR",
      language: "id",
      updatedAt: new Date(),
    }).onConflictDoNothing();

    console.log("✅ Reseed complete!");
  } catch (error) {
    console.error("❌ Reseed failed:", error);
  }
}

seed();
