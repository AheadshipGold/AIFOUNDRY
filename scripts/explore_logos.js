const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const artifactDir = 'C:/Users/HP/.gemini/antigravity/brain/b21d8b82-32aa-4a75-9a2c-35427c897dd9';

// Precision SVG for the Master "O" Emblem
function getMasterEmblemSvg(size = 512, isFavicon = false) {
  const cx = 256;
  const cy = isFavicon ? 256 : 244;
  const R = isFavicon ? 220 : 190;
  const r = isFavicon ? 135 : 115;
  const strokeW = R - r; // 75px
  const rMid = (R + r) / 2;

  // Diacritic jewel
  const dotY = cy + R + 18;
  const dotW = 16;
  const dotH = 26;

  return `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="${size}" height="${size}">
    <defs>
      <!-- Deep Royal Emerald Gradient -->
      <linearGradient id="emGrad" x1="15%" y1="100%" x2="85%" y2="0%">
        <stop offset="0%" stop-color="#022B22" />
        <stop offset="40%" stop-color="#075D49" />
        <stop offset="75%" stop-color="#0A7D63" />
        <stop offset="100%" stop-color="#12997B" />
      </linearGradient>

      <!-- Polished Champagne Gold Gradient -->
      <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#FFF6E0" />
        <stop offset="25%" stop-color="#F2D898" />
        <stop offset="55%" stop-color="#D4AF37" />
        <stop offset="85%" stop-color="#A67C33" />
        <stop offset="100%" stop-color="#6E501D" />
      </linearGradient>

      <!-- Fine Luminous Rim for Contrast -->
      <linearGradient id="rimGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#FFF1D0" stop-opacity="0.9" />
        <stop offset="50%" stop-color="#D4AF37" stop-opacity="0.7" />
        <stop offset="100%" stop-color="#0A7D63" stop-opacity="0.8" />
      </linearGradient>

      <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="-3" dy="5" stdDeviation="8" flood-color="#011812" flood-opacity="0.35" />
      </filter>
    </defs>

    <!-- 0. Fine Luminous Outer & Inner Hairline Rings (Crisp contrast on dark & light) -->
    <circle cx="${cx}" cy="${cy}" r="${R + 1}" fill="none" stroke="url(#rimGrad)" stroke-width="1.5" opacity="0.8" />
    <circle cx="${cx}" cy="${cy}" r="${r - 1}" fill="none" stroke="url(#rimGrad)" stroke-width="1.5" opacity="0.8" />

    <!-- 1. BASE EMERALD RING -->
    <circle cx="${cx}" cy="${cy}" r="${rMid}" fill="none" stroke="url(#emGrad)" stroke-width="${strokeW}" />

    <!-- 2. SCULPTED CHAMPAGNE GOLD CROWN ARC (From 315 deg to 45 deg - Upper Right Quadrant) -->
    <!-- Elegantly overlaps with a clean 45-degree mitered precision bevel -->
    <path d="
      M ${cx + R * Math.cos(-Math.PI * 0.25)} ${cy + R * Math.sin(-Math.PI * 0.25)}
      A ${R} ${R} 0 0 1 ${cx + R * Math.cos(Math.PI * 0.25)} ${cy + R * Math.sin(Math.PI * 0.25)}
      L ${cx + r * Math.cos(Math.PI * 0.25)} ${cy + r * Math.sin(Math.PI * 0.25)}
      A ${r} ${r} 0 0 0 ${cx + r * Math.cos(-Math.PI * 0.25)} ${cy + r * Math.sin(-Math.PI * 0.25)}
      Z
    " fill="url(#goldGrad)" filter="url(#softShadow)" />

    <!-- Polished Highlight Crest along Gold Arc -->
    <path d="
      M ${cx + (r + 4) * Math.cos(-Math.PI * 0.25)} ${cy + (r + 4) * Math.sin(-Math.PI * 0.25)}
      A ${r + 4} ${r + 4} 0 0 1 ${cx + (r + 4) * Math.cos(Math.PI * 0.25)} ${cy + (r + 4) * Math.sin(Math.PI * 0.25)}
    " fill="none" stroke="#FFFFFF" stroke-width="2.5" opacity="0.65" />

    <!-- 3. DIAGONAL GOLD ACCENT INSET (Lower-left quadrant harmony) -->
    <path d="
      M ${cx + R * Math.cos(Math.PI * 0.75)} ${cy + R * Math.sin(Math.PI * 0.75)}
      A ${R} ${R} 0 0 1 ${cx + R * Math.cos(Math.PI * 0.85)} ${cy + R * Math.sin(Math.PI * 0.85)}
      L ${cx + r * Math.cos(Math.PI * 0.85)} ${cy + r * Math.sin(Math.PI * 0.85)}
      A ${r} ${r} 0 0 0 ${cx + r * Math.cos(Math.PI * 0.75)} ${cy + r * Math.sin(Math.PI * 0.75)}
      Z
    " fill="url(#goldGrad)" opacity="0.9" />

    ${!isFavicon ? `
    <!-- 4. YORUBA DIACRITIC ANCHOR (Ọ of Ọjà) -->
    <g>
      <rect x="${cx - dotW/2}" y="${dotY}" width="${dotW}" height="${dotH}" rx="${dotW/2}" fill="url(#goldGrad)" stroke="url(#rimGrad)" stroke-width="1" />
      <polygon points="${cx},${dotY + 6} ${cx + 4},${dotY + dotH/2} ${cx},${dotY + dotH - 6} ${cx - 4},${dotY + dotH/2}" fill="#FFFFFF" opacity="0.75" />
    </g>
    ` : ''}
  </svg>
  `;
}

