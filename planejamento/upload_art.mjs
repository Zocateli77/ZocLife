// Sobe os PNGs da arte dos 30 carrosséis pro Storage (bucket público zoclabs-docs)
// e cria 1 documento "Arte" por carrossel, linkado ao content_item.
// Rodar: node --env-file=.env.local planejamento/upload_art.mjs
import { createClient } from "@supabase/supabase-js";
import pg from "pg";
import { readFileSync } from "fs";
import { join } from "path";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET = "zoclabs-docs";
const USER = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";
const MARK = "[plano-4sem-2026][arte]";
const publicBase = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/`;

const sb = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });
const manifest = JSON.parse(readFileSync(join(process.cwd(), "planejamento/arte/_manifest.json"), "utf-8"));

// upload de todos os slides
let up = 0;
const artByCarousel = [];
for (const c of manifest) {
  const urls = [];
  for (let i = 1; i <= c.n; i++) {
    const rel = `planejamento/arte/${c.slug}/slide-${i}.png`;
    const buf = readFileSync(join(process.cwd(), rel));
    const { error } = await sb.storage.from(BUCKET).upload(rel, buf, { contentType: "image/png", upsert: true });
    if (error) console.log("ERRO", rel, error.message);
    else { up++; urls.push(publicBase + rel); }
  }
  artByCarousel.push({ ...c, urls });
}
console.log(`PNGs enviados: ${up}`);

// registra/atualiza documentos de arte, linkando ao conteúdo
const client = new pg.Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
await client.connect();
await client.query(`DELETE FROM documents WHERE user_id=$1 AND description LIKE '%'||$2||'%'`, [USER, MARK]);

let linked = 0, orphan = 0;
for (const c of artByCarousel) {
  const cid = await client.query(
    `SELECT id FROM content_items WHERE user_id=$1 AND title=$2 AND content_type='carousel' LIMIT 1`,
    [USER, c.title]
  );
  const relatedId = cid.rows[0]?.id ?? null;
  if (relatedId) linked++; else orphan++;
  await client.query(
    `INSERT INTO documents (user_id, title, description, document_type, url, content, related_content_id)
     VALUES ($1,$2,$3,'file',$4,$5,$6)`,
    [
      USER,
      `Arte do carrossel — ${c.title}`,
      `${c.n} slides PNG 1080x1350 (${c.pilar}). Capa + slides prontos pra postar. ${MARK}`,
      c.urls[0],
      c.urls.map((u, i) => `slide ${i + 1}: ${u}`).join("\n"),
      relatedId,
    ]
  );
}
console.log(`Documentos de arte criados: ${artByCarousel.length} (linkados ao conteúdo: ${linked}, sem vínculo: ${orphan})`);
console.log("Exemplo capa:", artByCarousel[8].urls[0]);
await client.end();
