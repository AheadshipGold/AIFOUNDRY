const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const artifactDir = 'C:/Users/HP/.gemini/antigravity/brain/b21d8b82-32aa-4a75-9a2c-35427c897dd9';

function getPerfectEmblemSvg(size = 512, isFavicon = false) {
  const cx = 256;
  const cy = 236; // optical center
  const R = isFavicon ? 220 : 190;
  const r = isFavicon ? 135 : 115;
  const strokeW = R - r;
  const rMid = (R + r) / 2;

  // Diacritic jewel: exact Yoruba Ọ mark
  const dotY = cy + R + 14;
  const dotW = 20;
  const dotH = 34;

  return `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="${size}" height="${size}">
    <defs>
      <!-- Deep Royal Emerald Gradient -->
      <linearGradient id="emGrad2" x1="15%" y1="100%" x2="85%" y2="0%">
        <stop offset="0%" stop-color="#022B22" />
        <stop offset="35%" stop-color="#075D49" />
        <stop offset="70%" stop-color="#0A7D63" />
        <stop offset="100%" stop-color="#14A081" />
      </linearGradient>

      <!-- Polished Champagne Gold Gradient -->
      <linearGradient id="goldGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#FFF8E8" />
        <stop offset="25%" stop-color="#F2D898" />
        <stop offset="55%" stop-color="#D4AF37" />
        <stop offset="85%" stop-color="#A67C33" />
        <stop offset="100%" stop-color="#6E501D" />
      </linearGradient>

      <!-- Fine Luminous Rim for Contrast on Dark & Light -->
      <linearGradient id="rimGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#FFF1D0" stop-opacity="0.95" />
        <stop offset="50%" stop-color="#D4AF37" stop-opacity="0.75" />
        <stop offset="100%" stop-color="#0A7D63" stop-opacity="0.85" />
      </linearGradient>

      <filter id="shadow2" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="-4" dy="6" stdDeviation="10" flood-color="#011812" flood-opacity="0.4" />
      </filter>
    </defs>

    <!-- 0. Precision Luminous Contours -->
    <circle cx="${cx}" cy="${cy}" r="${R + 1}" fill="none" stroke="url(#rimGrad2)" stroke-width="2" opacity="0.85" />
    <circle cx="${cx}" cy="${cy}" r="${r - 1}" fill="none" stroke="url(#rimGrad2)" stroke-width="2" opacity="0.85" />

    <!-- 1. BASE ROYAL EMERALD TORUS -->
    <circle cx="${cx}" cy="${cy}" r="${rMid}" fill="none" stroke="url(#emGrad2)" stroke-width="${strokeW}" />

    <!-- 2. SCULPTED CHAMPAGNE GOLD CROWN ARC (From 315 deg to 45 deg) -->
    <path d="
      M ${cx + R * Math.cos(-Math.PI * 0.25)} ${cy + R * Math.sin(-Math.PI * 0.25)}
      A ${R} ${R} 0 0 1 ${cx + R * Math.cos(Math.PI * 0.25)} ${cy + R * Math.sin(Math.PI * 0.25)}
      L ${cx + r * Math.cos(Math.PI * 0.25)} ${cy + r * Math.sin(Math.PI * 0.25)}
      A ${r} ${r} 0 0 0 ${cx + r * Math.cos(-Math.PI * 0.25)} ${cy + r * Math.sin(-Math.PI * 0.25)}
      Z
    " fill="url(#goldGrad2)" filter="url(#shadow2)" />

    <!-- Highlight Crest -->
    <path d="
      M ${cx + (r + 4) * Math.cos(-Math.PI * 0.25)} ${cy + (r + 4) * Math.sin(-Math.PI * 0.25)}
      A ${r + 4} ${r + 4} 0 0 1 ${cx + (r + 4) * Math.cos(Math.PI * 0.25)} ${cy + (r + 4) * Math.sin(Math.PI * 0.25)}
    " fill="none" stroke="#FFFFFF" stroke-width="3" opacity="0.75" />

    <!-- 3. DIAGONAL GOLD ACCENT INSET (Lower-left quadrant) -->
    <path d="
      M ${cx + R * Math.cos(Math.PI * 0.72)} ${cy + R * Math.sin(Math.PI * 0.72)}
      A ${R} ${R} 0 0 1 ${cx + R * Math.cos(Math.PI * 0.83)} ${cy + R * Math.sin(Math.PI * 0.83)}
      L ${cx + r * Math.cos(Math.PI * 0.83)} ${cy + r * Math.sin(Math.PI * 0.83)}
      A ${r} ${r} 0 0 0 ${cx + r * Math.cos(Math.PI * 0.72)} ${cy + r * Math.sin(Math.PI * 0.72)}
      Z
    " fill="url(#goldGrad2)" opacity="0.95" />

    ${!isFavicon ? `
    <!-- 4. YORUBA DIACRITIC ANCHOR (Ọ of Ọjà) -->
    <g>
      <rect x="${cx - dotW/2}" y="${dotY}" width="${dotW}" height="${dotH}" rx="${dotW/2}" fill="url(#goldGrad2)" stroke="url(#rimGrad2)" stroke-width="1.5" />
      <polygon points="${cx},${dotY + 7} ${cx + 5},${dotY + dotH/2} ${cx},${dotY + dotH - 7} ${cx - 5},${dotY + dotH/2}" fill="#FFFFFF" opacity="0.85" />
    </g>
    ` : ''}
  </svg>
  `;
}

