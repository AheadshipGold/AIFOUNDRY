const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const artifactDir = 'C:/Users/HP/.gemini/antigravity/brain/b21d8b82-32aa-4a75-9a2c-35427c897dd9';

function createPureSvgWordmark({
  textColor = 'url(#goldGrad)',
  fontFamily = 'Outfit',
  fontWeight = '600',
  letterSpacing = '-0.02em',
  width = 1500,
  height = 450,
}) {
  // Baseline is at y = 300
  // Cap-height is at y = 120 (total height 180px)
  // Emblem: R = 90, cy = 210, cx = 160. Bottom is 210 + 90 = 300 (baseline!)
  // Top is 210 - 90 = 120 (cap-height!)
  // Inner radius r = 54 (ring thickness = 36px)
  // Diacritic sits below baseline: y = 312 to 348 (matches descender of 'j'!)
  // Letter 'j' starts at x = 275

  const cx = 160;
  const cy = 210;
  const R = 90;
  const r = 55;
  const strokeW = R - r; // 35px
  const rMid = (R + r) / 2;

  // Diacritic jewel (Ọ)
  const dotY = 310;
  const dotW = 12;
  const dotH = 26;

  return `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
    <defs>
      <linearGradient id="emGrad" x1="10%" y1="100%" x2="90%" y2="0%">
        <stop offset="0%" stop-color="#022B22" />
        <stop offset="35%" stop-color="#075D49" />
        <stop offset="70%" stop-color="#0A7D63" />
        <stop offset="100%" stop-color="#14A081" />
      </linearGradient>

      <!-- Polished Champagne Gold Gradient -->
      <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#FFF8E8" />
        <stop offset="25%" stop-color="#F2D898" />
        <stop offset="55%" stop-color="#D4AF37" />
        <stop offset="85%" stop-color="#A67C33" />
        <stop offset="100%" stop-color="#6E501D" />
      </linearGradient>

      <!-- Antique Rich Gold (Slightly deeper for ultra-contrast on light) -->
      <linearGradient id="goldDeep" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#FDF2D6" />
        <stop offset="25%" stop-color="#DEBE78" />
        <stop offset="60%" stop-color="#B88E33" />
        <stop offset="100%" stop-color="#735216" />
      </linearGradient>

      <!-- Fine Luminous Rim -->
      <linearGradient id="rimGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#FFF1D0" stop-opacity="0.95" />
        <stop offset="50%" stop-color="#D4AF37" stop-opacity="0.75" />
        <stop offset="100%" stop-color="#0A7D63" stop-opacity="0.85" />
      </linearGradient>

      <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="-2" dy="4" stdDeviation="6" flood-color="#011812" flood-opacity="0.35" />
      </filter>
    </defs>

    <style>
      @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@500;600;700&amp;display=swap');
      .brand-text {
        font-family: '${fontFamily}', 'Outfit', sans-serif;
        font-size: 195px;
        font-weight: ${fontWeight};
        letter-spacing: ${letterSpacing};
        fill: ${textColor};
      }
    </style>

    <!-- ==================== THE 'O' EMBLEM ==================== -->
    <g id="emblem-O">
      <!-- Fine Hairline Rims for Contrast -->
      <circle cx="${cx}" cy="${cy}" r="${R + 1}" fill="none" stroke="url(#rimGrad)" stroke-width="1.2" opacity="0.8" />
      <circle cx="${cx}" cy="${cy}" r="${r - 1}" fill="none" stroke="url(#rimGrad)" stroke-width="1.2" opacity="0.8" />

      <!-- Main Royal Emerald Ring -->
      <circle cx="${cx}" cy="${cy}" r="${rMid}" fill="none" stroke="url(#emGrad)" stroke-width="${strokeW}" />

      <!-- Sculpted Champagne Gold Crown Arc (Upper Right Quadrant) -->
      <path d="
        M ${cx + R * Math.cos(-Math.PI * 0.25)} ${cy + R * Math.sin(-Math.PI * 0.25)}
        A ${R} ${R} 0 0 1 ${cx + R * Math.cos(Math.PI * 0.25)} ${cy + R * Math.sin(Math.PI * 0.25)}
        L ${cx + r * Math.cos(Math.PI * 0.25)} ${cy + r * Math.sin(Math.PI * 0.25)}
        A ${r} ${r} 0 0 0 ${cx + r * Math.cos(-Math.PI * 0.25)} ${cy + r * Math.sin(-Math.PI * 0.25)}
        Z
      " fill="url(#goldGrad)" filter="url(#shadow)" />

      <!-- Gold Highlight Crest -->
      <path d="
        M ${cx + (r + 2) * Math.cos(-Math.PI * 0.25)} ${cy + (r + 2) * Math.sin(-Math.PI * 0.25)}
        A ${r + 2} ${r + 2} 0 0 1 ${cx + (r + 2) * Math.cos(Math.PI * 0.25)} ${cy + (r + 2) * Math.sin(Math.PI * 0.25)}
      " fill="none" stroke="#FFFFFF" stroke-width="2" opacity="0.75" />

      <!-- Diagonal Gold Inset in Lower-Left -->
      <path d="
        M ${cx + R * Math.cos(Math.PI * 0.72)} ${cy + R * Math.sin(Math.PI * 0.72)}
        A ${R} ${R} 0 0 1 ${cx + R * Math.cos(Math.PI * 0.82)} ${cy + R * Math.sin(Math.PI * 0.82)}
        L ${cx + r * Math.cos(Math.PI * 0.82)} ${cy + r * Math.sin(Math.PI * 0.82)}
        A ${r} ${r} 0 0 0 ${cx + r * Math.cos(Math.PI * 0.72)} ${cy + r * Math.sin(Math.PI * 0.72)}
        Z
      " fill="url(#goldGrad)" opacity="0.95" />

      <!-- Yoruba Diacritic (Ọ) -->
      <g>
        <rect x="${cx - dotW/2}" y="${dotY}" width="${dotW}" height="${dotH}" rx="${dotW/2}" fill="url(#goldGrad)" stroke="url(#rimGrad)" stroke-width="1" />
        <polygon points="${cx},${dotY + 5} ${cx + 3.5},${dotY + dotH/2} ${cx},${dotY + dotH - 5} ${cx - 3.5},${dotY + dotH/2}" fill="#FFFFFF" opacity="0.8" />
      </g>
    </g>

    <!-- ==================== THE 'jarket' WORDMARK ==================== -->
    <text x="272" y="300" class="brand-text">jarket</text>
  </svg>
  `;
}

