import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { campaigns, metrics, insights, chatSessions, chatMessages, notifications, userSettings } from "../lib/db/schema";
import { nanoid } from "nanoid";
import { format, subDays } from "date-fns";

const sqlite = new Database("admind.db");
const db = drizzle(sqlite);

async function seed() {
  console.log("🌱 Seeding campaign data...");

  const platforms = ["meta", "google", "linkedin"];
  const campaignStatuses = ["active", "paused", "ended"];
  
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
    const campaignId = `EXT-${nanoid(8)}`;
    const [insertedCampaign] = await db.insert(campaigns).values({
      platform: c.platform,
      campaignId: campaignId,
      campaignName: c.name,
      status: c.status,
      objective: "CONVERSIONS",
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();

    console.log(`  Added campaign: ${c.name} (${c.platform})`);

    // Generate 30 days of metrics
    const metricsToInsert = [];
    for (let i = 0; i < 30; i++) {
      const date = format(subDays(new Date(), i), "yyyy-MM-dd");
      
      // Random-ish data based on platform
      let baseSpend = 0;
      let baseImpressions = 0;
      
      if (c.platform === "meta") {
        baseSpend = Math.random() * 500000 + 100000;
        baseImpressions = baseSpend / 20; // ~50 IDR CPM
      } else if (c.platform === "google") {
        baseSpend = Math.random() * 800000 + 200000;
        baseImpressions = baseSpend / 40; // ~25 IDR CPM
      } else {
        baseSpend = Math.random() * 1000000 + 500000;
        baseImpressions = baseSpend / 100; // ~10 IDR CPM
      }

      const impressions = Math.floor(baseImpressions * (1 + (Math.random() * 0.4 - 0.2)));
      const clicks = Math.floor(impressions * (Math.random() * 0.05 + 0.01)); // 1-6% CTR
      const spend = baseSpend;
      const conversions = Math.floor(clicks * (Math.random() * 0.1)); // 0-10% Conv Rate
      const revenue = conversions * (Math.random() * 500000 + 200000);

      const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
      const cpc = clicks > 0 ? spend / clicks : 0;
      const cpa = conversions > 0 ? spend / conversions : 0;
      const roas = spend > 0 ? revenue / spend : 0;

      metricsToInsert.push({
        campaignId: insertedCampaign.id,
        date: date,
        impressions,
        clicks,
        spend,
        conversions,
        revenue,
        ctr,
        cpc,
        cpa,
        roas,
      });
    }

    await db.insert(metrics).values(metricsToInsert);
  }

  console.log("✅ Seeding complete!");
}

seed().catch(console.error);
