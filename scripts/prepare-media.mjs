import { createHash } from 'node:crypto';
import { mkdir, readFile, readdir, writeFile, copyFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = fileURLToPath(new URL('../', import.meta.url));
const destination = path.join(root, 'public/media');
await mkdir(destination, { recursive: true });
await mkdir(path.join(root, 'src/data'), { recursive: true });
const manifest = {};
let originalBytes = 0;
let thumbnailBytes = 0;
const exists = async (file) => stat(file).then(() => true, () => false);

// Sequential images bound peak memory on Vercel. Hashes keep CDN caches correct.
for (const name of (await readdir(path.join(root, 'media'))).sort()) {
  if (!/\.(png|jpe?g|mp4)$/i.test(name)) continue;
  const input = path.join(root, 'media', name);
  const buffer = await readFile(input);
  const hash = createHash('sha256').update(buffer).update('webp-v1-q78').digest('hex').slice(0, 16);
  if (/\.mp4$/i.test(name)) {
    const output = `${hash}.mp4`;
    if (!await exists(path.join(destination, output))) await copyFile(input, path.join(destination, output));
    manifest[name] = { type: 'video', src: `/media/${output}` };
    continue;
  }
  const metadata = await sharp(buffer).metadata();
  const rotated = [5, 6, 7, 8].includes(metadata.orientation);
  const width = rotated ? metadata.height : metadata.width;
  const height = rotated ? metadata.width : metadata.height;
  const widths = [...new Set([480, 960, 1600].map((size) => Math.min(size, width)))];
  const sources = [];
  for (const size of widths) {
    const output = `${hash}-${size}.webp`;
    const target = path.join(destination, output);
    if (!await exists(target)) {
      await sharp(buffer).rotate().resize({ width: size, withoutEnlargement: true }).webp({ quality: 78, effort: 4 }).toFile(target);
    }
    sources.push({ src: `/media/${output}`, width: size });
  }
  originalBytes += buffer.length;
  thumbnailBytes += (await stat(path.join(destination, path.basename(sources[0].src)))).size;
  manifest[name] = {
    type: 'image', width, height,
    src: sources[Math.min(1, sources.length - 1)].src,
    full: sources.at(-1).src,
    srcSet: sources.map((source) => `${source.src} ${source.width}w`).join(', '),
  };
}
await writeFile(path.join(root, 'src/data/media-manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
console.log(`Prepared ${Object.keys(manifest).length} media files. Photos: ${(originalBytes / 1e6).toFixed(2)} MB originals → ${(thumbnailBytes / 1e6).toFixed(2)} MB at 480px (${Math.round((1 - thumbnailBytes / originalBytes) * 100)}% smaller).`);
