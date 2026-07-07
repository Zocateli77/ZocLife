// Verifica a documentação do plano no ZocLife.
// Rodar: node --env-file=.env.local planejamento/verify_documents.mjs
import pg from "pg";
const client = new pg.Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
await client.connect();
const byType = await client.query(
  "SELECT document_type, count(*)::int AS n FROM documents WHERE description LIKE '%[plano-4sem-2026]%' GROUP BY document_type ORDER BY document_type"
);
const links = await client.query(
  `SELECT d.title AS doc, c.title AS conteudo, c.content_type
   FROM documents d JOIN content_items c ON c.id = d.related_content_id
   WHERE d.description LIKE '%[plano-4sem-2026]%' ORDER BY d.title`
);
const total = await client.query(
  "SELECT count(*)::int AS n FROM documents WHERE description LIKE '%[plano-4sem-2026]%'"
);
console.log("Total de documentos:", total.rows[0].n);
console.log("Por tipo:", byType.rows);
console.log("Vínculos doc -> conteúdo:");
links.rows.forEach(r => console.log(`  • ${r.doc}  ->  [${r.content_type}] ${r.conteudo}`));
await client.end();
