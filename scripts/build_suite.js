const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const targetDir = 'c:/S_S/AI_F/AIFOUNFRYAPP/apps/web/public/brand';
const artifactDir = 'C:/Users/HP/.gemini/antigravity/brain/b21d8b82-32aa-4a75-9a2c-35427c897dd9';

if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

// -------------------------------------------------------------------------
// SVG GENERATOR FUNCTIONS
// -------------------------------------------------------------------------

/**
 * Generates the SVG for the standalone iconic "O" emblem.
 * Size: viewBox 0 0 1024 1024
 */
function getIconSvg(size = 1024, isFavicon = false, isDark = false) {
  const cx = 512;
  const cy = isFavicon ? 512 : 475;
  const R = isFavicon ? 440 : 380;
  const r = isFavicon ? 260 : 225;
  const strokeW = R - r;
  const rMid = (R + r) / 2;

  // Diacritic jewel: exact Yoruba Ọ diacritic below circle
  const dotY = cy + R + 26;
  const dotW = 28;
  const dotH = 50;

  return `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="${size}" height="${size}">
    <defs>
      <!-- Deep Royal Emerald Gradient -->
      <linearGradient id="emGradIcon_${size}_${isDark}" x1="10%" y1="100%" x2="90%" y2="0%">
        <stop offset="0%" stop-color="#022B22" />
        <stop offset="35%" stop-color="#075D49" />
        <stop offset="70%" stop-color="#0A7D63" />
        <stop offset="100%" stop-color="#14A081" />
      </linearGradient>

      <!-- Polished Champagne Gold Gradient -->
      <linearGradient id="goldGradIcon_${size}_${isDark}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#FFF8E8" />
        <stop offset="25%" stop-color="#F2D898" />
        <stop offset="55%" stop-color="#D4AF37" />
        <stop offset="85%" stop-color="#A67C33" />
        <stop offset="100%" stop-color="#6E501D" />
      </linearGradient>

      <!-- Fine Luminous Rim for Contrast -->
      <linearGradient id="rimGradIcon_${size}_${isDark}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#FFF1D0" stop-opacity="0.95" />
        <stop offset="50%" stop-color="#D4AF37" stop-opacity="0.75" />
        <stop offset="100%" stop-color="#0A7D63" stop-opacity="0.85" />
      </linearGradient>

      <filter id="shadowIcon_${size}_${isDark}" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="-4" dy="8" stdDeviation="12" flood-color="#011812" flood-opacity="0.38" />
      </filter>
    </defs>

    <!-- 0. Precision Luminous Rim (Crisp contrast on any background) -->
    <circle cx="${cx}" cy="${cy}" r="${R + 1.5}" fill="none" stroke="url(#rimGradIcon_${size}_${isDark})" stroke-width="2.5" opacity="0.85" />
    <circle cx="${cx}" cy="${cy}" r="${r - 1.5}" fill="none" stroke="url(#rimGradIcon_${size}_${isDark})" stroke-width="2.5" opacity="0.85" />

    <!-- 1. BASE ROYAL EMERALD TORUS -->
    <circle cx="${cx}" cy="${cy}" r="${rMid}" fill="none" stroke="url(#emGradIcon_${size}_${isDark})" stroke-width="${strokeW}" />

    <!-- 2. SCULPTED CHAMPAGNE GOLD CROWN ARC (Upper Right Quadrant) -->
    <path d="
      M ${cx + R * Math.cos(-Math.PI * 0.25)} ${cy + R * Math.sin(-Math.PI * 0.25)}
      A ${R} ${R} 0 0 1 ${cx + R * Math.cos(Math.PI * 0.25)} ${cy + R * Math.sin(Math.PI * 0.25)}
      L ${cx + r * Math.cos(Math.PI * 0.25)} ${cy + r * Math.sin(Math.PI * 0.25)}
      A ${r} ${r} 0 0 0 ${cx + r * Math.cos(-Math.PI * 0.25)} ${cy + r * Math.sin(-Math.PI * 0.25)}
      Z
    " fill="url(#goldGradIcon_${size}_${isDark})" filter="url(#shadowIcon_${size}_${isDark})" />

    <!-- Inner Highlight Crest along Gold Arc -->
    <path d="
      M ${cx + (r + 4) * Math.cos(-Math.PI * 0.25)} ${cy + (r + 4) * Math.sin(-Math.PI * 0.25)}
      A ${r + 4} ${r + 4} 0 0 1 ${cx + (r + 4) * Math.cos(Math.PI * 0.25)} ${cy + (r + 4) * Math.sin(Math.PI * 0.25)}
    " fill="none" stroke="#FFFFFF" stroke-width="3" opacity="0.75" />

    <!-- 3. DIAGONAL GOLD ACCENT INSET (Lower-left quadrant harmony) -->
    <path d="
      M ${cx + R * Math.cos(Math.PI * 0.72)} ${cy + R * Math.sin(Math.PI * 0.72)}
      A ${R} ${R} 0 0 1 ${cx + R * Math.cos(Math.PI * 0.82)} ${cy + R * Math.sin(Math.PI * 0.82)}
      L ${cx + r * Math.cos(Math.PI * 0.82)} ${cy + r * Math.sin(Math.PI * 0.82)}
      A ${r} ${r} 0 0 0 ${cx + r * Math.cos(Math.PI * 0.72)} ${cy + r * Math.sin(Math.PI * 0.72)}
      Z
    " fill="url(#goldGradIcon_${size}_${isDark})" opacity="0.95" />

    ${!isFavicon ? `
    <!-- 4. YORUBA DIACRITIC ANCHOR (Ọ of Ọjà) -->
    <g>
      <rect x="${cx - dotW/2}" y="${dotY}" width="${dotW}" height="${dotH}" rx="${dotW/2}" fill="url(#goldGradIcon_${size}_${isDark})" stroke="url(#rimGradIcon_${size}_${isDark})" stroke-width="1.5" />
      <polygon points="${cx},${dotY + 7} ${cx + 5},${dotY + dotH/2} ${cx},${dotY + dotH - 7} ${cx - 5},${dotY + dotH/2}" fill="#FFFFFF" opacity="0.85" />
    </g>
    ` : ''}
  </svg>
  `;
}

