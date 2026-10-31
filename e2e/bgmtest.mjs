import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
import { createServer } from 'vite'; import { writeFileSync } from 'node:fs';
const server = await createServer({ root: '/home/user/crystal-tower', server: { port: 5190, strictPort: true } });
await server.listen();
const b = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] }); const p = await b.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
await p.goto('http://localhost:5190/');
const name = process.argv[2] ?? 'battle'; const secs = Number(process.argv[3] ?? 10);
const dataUrl = await p.evaluate(async ({ name, secs }) => {
  const mod = await import('/src/ui/bgm.ts');
  // destination への接続を横取りして MediaStream にも流す
  const AC = window.AudioContext; let dest = null;
  const origConnect = AudioNode.prototype.connect;
  AudioNode.prototype.connect = function (target, ...rest) { const r = origConnect.call(this, target, ...rest); if (target instanceof AudioDestinationNode) { if (!dest) dest = this.context.createMediaStreamDestination(); origConnect.call(this, dest); } return r; };
  mod.stopBgm(); mod.playBgm(name);
  await new Promise(r => setTimeout(r, 300));
  if (!dest) return 'no-dest';
  const rec = new MediaRecorder(dest.stream, { mimeType: 'audio/webm' }); const chunks = [];
  rec.ondataavailable = e => chunks.push(e.data); rec.start();
  await new Promise(r => setTimeout(r, secs * 1000)); rec.stop(); await new Promise(r => rec.onstop = r);
  mod.stopBgm();
  const blob = new Blob(chunks, { type: 'audio/webm' }); const buf = await blob.arrayBuffer();
  let s = ''; const u8 = new Uint8Array(buf); for (let i = 0; i < u8.length; i += 0x8000) s += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000)); return btoa(s);
}, { name, secs });
if (dataUrl === 'no-dest') console.log('no destination connection'); else { writeFileSync(`${(process.env.OUT_DIR ?? '.') + '/'}bgm_${name}.webm`, Buffer.from(dataUrl, 'base64')); console.log('saved', name, 'errors:', errs.length ? errs : 'none'); }
await b.close(); await server.close();