async function run() {
  console.log('Rendering typography options...');
  const browser = await chromium.launch({ channel: 'msedge' });
  const page = await browser.newPage({ viewport: { width: 1800, height: 1400 } });

  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@500;600;700&family=Plus+Jakarta+Sans:wght@600;700;800&family=Syne:wght@600;700;800&display=swap" rel="stylesheet">
    <style>
      body { margin:0; padding:40px; background:#DEDEDE; font-family:'Plus Jakarta Sans', sans-serif; }
      .sheet { display:flex; flex-direction:column; gap:40px; }
      .row { display:grid; grid-template-columns:1fr 1fr; gap:30px; }
      .box { padding:40px; border-radius:24px; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:30px; }
      .box.light { background:#FAF9F6; border:1px solid #DFE4DE; color:#151E1C; }
      .box.dark { background:#0B141A; border:1px solid #1B2D34; color:#F5F7F3; }
      .label { font-size:14px; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; opacity:0.75; }

      .lockup { display:flex; align-items:center; }
      .emblem { width:120px; height:120px; margin-right:12px; transform:translateY(-2px); }

      /* STYLE 1: WARM CHAMPAGNE GOLD EDITORIAL TYPOGRAPHY */
      .font-gold {
        font-family:'Outfit', sans-serif;
        font-size:110px;
        font-weight:600;
        letter-spacing:-0.02em;
        line-height:1;
        background: linear-gradient(135deg, #FFF5DE 0%, #E8C988 25%, #C5A059 60%, #9C7736 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
      }

      /* STYLE 2: DEEP EMERALD WITH GOLD HIGHLIGHT CONTOUR */
      .font-emerald-gold {
        font-family:'Outfit', sans-serif;
        font-size:110px;
        font-weight:600;
        letter-spacing:-0.02em;
        line-height:1;
        background: linear-gradient(170deg, #0A7D63 0%, #075D49 50%, #03362A 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        -webkit-text-stroke: 1.5px #D4AF37;
        filter: drop-shadow(0 2px 4px rgba(0,0,0,0.25));
      }

      /* STYLE 3: SYNE AVANT-GARDE LUXURY */
      .font-syne {
        font-family:'Syne', sans-serif;
        font-size:104px;
        font-weight:700;
        letter-spacing:-0.03em;
        line-height:1;
        background: linear-gradient(135deg, #FFF5DE 0%, #E8C988 30%, #C5A059 70%, #9C7736 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
      }
    </style>
  </head>
  <body>
    <div class="sheet">
      <h1>OJARKEY (ỌJÀ + ARKET) — DESIGN EXPLORATIONS</h1>

      <!-- OPTION 1 -->
      <div>
        <h3>Option 1: Outfit Geometric Luxury (Warm Champagne Gold Type)</h3>
        <div class="row">
          <div class="box light">
            <div class="label">Thème Clair (#FAF9F6)</div>
            <div class="lockup">
              <div class="emblem">${getMasterEmblemSvg(120)}</div>
              <div class="font-gold">jarket</div>
            </div>
          </div>
          <div class="box dark">
            <div class="label">Thème Sombre (#0B141A)</div>
            <div class="lockup">
              <div class="emblem">${getMasterEmblemSvg(120)}</div>
              <div class="font-gold">jarket</div>
            </div>
          </div>
        </div>
      </div>

      <!-- OPTION 2 -->
      <div>
        <h3>Option 2: Deep Emerald with Gold Contour</h3>
        <div class="row">
          <div class="box light">
            <div class="label">Thème Clair (#FAF9F6)</div>
            <div class="lockup">
              <div class="emblem">${getMasterEmblemSvg(120)}</div>
              <div class="font-emerald-gold">jarket</div>
            </div>
          </div>
          <div class="box dark">
            <div class="label">Thème Sombre (#0B141A)</div>
            <div class="lockup">
              <div class="emblem">${getMasterEmblemSvg(120)}</div>
              <div class="font-emerald-gold">jarket</div>
            </div>
          </div>
        </div>
      </div>

      <!-- OPTION 3 -->
      <div>
        <h3>Option 3: Syne Avant-Garde Luxury</h3>
        <div class="row">
          <div class="box light">
            <div class="label">Thème Clair (#FAF9F6)</div>
            <div class="lockup">
              <div class="emblem">${getMasterEmblemSvg(120)}</div>
              <div class="font-syne">jarket</div>
            </div>
          </div>
          <div class="box dark">
            <div class="label">Thème Sombre (#0B141A)</div>
            <div class="lockup">
              <div class="emblem">${getMasterEmblemSvg(120)}</div>
              <div class="font-syne">jarket</div>
            </div>
          </div>
        </div>
      </div>

    </div>
  </body>
  </html>
  `;

  await page.setContent(html, { waitUntil: 'networkidle' });
  const buf = await page.screenshot();
  fs.writeFileSync(path.join(artifactDir, 'Ojarket_Exploration_Review.png'), buf);
  await browser.close();
  console.log('Exploration sheet saved to artifact.');
}

run().catch(console.error);
