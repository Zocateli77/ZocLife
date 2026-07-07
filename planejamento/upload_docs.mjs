// Sobe a documentação do plano pro Supabase Storage (bucket PÚBLICO, autorizado pelo Lucas)
// e troca os links locais pelas URLs públicas (documents.url e content_items.script_url).
// Rodar: node --env-file=.env.local planejamento/upload_docs.mjs
import { createClient } from "@supabase/supabase-js";
import pg from "pg";
import { readFileSync } from "fs";
import { join } from "path";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET = "zoclabs-docs";
const MARK = "[plano-4sem-2026]";

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("Faltam NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const sb = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

const files = [
  "planejamento/docs/power-automate-3-fluxos/index.html",
  "planejamento/docs/power-automate-3-fluxos/resumo.pdf",
  "planejamento/docs/c13-fluxo-iniciante/index.html",
  "planejamento/docs/c13-fluxo-iniciante/resumo.pdf",
  "planejamento/docs/c14-anexos-sharepoint/index.html",
  "planejamento/docs/c14-anexos-sharepoint/resumo.pdf",
  "planejamento/roteiros/v1-roteiro-detalhado.md",
  "planejamento/PLANEJAMENTO_ZOCLABS.md",
  "planejamento/banco_carrosseis.md",
  "planejamento/banco_reels.md",
  "planejamento/banco_videos_longos.md",
  "planejamento/calendario_conteudo.md",
];

const ctypeFor = (p) =>
  p.endsWith(".html") ? "text/html; charset=utf-8"
  : p.endsWith(".pdf") ? "application/pdf"
  : p.endsWith(".md") ? "text/markdown; charset=utf-8"
  : "application/octet-stream";

const { error: bErr } = await sb.storage.createBucket(BUCKET, { public: true });
if (bErr && !/exist/i.test(bErr.message)) console.log("createBucket:", bErr.message);
else console.log(bErr ? "Bucket já existe." : "Bucket criado.");
await sb.storage.updateBucket(BUCKET, { public: true });

let ok = 0;
for (const rel of files) {
  const buf = readFileSync(join(process.cwd(), rel));
  const { error } = await sb.storage.from(BUCKET).upload(rel, buf, {
    contentType: ctypeFor(rel), upsert: true,
  });
  if (error) console.log("ERRO upload", rel, "->", error.message);
  else { ok++; console.log("ok:", rel); }
}
console.log(`Uploads: ${ok}/${files.length}`);

const publicBase = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/`;

const client = new pg.Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
await client.connect();
const d = await client.query(
  `UPDATE documents SET url = $1 || url
   WHERE description LIKE '%'||$2||'%' AND url LIKE 'planejamento/%' AND url NOT LIKE 'http%'`,
  [publicBase, MARK]
);
const c = await client.query(
  `UPDATE content_items SET script_url = $1 || script_url
   WHERE notes LIKE '%'||$2||'%' AND script_url LIKE 'planejamento/%' AND script_url NOT LIKE 'http%'`,
  [publicBase, MARK]
);
console.log(`documents.url atualizados: ${d.rowCount}`);
console.log(`content_items.script_url atualizados: ${c.rowCount}`);
console.log("Exemplo URL pública:", publicBase + "planejamento/docs/c14-anexos-sharepoint/index.html");
await client.end();
