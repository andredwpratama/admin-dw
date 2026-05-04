import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("Missing DATABASE_URL environment variable.");
}

// Neon's serverless HTTP driver is optimized for Vercel/Edge
const sql = neon(connectionString);
export const db = drizzle(sql, { schema });
