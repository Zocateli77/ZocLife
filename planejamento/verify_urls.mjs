// Lista as URLs finais dos documentos do plano. Rodar:
// node --env-file=.env.local planejamento/verify_urls.mjs
import pg from "pg";
const c = new pg.Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
await c.connect();
const r = await c.query(
  "SELECT title, document_type, url FROM documents WHERE description LIKE '%[plano-4sem-2026]%' ORDER BY related_content_id NULLS LAST, title"
);
for (const x of r.rows) console.log(`• [${x.document_type}] ${x.title}\n    ${x.url}`);
await c.end();
