import assert from 'node:assert/strict';
import { createServer } from 'vite';
import { createElement } from 'react';
import { renderToString } from 'react-dom/server';

// Rendering smoke check without a browser or network calls to notification providers.
const server = await createServer({ server: { middlewareMode: true }, appType: 'custom' });
const storageDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
try {
  const { default: App } = await server.ssrLoadModule('/src/App.jsx');
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: { getItem: () => null } });
  const gate = renderToString(createElement(App));
  assert.ok(gate.includes('gate-password'));
  assert.ok(!gate.includes('<img'));
  assert.ok(!gate.includes('<video'));
  globalThis.localStorage.getItem = () => 'true';
  const album = renderToString(createElement(App));
  assert.equal((album.match(/class="memory-card"/g) || []).length, 9);
  assert.equal((album.match(/srcSet=/g) || []).length, 10);
  assert.ok(album.includes('name="date"'));
  assert.ok(album.includes('id="zemelapis"'));
  assert.ok(!album.includes('leaflet-container'));
  assert.ok(!album.includes('<video'));
  assert.ok(!album.includes('src="undefined"'));
  let buttonDepth = 0;
  for (const tag of album.matchAll(/<\/?button\b[^>]*>/g)) {
    buttonDepth += tag[0].startsWith('</') ? -1 : 1;
    assert.ok(buttonDepth >= 0 && buttonDepth <= 1, 'Interactive buttons must not be nested');
  }
  assert.equal(buttonDepth, 0);
  console.log('Render smoke check passed: gate has no media, album has 9 cards and responsive photos, no nested buttons, map/video deferred.');
} finally {
  if (storageDescriptor) Object.defineProperty(globalThis, 'localStorage', storageDescriptor);
  else delete globalThis.localStorage;
  await server.close();
}
