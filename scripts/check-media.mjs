import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = fileURLToPath(new URL('../', import.meta.url));
const manifest = JSON.parse(await readFile(path.join(root, 'src/data/media-manifest.json'), 'utf8'));
const memories = await readFile(path.join(root, 'src/data/memories.js'), 'utf8');
const missing = [...memories.matchAll(/media\("([^"]+)"\)/g)].map((match) => match[1]).filter((name) => !manifest[name]);
let files = 0;
let desktopBytes = 0;
for (const item of Object.values(manifest)) {
  if (item.type === 'video') { assert.ok((await stat(path.join(root, 'public', item.src))).size > 0); continue; }
  for (const source of item.srcSet.split(', ')) {
    const [url, width] = source.split(' ');
    const file = path.join(root, 'public', url);
    const result = await sharp(file).metadata();
    assert.equal(result.width, parseInt(width));
    assert.equal(result.format, 'webp');
    assert.equal(result.exif, undefined);
    assert.ok(Math.abs(result.width / result.height - item.width / item.height) < 0.02);
    files++;
  }
  desktopBytes += (await stat(path.join(root, 'public', item.src))).size;
}
console.log(`Verified ${files} responsive images: valid dimensions, preserved aspect ratios, no EXIF.`);
console.log(`Default photo variants total ${(desktopBytes / 1e6).toFixed(2)} MB.`);
console.log(`Missing source photos rendered with placeholders (${missing.length}): ${missing.join(', ')}`);
