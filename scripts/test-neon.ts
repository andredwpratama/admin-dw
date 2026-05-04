import { neon } from '@neondatabase/serverless';
import * as dotenv from "dotenv";

dotenv.config();

const connectionString = process.env.DATABASE_URL;

async function testConnection() {
  if (!connectionString) {
    console.error("DATABASE_URL is not set");
    return;
  }

  console.log("Testing Neon connection with URL starting with:", connectionString.substring(0, 20));
  try {
    const sql = neon(connectionString);
    const result = await sql`SELECT 1 + 1 as result`;
    console.log("Connection successful! Result:", result);
  } catch (error) {
    console.error("Connection failed:", error);
  }
}

testConnection();
