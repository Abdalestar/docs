// Qtap Docs — image validator (NEW; replaces the weak `[ -f ]` Phase 5 gate)
//
// The old run only checked that a referenced image *file existed*. That let
// broken images ship: base64 text saved as .png, truncated data, and even a
// literal "data:image/png;base64,placeholder" string. This validator opens each
// PNG referenced by the given MDX file(s) and asserts it is a real raster image.
//
// A file passes only if:
//   - it begins with the PNG magic bytes  89 50 4E 47 0D 0A 1A 0A
//   - it is larger than MIN_BYTES (default 5 KB)
//   - its IHDR width/height are both > 0
// SVG references are allowed through (they are hand-drawn vector diagrams).
//
// Usage:  node .routine/validate-images.mjs path/to/article.mdx [more.mdx ...]
// Exit:   0 = all good, 1 = at least one invalid/missing image.

import { readFileSync, statSync, existsSync } from 'fs';

const MIN_BYTES = Number(process.env.MIN_IMAGE_BYTES || 5120);
const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

const mdxFiles = process.argv.slice(2);
if (mdxFiles.length === 0) {
  console.error('Usage: node .routine/validate-images.mjs <article.mdx> [...]');
  process.exit(64);
}

let problems = 0;
let checked = 0;

for (const mdx of mdxFiles) {
  if (!existsSync(mdx)) { console.log(`MISSING MDX: ${mdx}`); problems++; continue; }
  const text = readFileSync(mdx, 'utf8');
  const refs = [...text.matchAll(/\/images\/[^"')\s]+\.(png|svg)/gi)].map((m) => m[0]);
  if (refs.length === 0) {
    console.log(`note: ${mdx} references no /images/* assets`);
    continue;
  }
  for (const ref of refs) {
    const local = ref.replace(/^\//, '');
    checked++;
    if (!existsSync(local)) { console.log(`MISSING  ${local}  (in ${mdx})`); problems++; continue; }
    if (ref.toLowerCase().endsWith('.svg')) { console.log(`OK(svg)  ${local}`); continue; }

    const size = statSync(local).size;
    const fd = readFileSync(local);
    const isPng = fd.subarray(0, 8).equals(PNG_MAGIC);
    let dims = '';
    if (isPng && fd.length >= 24) {
      const w = fd.readUInt32BE(16), h = fd.readUInt32BE(20);
      dims = `${w}x${h}`;
      if (w === 0 || h === 0) { console.log(`BAD-DIMS ${local} (${dims})`); problems++; continue; }
    }
    if (!isPng) { console.log(`NOT-PNG  ${local} (starts ${JSON.stringify(fd.subarray(0, 12).toString('latin1'))})`); problems++; continue; }
    if (size < MIN_BYTES) { console.log(`TOO-SMALL ${local} (${size} B < ${MIN_BYTES})`); problems++; continue; }
    console.log(`OK       ${local} (${size} B, ${dims})`);
  }
}

console.log(`\nChecked ${checked} image ref(s); ${problems} problem(s).`);
process.exit(problems > 0 ? 1 : 0);
