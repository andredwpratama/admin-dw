// scripts/migrate-data.ts
import { neon } from '@neondatabase/serverless';
import { drizzle as neonDrizzle } from 'drizzle-orm/neon-http';
import { drizzle as pgDrizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../lib/db/schema';
import * as dotenv from "dotenv";

dotenv.config();

const neonUrl = process.env.DATABASE_URL;
const supabaseUrl = process.env.OLD_SUPABASE_URL;

if (!neonUrl || !supabaseUrl) {
  console.error("Both DATABASE_URL and OLD_SUPABASE_URL must be set.");
  process.exit(1);
}

// Source (Supabase TCP)
const pgClient = postgres(supabaseUrl, { max: 1, prepare: false });
const sourceDb = pgDrizzle(pgClient, { schema });

// Destination (Neon HTTP)
const sql = neon(neonUrl);
const destDb = neonDrizzle(sql, { schema });

async function migrate() {
  console.log("Starting data migration from Supabase to Neon...");

  try {
    // Helper to migrate a table
    const migrateTable = async (tableName: string, tableSchema: any) => {
      console.log(`Migrating ${tableName}...`);
      const data = await sourceDb.select().from(tableSchema);
      if (data.length > 0) {
        // Batch insertion to avoid HTTP size limits
        const batchSize = 100;
        for (let i = 0; i < data.length; i += batchSize) {
          const batch = data.slice(i, i + batchSize);
          await destDb.insert(tableSchema).values(batch).onConflictDoNothing();
          if (data.length > batchSize) {
            console.log(`   Progress: ${Math.min(i + batchSize, data.length)} / ${data.length}`);
          }
        }
        console.log(`✅ Migrated ${data.length} rows for ${tableName}.`);
      } else {
        console.log(`ℹ️ Table ${tableName} is empty.`);
      }
    };

    // 1. Campaigns
    await migrateTable("campaigns", schema.campaigns);

    // 2. Metrics (references campaigns)
    await migrateTable("metrics", schema.metrics);

    // 3. Chat Sessions
    await migrateTable("chatSessions", schema.chatSessions);

    // 4. Chat Messages (references chatSessions)
    await migrateTable("chatMessages", schema.chatMessages);

    // 5. CSV Uploads
    await migrateTable("csvUploads", schema.csvUploads);

    // 6. Datasets
    await migrateTable("datasets", schema.datasets);

    // 7. Generic Data (references datasets)
    await migrateTable("genericData", schema.genericData);

    // 8. Insights
    await migrateTable("insights", schema.insights);

    // 9. Notifications
    await migrateTable("notifications", schema.notifications);

    // 10. User Settings
    await migrateTable("userSettings", schema.userSettings);

    console.log("🎉 Data migration complete!");
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    // Cleanup
    await pgClient.end();
  }
}

migrate();
