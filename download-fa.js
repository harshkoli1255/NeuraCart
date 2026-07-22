/**
 * download-fa.js  —  Run once with: node download-fa.js
 * Downloads Font Awesome 6.5.1 CSS + all webfont files locally.
 * After running, Font Awesome is fully self-hosted. No CDN needed.
 */
const https = require('https');
const fs    = require('fs');
const path  = require('path');

const BASE = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1';
const CSS_URL = `${BASE}/css/all.min.css`;

// All webfont files from Font Awesome 6.5.1
const FONTS = [
  'fa-brands-400.woff2', 'fa-brands-400.ttf',
  'fa-regular-400.woff2','fa-regular-400.ttf',
  'fa-solid-900.woff2',  'fa-solid-900.ttf',
  'fa-v4compatibility.woff2', 'fa-v4compatibility.ttf'
];

const CSS_OUT   = path.join(__dirname, 'public', 'css', 'fontawesome.min.css');
const FONTS_DIR = path.join(__dirname, 'public', 'webfonts');

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, res => {
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
      }
      res.pipe(file);
      file.on('finish', () => { file.close(); resolve(); });
    }).on('error', err => { fs.unlink(dest, () => {}); reject(err); });
  });
}

async function run() {
  // Ensure output dirs exist
  if (!fs.existsSync(FONTS_DIR)) fs.mkdirSync(FONTS_DIR, { recursive: true });

  console.log('📥  Downloading FA CSS...');
  await download(CSS_URL, CSS_OUT);

  // Patch the CSS so font paths point to /webfonts/ (served by Express static)
  let css = fs.readFileSync(CSS_OUT, 'utf8');
  css = css.replace(/\.\.\/webfonts\//g, '/webfonts/');
  fs.writeFileSync(CSS_OUT, css);
  console.log('✅  CSS saved → public/css/fontawesome.min.css  (paths patched)');

  console.log('📥  Downloading webfonts...');
  for (const font of FONTS) {
    const url  = `${BASE}/webfonts/${font}`;
    const dest = path.join(FONTS_DIR, font);
    try {
      await download(url, dest);
      console.log(`   ✓  ${font}`);
    } catch (e) {
      console.warn(`   ⚠️  Skipped ${font}: ${e.message}`);
    }
  }

  console.log('\n🎉  Done! Font Awesome is now self-hosted.');
  console.log('    Next: restart your dev server (npm run dev).');
}

run().catch(console.error);