/**
 * Generates the SVG for the Wordmark: [O]jarket
 * Optical baseline matched, no duplicate O.
 */
function getWordmarkSvg(width = 1600, height = 480, isCompact = false, isDark = false) {
  // SVG coordinates:
  // Baseline = 320
  // Cap-height / ascender = 140 (height = 180)
  // Emblem center: cy = 230, cx = isCompact ? 160 : 180
  // Emblem R = 90 -> top = 140 (cap-height), bottom = 320 (baseline)
  // Diacritic drops from y=334 to y=374 (matches descender of 'j' at y ≈ 375!)

  const cx = isCompact ? 140 : 160;
  const cy = 230;
  const R = 90;
  const r = 55;
  const strokeW = R - r;
  const rMid = (R + r) / 2;
  const dotY = 334;
  const dotW = 13;
  const dotH = 28;

  const textX = isCompact ? 250 : 276;
  const textY = 320;
  const fontSize = 195;

  const uid = `wm_${width}_${isCompact ? 'c' : 'f'}_${isDark ? 'dk' : 'lt'}`;
  const textFill = isDark ? '#F5F7F3' : 'url(#emGrad_' + uid + ')';

  return `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
    <defs>
      <!-- Deep Royal Emerald Gradient -->
      <linearGradient id="emGrad_${uid}" x1="10%" y1="100%" x2="90%" y2="0%">
        <stop offset="0%" stop-color="#022B22" />
        <stop offset="35%" stop-color="#075D49" />
        <stop offset="70%" stop-color="#0A7D63" />
        <stop offset="100%" stop-color="#14A081" />
      </linearGradient>

      <!-- Polished Champagne Gold Gradient -->
      <linearGradient id="goldGrad_${uid}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#FFF8E8" />
        <stop offset="25%" stop-color="#F2D898" />
        <stop offset="55%" stop-color="#D4AF37" />
        <stop offset="85%" stop-color="#A67C33" />
        <stop offset="100%" stop-color="#6E501D" />
      </linearGradient>

      <!-- Fine Luminous Rim -->
      <linearGradient id="rimGrad_${uid}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#FFF1D0" stop-opacity="0.95" />
        <stop offset="50%" stop-color="#D4AF37" stop-opacity="0.75" />
        <stop offset="100%" stop-color="#0A7D63" stop-opacity="0.85" />
      </linearGradient>

      <filter id="shadow_${uid}" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="-2" dy="4" stdDeviation="6" flood-color="#011812" flood-opacity="0.35" />
      </filter>
    </defs>

    <style>
      @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@600&amp;display=swap');
      .txt_${uid} {
        font-family: 'Outfit', sans-serif;
        font-size: ${fontSize}px;
        font-weight: 600;
        letter-spacing: -0.015em;
        fill: ${textFill};
      }
    </style>

    <!-- THE 'O' EMBLEM -->
    <g>
      <!-- Precision Hairline Rims -->
      <circle cx="${cx}" cy="${cy}" r="${R + 1}" fill="none" stroke="url(#rimGrad_${uid})" stroke-width="1.5" opacity="0.8" />
      <circle cx="${cx}" cy="${cy}" r="${r - 1}" fill="none" stroke="url(#rimGrad_${uid})" stroke-width="1.5" opacity="0.8" />

      <!-- Royal Emerald Ring -->
      <circle cx="${cx}" cy="${cy}" r="${rMid}" fill="none" stroke="url(#emGrad_${uid})" stroke-width="${strokeW}" />

      <!-- Sculpted Champagne Gold Crown Arc -->
      <path d="
        M ${cx + R * Math.cos(-Math.PI * 0.25)} ${cy + R * Math.sin(-Math.PI * 0.25)}
        A ${R} ${R} 0 0 1 ${cx + R * Math.cos(Math.PI * 0.25)} ${cy + R * Math.sin(Math.PI * 0.25)}
        L ${cx + r * Math.cos(Math.PI * 0.25)} ${cy + r * Math.sin(Math.PI * 0.25)}
        A ${r} ${r} 0 0 0 ${cx + r * Math.cos(-Math.PI * 0.25)} ${cy + r * Math.sin(-Math.PI * 0.25)}
        Z
      " fill="url(#goldGrad_${uid})" filter="url(#shadow_${uid})" />

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
      " fill="url(#goldGrad_${uid})" opacity="0.95" />

      <!-- Yoruba Diacritic (Ọ) -->
      <g>
        <rect x="${cx - dotW/2}" y="${dotY}" width="${dotW}" height="${dotH}" rx="${dotW/2}" fill="url(#goldGrad_${uid})" stroke="url(#rimGrad_${uid})" stroke-width="1" />
        <polygon points="${cx},${dotY + 5} ${cx + 3.5},${dotY + dotH/2} ${cx},${dotY + dotH - 5} ${cx - 3.5},${dotY + dotH/2}" fill="#FFFFFF" opacity="0.8" />
      </g>
    </g>

    <!-- 'jarket' TYPOGRAPHY -->
    <text x="${textX}" y="${textY}" class="txt_${uid}">jarket</text>
  </svg>
  `;
}

