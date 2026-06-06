// Qtap Docs — image optimizer (unchanged behaviour, kept for completeness)
//
// Resizes every captured PNG to 1200px wide and writes a "-final.png" sibling.
// MDX should reference the "-final.png" variant.
//
// Usage: node .routine/optimize.mjs            (walks ./images)
//        node .routine/optimize.mjs images/x   (walks a subtree)

import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const root = process.argv[2] || 'images';

async function walk(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await walk(full);
    } else if (entry.name.endsWith('.png') && !entry.name.includes('-final')) {
      const out = full.replace('.png', '-final.png');
      await sharp(full).resize(1200).png({ quality: 90, compressionLevel: 9 }).toFile(out);
      console.log('Optimized:', out);
    }
  }
}

await walk(root);
console.log('All images optimized');
