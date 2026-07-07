// Gera 1 index.html por carrossel a partir de carousels.data.mjs + um _manifest.json.
// Rodar: node planejamento/arte/gen_art.mjs
import data from "./carousels.data.mjs";
import { mkdirSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const HERE = dirname(fileURLToPath(import.meta.url));

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=Inter:wght@400;600&display=swap');
:root{--ink:#0E1726;--ink2:#16233a;--teal:#14B8A6;--amber:#F59E0B;--mist:#AEBECB}
*{box-sizing:border-box;margin:0;padding:0}
html,body{background:#0a1018}
.slide{position:relative;width:1080px;height:1350px;background:var(--ink);color:#fff;font-family:"Inter",sans-serif;
  overflow:hidden;display:flex;flex-direction:column;justify-content:center;padding:96px 90px;
  background-image:linear-gradient(rgba(20,184,166,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(20,184,166,.05) 1px,transparent 1px);background-size:60px 60px}
.slide + .slide{margin-top:40px}
.kicker{font-family:"Space Grotesk";font-weight:500;letter-spacing:.18em;text-transform:uppercase;font-size:24px;color:var(--teal)}
.num{position:absolute;top:90px;right:90px;font-family:"Space Grotesk";font-weight:700;font-size:26px;color:var(--mist);opacity:.6}
h1{font-family:"Space Grotesk";font-weight:700;line-height:1.05;letter-spacing:-.02em;margin-top:28px;font-size:96px}
h2{font-family:"Space Grotesk";font-weight:700;font-size:70px;line-height:1.09;margin-top:24px}
p.body{font-size:42px;line-height:1.4;color:#D8E1EA;margin-top:30px;max-width:880px}
.a{color:var(--amber)}
.practice{border-left:8px solid var(--amber);background:rgba(245,158,11,.08);border-radius:14px;padding:44px 46px;margin-top:30px}
.practice .tag{font-family:"Space Grotesk";font-weight:700;font-size:34px;color:var(--amber);letter-spacing:.04em}
.practice p{font-size:46px;line-height:1.32;margin-top:18px}
.cta-big{font-family:"Space Grotesk";font-weight:700;font-size:66px;line-height:1.1;margin-top:24px}
.cta-sub{font-size:42px;color:#D8E1EA;margin-top:28px}
.foot{position:absolute;bottom:84px;left:90px;font-family:"Space Grotesk";font-weight:500;font-size:30px;color:var(--mist)}
.foot b{color:var(--teal)}
.swipe{position:absolute;bottom:84px;right:90px;font-size:34px;color:var(--mist)}
`;

const pad = (n) => String(n).padStart(2, "0");

function slideHTML(s, i, pilar) {
  const num = `<div class="num">${pad(i + 1)}</div>`;
  if (s.kind === "cover")
    return `<section class="slide" id="s${i + 1}">${num}<div class="kicker">ZocLabs · ${pilar}</div><h1>${s.h}</h1><p class="body">${s.b}</p><div class="swipe">arrasta →</div></section>`;
  if (s.kind === "practice")
    return `<section class="slide" id="s${i + 1}">${num}<div class="kicker">${s.k}</div><div class="practice"><div class="tag">→ NA PRÁTICA:</div><p>${s.p}</p></div></section>`;
  if (s.kind === "cta")
    return `<section class="slide" id="s${i + 1}">${num}<div class="kicker">${s.k}</div><div class="cta-big">${s.h}</div><div class="cta-sub">${s.b}</div><div class="foot"><b>Tecnologia na prática.</b></div></section>`;
  // mid
  return `<section class="slide" id="s${i + 1}">${num}<div class="kicker">${s.k}</div><h2>${s.h}</h2>${s.b ? `<p class="body">${s.b}</p>` : ""}</section>`;
}

function pageHTML(c) {
  const slides = c.slides.map((s, i) => slideHTML(s, i, c.pilar)).join("\n");
  return `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><title>${c.slug}</title><style>${CSS}</style></head><body>
${slides}
<script>
const only=new URLSearchParams(location.search).get('only');
if(only){document.querySelectorAll('.slide').forEach(s=>{s.style.display='none';s.style.marginTop='0';});
const t=document.getElementById('s'+only); if(t)t.style.display='flex'; document.documentElement.style.background='#0E1726';}
</script></body></html>`;
}

const manifest = [];
for (const c of data) {
  const dir = join(HERE, c.slug);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "index.html"), pageHTML(c), "utf-8");
  manifest.push({ slug: c.slug, n: c.slides.length, title: c.title, pilar: c.pilar });
}
writeFileSync(join(HERE, "_manifest.json"), JSON.stringify(manifest, null, 2), "utf-8");
console.log(`Gerados ${manifest.length} carrosséis. Total de slides: ${manifest.reduce((a, b) => a + b.n, 0)}`);