async function testPureSvg() {
  const browser = await chromium.launch({ channel: 'msedge' });
  const page = await browser.newPage({ viewport: { width: 1800, height: 1200 } });

  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <style>
      body { margin:0; padding:40px; background:#D8D8D4; font-family:sans-serif; }
      .grid { display:grid; grid-template-columns:1fr 1fr; gap:30px; margin-bottom:30px; }
      .box { padding:40px 30px; border-radius:24px; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:20px; }
      .box.light { background:#FAF9F6; border:1px solid #DFE4DE; }
      .box.dark { background:#0B141A; border:1px solid #1B2D34; }
      .label { font-size:14px; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; }
      .box.light .label { color:#151E1C; }
      .box.dark .label { color:#F5F7F3; }
      svg { width:100%; max-width:700px; height:auto; }
    </style>
  </head>
  <body>
    <h2 style="margin-bottom:20px; color:#151E1C;">Mathematical Precision Wordmark: [O]jarket</h2>

    <!-- VERSION A: PURE CHAMPAGNE GOLD (Cartier / Rolex Luxury) -->
    <div class="grid">
      <div class="box light">
        <div class="label">Style A: Champagne Gold on Light (#FAF9F6)</div>
        ${createPureSvgWordmark({ textColor: 'url(#goldDeep)' })}
      </div>
      <div class="box dark">
        <div class="label">Style A: Champagne Gold on Dark (#0B141A)</div>
        ${createPureSvgWordmark({ textColor: 'url(#goldGrad)' })}
      </div>
    </div>

    <!-- VERSION B: ROYAL EMERALD WITH GOLD ACCENT -->
    <div class="grid">
      <div class="box light">
        <div class="label">Style B: Deep Emerald on Light (#FAF9F6)</div>
        ${createPureSvgWordmark({ textColor: 'url(#emGrad)' })}
      </div>
      <div class="box dark">
        <div class="label">Style B: Deep Emerald on Dark (#0B141A)</div>
        ${createPureSvgWordmark({ textColor: '#63DBB6' })}
      </div>
    </div>
  </body>
  </html>
  `;

  await page.setContent(html, { waitUntil: 'networkidle' });
  const buf = await page.screenshot();
  fs.writeFileSync(path.join(artifactDir, 'Ojarket_PureSvg_Test.png'), buf);
  await browser.close();
  console.log('Pure SVG test saved.');
}

testPureSvg().catch(console.error);
