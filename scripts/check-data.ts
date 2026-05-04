import { db } from "../lib/db/index";
import { campaigns, datasets, genericData } from "../lib/db/schema";
import * as dotenv from "dotenv";

dotenv.config();

async function check() {
  const connectionString = process.env.DATABASE_URL;
    
  if (!connectionString) {
    console.error("❌ DATABASE_URL is not set");
    process.exit(1);
  }

  console.log("🔍 Checking Neon data at:", connectionString.split('@')[1]);
  
  try {
    const allCampaigns = await db.select().from(campaigns);
    console.log(`✅ Campaigns found: ${allCampaigns.length}`);
    
    const allDatasets = await db.select().from(datasets);
    console.log(`✅ Datasets found: ${allDatasets.length}`);
    
    const allGeneric = await db.select().from(genericData).limit(1);
    console.log(`✅ Generic data sample count: ${allGeneric.length}`);
    
  } catch (error) {
    console.error("❌ Check failed:", error);
  } finally {
    process.exit(0);
  }
}

check();