async function renderTuned() {
  const browser = await chromium.launch({ channel: 'msedge' });
  const page = await browser.newPage({ viewport: { width: 1800, height: 1000 } });

  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@600;700&display=swap" rel="stylesheet">
    <style>
      body { margin:0; padding:50px; background:#D8D8D4; font-family:'Outfit', sans-serif; }
      .grid { display:grid; grid-template-columns:1fr 1fr; gap:40px; }
      .box { padding:60px 40px; border-radius:28px; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:40px; }
      .box.light { background:#FAF9F6; border:1px solid #DFE4DE; }
      .box.dark { background:#0B141A; border:1px solid #1B2D34; }
      .title { font-size:15px; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; opacity:0.7; }
      .box.light .title { color:#151E1C; }
      .box.dark .title { color:#F5F7F3; }

      /* TYPOGRAPHIC LOCKUP */
      .lockup {
        display: inline-flex;
        align-items: baseline;
        position: relative;
      }
      .emblem-box {
        width: 170px;
        height: 170px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        margin-right: 18px;
        /* Optical baseline: the bottom of the circle rests exactly on the font baseline */
        /* The diacritic drops into the descender space below the baseline */
        transform: translateY(32px);
      }
      .emblem-box svg {
        width: 100%;
        height: 100%;
        display: block;
      }
      .word {
        font-family: 'Outfit', sans-serif;
        font-size: 160px;
        font-weight: 600;
        letter-spacing: -0.015em;
        line-height: 1;
        display: inline-block;
        white-space: nowrap;

        /* Dual-Tone Finish: Deep Royal Emerald with Warm Champagne Gold Contour */
        background: linear-gradient(175deg, #0A7D63 0%, #075D49 50%, #032E24 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        -webkit-text-stroke: 2px #D4AF37;
        filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
      }
    </style>
  </head>
  <body>
    <div class="grid">
      <!-- LIGHT THEME -->
      <div class="box light">
        <div class="title">Thème Clair (Ivoire Pierre #FAF9F6)</div>
        <div class="lockup">
          <div class="emblem-box">${getPerfectEmblemSvg(170)}</div>
          <div class="word">jarket</div>
        </div>
        <div style="width:170px;height:170px;">${getPerfectEmblemSvg(170)}</div>
      </div>

      <!-- DARK THEME -->
      <div class="box dark">
        <div class="title">Thème Sombre (Ardoise Nuit #0B141A)</div>
        <div class="lockup">
          <div class="emblem-box">${getPerfectEmblemSvg(170)}</div>
          <div class="word">jarket</div>
        </div>
        <div style="width:170px;height:170px;">${getPerfectEmblemSvg(170)}</div>
      </div>
    </div>
  </body>
  </html>
  `;

  await page.setContent(html, { waitUntil: 'networkidle' });
  const buf = await page.screenshot();
  fs.writeFileSync(path.join(artifactDir, 'Ojarket_Tuned_Validation.png'), buf);
  await browser.close();
  console.log('Tuned validation saved.');
}

renderTuned().catch(console.error);