// -------------------------------------------------------------------------
// MASTER BUILD SUITE
// -------------------------------------------------------------------------

async function buildAll() {
  console.log('=== BUILDING PRODUCTION OJARKEY SUITE ===');
  const browser = await chromium.launch({ channel: 'msedge' });
  const context = await browser.newContext({ deviceScaleFactor: 2 }); // 2x Retina rendering

  const renderAndSave = async (filename, svgContent, width, height) => {
    const page = await context.newPage();
    await page.setViewportSize({ width, height });
    const html = `<!DOCTYPE html><html><body style="margin:0;padding:0;background:transparent;display:flex;align-items:center;justify-content:center;width:${width}px;height:${height}px;">${svgContent}</body></html>`;
    await page.setContent(html, { waitUntil: 'networkidle' });
    const buf = await page.screenshot({ omitBackground: true });
    
    // Save to public/brand and artifact directory
    fs.writeFileSync(path.join(targetDir, filename), buf);
    fs.writeFileSync(path.join(artifactDir, filename), buf);
    await page.close();
    console.log(`✓ Generated ${filename} (${width}x${height})`);
  };

  // 1. Ojarket_01_Icon_UltraPremium_Transparent.png (1024x1024)
  await renderAndSave('Ojarket_01_Icon_UltraPremium_Transparent.png', getIconSvg(1024, false, false), 1024, 1024);
  await renderAndSave('Ojarket_01_Icon_UltraPremium_Dark_Transparent.png', getIconSvg(1024, false, true), 1024, 1024);

  // 2. Ojarket_02_Wordmark_UltraPremium_Transparent.png (1600x480)
  await renderAndSave('Ojarket_02_Wordmark_UltraPremium_Transparent.png', getWordmarkSvg(1600, 480, false, false), 1600, 480);
  await renderAndSave('Ojarket_02_Wordmark_UltraPremium_Dark_Transparent.png', getWordmarkSvg(1600, 480, false, true), 1600, 480);

  // 3. Ojarket_03_Compact_Wordmark_Transparent.png (1200x360)
  await renderAndSave('Ojarket_03_Compact_Wordmark_Transparent.png', getWordmarkSvg(1200, 360, true, false), 1200, 360);
  await renderAndSave('Ojarket_03_Compact_Wordmark_Dark_Transparent.png', getWordmarkSvg(1200, 360, true, true), 1200, 360);

  // 4. Ojarket_04_Favicon_512_Transparent.png (512x512)
  await renderAndSave('Ojarket_04_Favicon_512_Transparent.png', getIconSvg(512, true, false), 512, 512);
  await renderAndSave('Ojarket_04_Favicon_512_Dark_Transparent.png', getIconSvg(512, true, true), 512, 512);

  // 5. Ojarket_05_AppIcon_Master_1024_Transparent.png (1024x1024)
  await renderAndSave('Ojarket_05_AppIcon_Master_1024_Transparent.png', getIconSvg(1024, false, false), 1024, 1024);
  await renderAndSave('Ojarket_05_AppIcon_Master_1024_Dark_Transparent.png', getIconSvg(1024, false, true), 1024, 1024);

  // 6. OVERARCHING SHOWCASE VALIDATION PRESENTATION
  console.log('Generating Master Proof of Quality & Real Transparency...');
  {
    const page = await context.newPage();
    await page.setViewportSize({ width: 1920, height: 1350 });

    const wmLightB64 = fs.readFileSync(path.join(artifactDir, 'Ojarket_02_Wordmark_UltraPremium_Transparent.png')).toString('base64');
    const wmDarkB64 = fs.readFileSync(path.join(artifactDir, 'Ojarket_02_Wordmark_UltraPremium_Dark_Transparent.png')).toString('base64');
    const iconB64 = fs.readFileSync(path.join(artifactDir, 'Ojarket_01_Icon_UltraPremium_Transparent.png')).toString('base64');
    const faviconB64 = fs.readFileSync(path.join(artifactDir, 'Ojarket_04_Favicon_512_Transparent.png')).toString('base64');

    const showcaseHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap" rel="stylesheet">
      <style>
        body {
          margin: 0;
          padding: 50px;
          background: #E8E8E4;
          font-family: 'Plus Jakarta Sans', sans-serif;
          color: #151E1C;
        }
        .header {
          text-align: center;
          margin-bottom: 40px;
        }
        .header h1 {
          font-size: 36px;
          font-weight: 800;
          letter-spacing: -0.02em;
          margin: 0;
        }
        .header p {
          font-size: 17px;
          color: #5B6661;
          margin-top: 8px;
        }
        .grid-main {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 30px;
          margin-bottom: 30px;
        }
        .card {
          padding: 40px;
          border-radius: 24px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 30px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.06);
        }
        .card.light {
          background: #FAF9F6;
          border: 1px solid #DFE4DE;
        }
        .card.dark {
          background: #0B141A;
          border: 1px solid #1B2D34;
        }
        .card-tag {
          font-size: 13px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }
        .card.light .card-tag { color: #075D49; }
        .card.dark .card-tag { color: #D4AF37; }

        .wm-img {
          width: 90%;
          height: auto;
          display: block;
        }
        .icon-row {
          display: flex;
          align-items: center;
          gap: 40px;
        }
        .icon-lg { width: 140px; height: 140px; }
        .icon-sm { width: 64px; height: 64px; }

        /* Checkerboard Proof Card */
        .card-proof {
          background-color: #FFFFFF;
          background-image: 
            linear-gradient(45deg, #E2E8F0 25%, transparent 25%), 
            linear-gradient(-45deg, #E2E8F0 25%, transparent 25%), 
            linear-gradient(45deg, transparent 75%, #E2E8F0 75%), 
            linear-gradient(-45deg, transparent 75%, #E2E8F0 75%);
          background-size: 20px 20px;
          background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
          border: 1px solid #CBD5E1;
          padding: 40px;
          border-radius: 24px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 25px;
        }
        .proof-badge {
          background: #075D49;
          color: #FFF;
          font-size: 13px;
          font-weight: 700;
          padding: 6px 16px;
          border-radius: 20px;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>OJARKET BRAND IDENTITY · ULTRA-PREMIUM SUITE</h1>
        <p>Prestige Heritage: Ọjà (Yoruba Market) + Arket (Architecture of Commerce) · 100% Real Alpha Transparency (Zero Fake Background)</p>
      </div>

      <div class="grid-main">
        <!-- 1. LIGHT THEME -->
        <div class="card light">
          <div class="card-tag">Thème Clair (Stone Ivory #FAF9F6)</div>
          <img class="wm-img" src="data:image/png;base64,${wmLightB64}" />
          <div class="icon-row">
            <img class="icon-lg" src="data:image/png;base64,${iconB64}" />
            <img class="icon-sm" src="data:image/png;base64,${faviconB64}" />
          </div>
        </div>

        <!-- 2. DARK THEME -->
        <div class="card dark">
          <div class="card-tag">Thème Sombre (Midnight Slate #0B141A)</div>
          <img class="wm-img" src="data:image/png;base64,${wmDarkB64}" />
          <div class="icon-row">
            <img class="icon-lg" src="data:image/png;base64,${iconB64}" />
            <img class="icon-sm" src="data:image/png;base64,${faviconB64}" />
          </div>
        </div>
      </div>

      <!-- 3. REAL TRANSPARENCY PROOF ON CHECKERBOARD -->
      <div class="card-proof">
        <div class="proof-badge">Preuve Transparence Réelle (Damier Alpha = 0)</div>
        <img style="width:70%; max-width:800px;" src="data:image/png;base64,${wmLightB64}" />
        <div class="icon-row">
          <img style="width:120px; height:120px;" src="data:image/png;base64,${iconB64}" />
          <img style="width:64px; height:64px;" src="data:image/png;base64,${faviconB64}" />
        </div>
      </div>
    </body>
    </html>
    `;

    await page.setContent(showcaseHtml, { waitUntil: 'networkidle' });
    const buf = await page.screenshot();
    fs.writeFileSync(path.join(artifactDir, 'Ojarket_Master_Showcase.png'), buf);
    await page.close();
    console.log('✓ Master Showcase presentation generated.');
  }

  await browser.close();
  console.log('=== COMPLETE SUITE FINISHED SUCCESSFULLY ===');
}

buildAll().catch(err => {
  console.error('Build error:', err);
  process.exit(1);
});
