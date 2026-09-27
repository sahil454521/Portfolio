// The badge in the contact section: React Bits' Lanyard card, repainted as
// Sahil's own. Takes the component's card.glb (put it at
// scrollcraft/lab/badge/card.src.glb), paints the front and back of its
// texture in the page's own type and colours, swaps the 2.3 MB PNG for a
// JPEG, and writes public/assets/badge/card.glb and strap.png.
// Needs `npm run preview` running (the page's fonts come from there).
import fs from 'node:fs';
import { chromium } from 'playwright-core';

const SRC = 'scrollcraft/lab/badge/card.src.glb';
const OUT = 'public/assets/badge';
const url = process.argv[2] || 'http://localhost:4500';

// ---- read the model: header, JSON chunk, binary chunk
const glb = fs.readFileSync(SRC);
const jl = glb.readUInt32LE(12);
const json = JSON.parse(glb.subarray(20, 20 + jl).toString());
const binAt = 20 + jl;
const bin = glb.subarray(binAt + 8, binAt + 8 + glb.readUInt32LE(binAt));
const img = json.images[0];
const view = json.bufferViews[img.bufferView];
if (img.bufferView !== json.bufferViews.length - 1) throw new Error('the texture is expected to be the last buffer view');
const atlas = bin.subarray(view.byteOffset, view.byteOffset + view.byteLength);

const dataUrl = (buf, type) => `data:${type};base64,${buf.toString('base64')}`;
const poster = fs.readFileSync('public/assets/me/colophon-poster.jpg');

// ---- paint, in a page that has the site's fonts
const b = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
const p = await b.newPage();
await p.goto(url + '/cv.html', { waitUntil: 'load' });
const out = await p.evaluate(async ({ atlasUrl, posterUrl }) => {
  await Promise.all([
    document.fonts.load('800 100px "Bricolage Grotesque"'),
    document.fonts.load('500 40px "Archivo"'),
    document.fonts.load('600 40px "Archivo"'),
  ]);
  const load = (src) => new Promise((ok) => { const i = new Image(); i.onload = () => ok(i); i.src = src; });
  const [base, photo] = await Promise.all([load(atlasUrl), load(posterUrl)]);
  const W = base.width, H = base.height;
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const x = c.getContext('2d');
  x.drawImage(base, 0, 0);

  const INK = '#0E1519', SOFT = '#566772', LIFT = '#F4F6F7', AMBER = '#FFB03B';
  const round = (rx, ry, rw, rh, r) => { x.beginPath(); x.roundRect(rx, ry, rw, rh, r); };
  const text = (s, tx, ty, font, color, spacing = '0px', stretch = 'normal') => {
    x.font = font; x.fillStyle = color; x.letterSpacing = spacing; x.fontStretch = stretch; x.fillText(s, tx, ty);
  };

  // the two faces, where the component's own compositing puts them
  const front = { x: 0, y: 0, w: W * 0.5, h: H * 0.755 };
  const back = { x: W * 0.5, y: 0, w: W * 0.5, h: H * 0.757 };

  // front: the page's daylight ground
  x.fillStyle = LIFT;
  x.fillRect(front.x, front.y, front.w, front.h);
  const L = front.x + 70, R = front.x + front.w - 70;
  text('ENGINEER', L, 196, '600 30px "Archivo"', SOFT, '6px');
  // the photo, cropped to the face
  x.save(); round(L, 226, R - L, 520, 22); x.clip();
  x.drawImage(photo, 150, 0, 880, 654, L, 226, R - L, 520);
  x.restore();
  text('Sahil Pathak', L - 4, 866, '800 112px "Bricolage Grotesque"', INK, '-2px', 'semi-condensed');
  text('AI/ML and full-stack engineer', L, 930, '500 38px "Archivo"', INK);
  text('Final year, IIT Guwahati', L, 982, '500 34px "Archivo"', SOFT);
  // the strip at the foot: the one amber mark means live, as on the page
  x.fillStyle = INK;
  x.fillRect(front.x, front.y + front.h - 150, front.w, 150);
  x.fillStyle = AMBER;
  x.beginPath(); x.arc(L + 12, front.h - 75, 11, 0, Math.PI * 2); x.fill();
  text('FIVE PRODUCTS LIVE', L + 44, front.h - 63, '600 32px "Archivo"', LIFT, '5px');

  // back: ink, and a line for whoever turns it over
  x.fillStyle = INK;
  x.fillRect(back.x, back.y, back.w, back.h);
  const BL = back.x + 70;
  text('If found,', BL, 330, '800 132px "Bricolage Grotesque"', LIFT, '-2px', 'semi-condensed');
  text('please hire.', BL, 460, '800 132px "Bricolage Grotesque"', LIFT, '-2px', 'semi-condensed');
  text('sahilpathak2005@gmail.com', BL, 600, '500 38px "Archivo"', LIFT);
  text('Tug it, throw it.', BL, 1080, '500 34px "Archivo"', '#9AA7AF');
  text('Click it to write to me.', BL, 1130, '500 34px "Archivo"', '#9AA7AF');

  // the strap: one name per repeat of the texture
  const s = document.createElement('canvas');
  s.width = 1024; s.height = 256;
  const y = s.getContext('2d');
  y.fillStyle = INK; y.fillRect(0, 0, 1024, 256);
  y.font = '600 92px "Archivo"'; y.letterSpacing = '18px'; y.fillStyle = LIFT;
  y.textAlign = 'center'; y.textBaseline = 'middle';
  y.fillText('SAHIL PATHAK', 512, 132);

  return { atlas: c.toDataURL('image/jpeg', 0.86), strap: s.toDataURL('image/png') };
}, { atlasUrl: dataUrl(atlas, 'image/png'), posterUrl: dataUrl(poster, 'image/jpeg') });
await b.close();

const fromUrl = (u) => Buffer.from(u.slice(u.indexOf(',') + 1), 'base64');
const jpeg = fromUrl(out.atlas);
fs.writeFileSync(`${OUT}/strap.png`, fromUrl(out.strap));

// ---- write the model back with the JPEG in place of the PNG
const pad = (buf, fill) => (buf.length % 4 ? Buffer.concat([buf, Buffer.alloc(4 - (buf.length % 4), fill)]) : buf);
view.byteLength = jpeg.length;
img.mimeType = 'image/jpeg';
const newBin = pad(Buffer.concat([pad(bin.subarray(0, view.byteOffset), 0), jpeg]), 0);
json.buffers[0].byteLength = newBin.length;
const newJson = pad(Buffer.from(JSON.stringify(json)), 0x20);
const chunk = (type, body) => { const h = Buffer.alloc(8); h.writeUInt32LE(body.length, 0); h.write(type, 4, 'ascii'); return Buffer.concat([h, body]); };
const body = Buffer.concat([chunk('JSON', newJson), chunk('BIN\0', newBin)]);
const head = Buffer.alloc(12);
head.write('glTF', 0, 'ascii'); head.writeUInt32LE(2, 4); head.writeUInt32LE(12 + body.length, 8);
fs.writeFileSync(`${OUT}/card.glb`, Buffer.concat([head, body]));
fs.writeFileSync('scrollcraft/lab/badge/atlas.jpg', jpeg);   // to look at
console.log(`card.glb ${(12 + body.length) / 1024 | 0} KB (was ${glb.length / 1024 | 0} KB), strap.png written`);
