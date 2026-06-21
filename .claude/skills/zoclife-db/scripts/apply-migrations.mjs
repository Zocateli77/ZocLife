/**
 * Applies SPECIFIC migration files (by name) to the ZocLife database.
 *
 * Why this exists: `npm run db:migrate` replays EVERY file in
 * supabase/migrations from the beginning, and the initial schema uses
 * `CREATE TRIGGER` (not `CREATE OR REPLACE TRIGGER`), so a second run aborts
 * with "trigger already exists". This script runs only the files you pass,
 * so you can apply just your new migration(s) against the live database.
 *
 * Usage (from the project root):
 *   node --env-file=.env.local .claude/skills/zoclife-db/scripts/apply-migrations.mjs \
 *     20260621010000_routine_calendar_events.sql
 *
 * Requires DATABASE_URL in .env.local (service-role direct connection).
 */
import { readFileSync } from "fs";
import { join } from "path";
import pg from "pg";

const { Client } = pg;

async function main() {
  const files = process.argv.slice(2);
  if (!files.length) {
    console.error(
      "Usage: node --env-file=.env.local .claude/skills/zoclife-db/scripts/apply-migrations.mjs <file.sql> [...]",
    );
    process.exit(1);
  }
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is not set (check .env.local)");
    process.exit(1);
  }

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();
  console.log("Connected to database");
  try {
    for (const f of files) {
      const path = join(process.cwd(), "supabase", "migrations", f);
      const sql = readFileSync(path, "utf-8");
      console.log(`Applying ${f}`);
      await client.query(sql);
      console.log(`  ✓ ${f}`);
    }
    console.log("\nDone.");
  } finally {
    await client.end();
  }
}

main().catch((e) => {
  console.error("FAILED:", e.message);
  process.exit(1);
});
