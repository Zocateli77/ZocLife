/**
 * Applies SQL migrations from supabase/migrations/ to the remote database.
 * Usage: npm run db:migrate
 *
 * Requires DATABASE_URL in .env.local
 */
import { readFileSync, readdirSync } from "fs";
import { join } from "path";
import pg from "pg";

const { Client } = pg;

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("DATABASE_URL is not set in environment");
    process.exit(1);
  }

  const migrationsDir = join(process.cwd(), "supabase", "migrations");
  const files = readdirSync(migrationsDir)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  const client = new Client({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false } });

  try {
    await client.connect();
    console.log("Connected to database");

    for (const file of files) {
      console.log(`Applying migration: ${file}`);
      const sql = readFileSync(join(migrationsDir, file), "utf-8");
      await client.query(sql);
      console.log(`  ✓ ${file} applied`);
    }

    console.log("\nAll migrations applied successfully.");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
