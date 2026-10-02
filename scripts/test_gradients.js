const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const artifactDir = 'C:/Users/HP/.gemini/antigravity/brain/b21d8b82-32aa-4a75-9a2c-35427c897dd9';

function createSvgLogo(uid, textFill, textFilter = '') {
  const width = 1200;
  const height = 360;
  const cx = 140;
  const cy = 180;
  const R = 80;
  const r = 48;
  const strokeW = R - r;
  const rMid = (R + r) / 2;
  const dotY = cy + R + 14;
  const dotW = 12;
  const dotH = 22;

  return `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
    <defs>
      <!-- Deep Royal Emerald -->
      <linearGradient id="em_${uid}" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#022B22" />
        <stop offset="40%" stop-color="#075D49" />
        <stop offset="75%" stop-color="#0A7D63" />
        <stop offset="100%" stop-color="#12A585" />
      </linearGradient>

      <!-- Polished Champagne Gold -->
      <linearGradient id="gold_${uid}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#FFF9EA" />
        <stop offset="25%" stop-color="#F2D898" />
        <stop offset="55%" stop-color="#D4AF37" />
        <stop offset="85%" stop-color="#A67C33" />
        <stop offset="100%" stop-color="#6E501D" />
      </linearGradient>

      <!-- Antique Bronze Gold (Deep richness for light mode) -->
      <linearGradient id="bronze_${uid}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#E8C57C" />
        <stop offset="40%" stop-color="#C59B3F" />
        <stop offset="80%" stop-color="#966F22" />
        <stop offset="100%" stop-color="#6B4B0E" />
      </linearGradient>

      <!-- Luminous Rim -->
      <linearGradient id="rim_${uid}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#FFF4DC" stop-opacity="0.9" />
        <stop offset="50%" stop-color="#D4AF37" stop-opacity="0.7" />
        <stop offset="100%" stop-color="#0A7D63" stop-opacity="0.8" />
      </linearGradient>

      <!-- Text Shadow for Universal Legibility -->
      <filter id="shadow_${uid}" x="-10%" y="-10%" width="120%" height="120%">
        <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#011812" flood-opacity="0.35" />
      </filter>
    </defs>

    <style>
      @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@500;600;700&amp;display=swap');
      .txt_${uid} {
        font-family: 'Outfit', sans-serif;
        font-size: 172px;
        font-weight: 600;
        letter-spacing: -0.02em;
        fill: ${textFill};
        ${textFilter ? `filter: url(#${textFilter});` : ''}
      }
    </style>

    <!-- THE 'O' EMBLEM -->
    <g>
      <!-- Hairline rims -->
      <circle cx="${cx}" cy="${cy}" r="${R + 1}" fill="none" stroke="url(#rim_${uid})" stroke-width="1.2" opacity="0.8" />
      <circle cx="${cx}" cy="${cy}" r="${r - 1}" fill="none" stroke="url(#rim_${uid})" stroke-width="1.2" opacity="0.8" />

      <!-- Emerald Torus -->
      <circle cx="${cx}" cy="${cy}" r="${rMid}" fill="none" stroke="url(#em_${uid})" stroke-width="${strokeW}" />

      <!-- Champagne Gold Crown Arc -->
      <path d="
        M ${cx + R * Math.cos(-Math.PI * 0.25)} ${cy + R * Math.sin(-Math.PI * 0.25)}
        A ${R} ${R} 0 0 1 ${cx + R * Math.cos(Math.PI * 0.25)} ${cy + R * Math.sin(Math.PI * 0.25)}
        L ${cx + r * Math.cos(Math.PI * 0.25)} ${cy + r * Math.sin(Math.PI * 0.25)}
        A ${r} ${r} 0 0 0 ${cx + r * Math.cos(-Math.PI * 0.25)} ${cy + r * Math.sin(-Math.PI * 0.25)}
        Z
      " fill="url(#gold_${uid})" />

      <!-- Highlight Crest -->
      <path d="
        M ${cx + (r + 2) * Math.cos(-Math.PI * 0.25)} ${cy + (r + 2) * Math.sin(-Math.PI * 0.25)}
        A ${r + 2} ${r + 2} 0 0 1 ${cx + (r + 2) * Math.cos(Math.PI * 0.25)} ${cy + (r + 2) * Math.sin(Math.PI * 0.25)}
      " fill="none" stroke="#FFFFFF" stroke-width="2" opacity="0.75" />

      <!-- Lower-left accent -->
      <path d="
        M ${cx + R * Math.cos(Math.PI * 0.72)} ${cy + R * Math.sin(Math.PI * 0.72)}
        A ${R} ${R} 0 0 1 ${cx + R * Math.cos(Math.PI * 0.82)} ${cy + R * Math.sin(Math.PI * 0.82)}
        L ${cx + r * Math.cos(Math.PI * 0.82)} ${cy + r * Math.sin(Math.PI * 0.82)}
        A ${r} ${r} 0 0 0 ${cx + r * Math.cos(Math.PI * 0.72)} ${cy + r * Math.sin(Math.PI * 0.72)}
        Z
      " fill="url(#gold_${uid})" opacity="0.95" />

      <!-- Yoruba Diacritic (Ọ) -->
      <g>
        <rect x="${cx - dotW/2}" y="${dotY}" width="${dotW}" height="${dotH}" rx="${dotW/2}" fill="url(#gold_${uid})" stroke="url(#rim_${uid})" stroke-width="1" />
        <polygon points="${cx},${dotY + 4} ${cx + 3},${dotY + dotH/2} ${cx},${dotY + dotH - 4} ${cx - 3},${dotY + dotH/2}" fill="#FFFFFF" opacity="0.8" />
      </g>
    </g>

    <!-- 'jarket' WORDMARK -->
    <text x="242" y="260" class="txt_${uid}">jarket</text>
  </svg>
  `;
}

async function testGradients() {
  const browser = await chromium.launch({ channel: 'msedge' });
  const page = await browser.newPage({ viewport: { width: 1800, height: 1200 } });

  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <style>
      body { margin:0; padding:40px; background:#ECECE8; font-family:sans-serif; }
      .grid { display:grid; grid-template-columns:1fr 1fr; gap:30px; margin-bottom:30px; }
      .box { padding:40px 30px; border-radius:24px; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:20px; }
      .box.light { background:#FAF9F6; border:1px solid #DFE4DE; }
      .box.dark { background:#0B141A; border:1px solid #1B2D34; }
      .label { font-size:14px; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; }
      .box.light .label { color:#151E1C; }
      .box.dark .label { color:#F5F7F3; }
      svg { width:100%; max-width:650px; height:auto; }
    </style>
  </head>
  <body>
    <h2 style="margin-bottom:24px; color:#151E1C;">OJARKET LUXURY COLOR BALANCING</h2>

    <!-- ROW 1: POLISHED CHAMPAGNE GOLD (Universal Luxury) -->
    <div class="grid">
      <div class="box light">
        <div class="label">Universal Gold on Light (#FAF9F6)</div>
        ${createSvgLogo('g_lt', 'url(#bronze_g_lt)', 'shadow_g_lt')}
      </div>
      <div class="box dark">
        <div class="label">Universal Gold on Dark (#0B141A)</div>
        ${createSvgLogo('g_dk', 'url(#gold_g_dk)', 'shadow_g_dk')}
      </div>
    </div>

    <!-- ROW 2: DEEP EMERALD ON LIGHT vs PEARL CHAMPAGNE ON DARK (Theme-Adaptive) -->
    <div class="grid">
      <div class="box light">
        <div class="label">Theme-Specific: Deep Royal Emerald on Light</div>
        ${createSvgLogo('e_lt', 'url(#em_e_lt)')}
      </div>
      <div class="box dark">
        <div class="label">Theme-Specific: Pearl White / Soft Gold on Dark</div>
        ${createSvgLogo('w_dk', '#F5F7F3')}
      </div>
    </div>
  </body>
  </html>
  `;

  await page.setContent(html, { waitUntil: 'networkidle' });
  const buf = await page.screenshot();
  fs.writeFileSync(path.join(artifactDir, 'Ojarket_Color_Balancing.png'), buf);
  await browser.close();
  console.log('Color balancing sheet saved.');
}

testGradients().catch(console.error);
