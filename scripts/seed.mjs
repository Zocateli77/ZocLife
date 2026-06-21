import pg from "pg";
import { readFileSync } from "fs";
import { join } from "path";

const file = process.argv[2] ?? "supabase/migrations/20250620120000_seed_habits.sql";
const client = new pg.Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

await client.connect();
const sql = readFileSync(join(process.cwd(), file), "utf-8");
await client.query(sql);
await client.end();
console.log(`Seed applied: ${file}`);
