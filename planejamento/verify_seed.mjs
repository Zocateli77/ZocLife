// Verifica os itens do plano 4 semanas no ZocLife.
// Rodar: node --env-file=.env.local planejamento/verify_seed.mjs
import pg from "pg";
const client = new pg.Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
await client.connect();
const total = await client.query(
  "SELECT content_type, count(*)::int AS n FROM content_items WHERE notes LIKE '%[plano-4sem-2026]%' GROUP BY content_type ORDER BY content_type"
);
const range = await client.query(
  "SELECT min(planned_date) AS de, max(planned_date) AS ate, count(*)::int AS total FROM content_items WHERE notes LIKE '%[plano-4sem-2026]%'"
);
console.log("Por tipo:", total.rows);
console.log("Resumo:", range.rows[0]);
await client.end();
