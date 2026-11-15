// Build: assembles src/ into one self-contained page.
//   index.html          standalone document (open locally / host anywhere)
//   dist/artifact.html  same page without <html>/<head>/<body> (for claude.ai Artifact publishing)
import { readFileSync, writeFileSync, existsSync, mkdirSync, renameSync, unlinkSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = dirname(fileURLToPath(import.meta.url));
const rd = p => (existsSync(join(ROOT, p)) ? readFileSync(join(ROOT, p), 'utf8') : '');
const MODULES = ['pubTop', 'pubBottom', 'parent', 'staff', 'owner'];

let shell = rd('src/shell.html');
const args = process.argv.slice(2); const outIdx = args.indexOf('--out'); const OUT = outIdx > -1 ? args[outIdx + 1] : null;
const css = rd('src/core/core.css');
const modCss = MODULES.map(m => rd(`src/modules/${m}/${m}.css`).trim() ? `<style data-mod="${m}">\n${rd(`src/modules/${m}/${m}.css`)}\n</style>` : '').join('\n');
const icons = rd('src/core/icons.svg');

// logo: cinderella-logo.png (repo root or assets/) is inlined as a data URI; otherwise a neutral placeholder renders
let logo = null;
for (const p of ['cinderella-logo.png', 'assets/cinderella-logo.png', 'cinderella-logo.webp', 'assets/cinderella-logo.webp', 'cinderella-logo.jpg', 'assets/cinderella-logo.jpg']) {
  if (existsSync(join(ROOT, p))) { const ext = p.split('.').pop(); logo = `data:image/${ext === 'jpg' ? 'jpeg' : ext};base64,` + readFileSync(join(ROOT, p)).toString('base64'); break; }
}
const wrapMod = (m, code) => code.trim() ? `\n/* ===== module: ${m} ===== */\n;(function(){\ntry {\n${code}\n} catch (e) { console.error('[module ${m}] failed to load', e); }\n})();\n` : '';
const js = `window.__LOGO__ = ${logo ? JSON.stringify(logo) : 'null'};\n` + rd('src/core/core.js');
let problems = 0;
const modJs = MODULES.map(m => {
  const code = rd(`src/modules/${m}/${m}.js`); if (!code.trim()) return '';
  const wrapped = wrapMod(m, code);
  if (/<\/script/i.test(wrapped)) { console.error(`ERROR [${m}]: literal "</script" in JS — write it as "<\\/script".`); problems++; }
  const tmp = join(tmpdir(), `gc-check-${m}-${process.pid}.js`); writeFileSync(tmp, wrapped);
  try { execFileSync(process.execPath, ['--check', tmp], { stdio: 'pipe' }); } catch (e) { console.error(`SYNTAX ERROR [${m}]:\n` + String(e.stderr || e.message).split('\n').slice(0, 6).join('\n')); problems++; }
  try { unlinkSync(tmp); } catch (e) {}
  return `<script data-mod="${m}">${wrapped}</script>`;
}).join('\n');
if (/<\/script/i.test(js)) { console.error('ERROR: core JS contains a literal "</script"'); process.exit(1); }

shell = shell.replace('/*@CSS*/', () => css).replace('<!--@/HEAD-->', () => modCss + '\n<!--@/HEAD-->').replace('<!--@ICONS-->', () => icons).replace('/*@JS*/', () => js).replace(/(<script>\s*\n?window\.__LOGO__[\s\S]*?<\/script>)/, m => m + '\n' + modJs);
for (const m of MODULES) shell = shell.replace(`<!--@MODULE:${m}-->`, () => rd(`src/modules/${m}/${m}.html`));

const headMatch = shell.match(/<!--@HEAD-->([\s\S]*?)<!--@\/HEAD-->/);
const head = headMatch ? headMatch[1].trim() : '';
const body = shell.replace(/<!--@HEAD-->[\s\S]*?<!--@\/HEAD-->/, '').trim();
const preboot = `<script>(function(){var l='he';try{var s=localStorage.getItem('gc:lang');if(s&&JSON.parse(s)==='ru')l='ru';}catch(e){}var d=document.documentElement;d.lang=l;d.dir=l==='he'?'rtl':'ltr';})();</script>`;

const standalone = `<!doctype html>
<html lang="he" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
${head}
</head>
<body>
${preboot}
${body}
</body>
</html>
`;
const artifact = `${head}\n${preboot}\n${body}\n`;
const atomic = (p, data) => { mkdirSync(dirname(p), { recursive: true }); const t = p + '.tmp' + process.pid; writeFileSync(t, data); renameSync(t, p); };
if (OUT) { atomic(join(ROOT, OUT), standalone); console.log(`built ${OUT} (${(Buffer.byteLength(standalone) / 1024).toFixed(0)} KB)${problems ? ` — ${problems} problem(s) above` : ''}`); process.exit(problems ? 1 : 0); }
atomic(join(ROOT, 'index.html'), standalone);
atomic(join(ROOT, 'dist/artifact.html'), artifact);
const kb = n => (Buffer.byteLength(n) / 1024).toFixed(0) + ' KB';
console.log(`built index.html (${kb(standalone)}), dist/artifact.html (${kb(artifact)}), logo: ${logo ? 'inlined' : 'placeholder'}${problems ? ` — ${problems} problem(s) above` : ''}`);
if (problems) process.exit(1);
