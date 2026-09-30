const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const targetDir = 'c:/S_S/AI_F/AIFOUNFRYAPP/apps/web/public/brand';
const artifactDir = 'C:/Users/HP/.gemini/antigravity/brain/b21d8b82-32aa-4a75-9a2c-35427c897dd9';

if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

// -------------------------------------------------------------
// SVG DEFINITIONS: ULTRA-PREMIUM OJARKEY EMBLEM
// -------------------------------------------------------------

/**
 * Returns the SVG for the iconic "O" emblem.
 * Design Concept:
 * - Two interlocking kinetic luxury crescents:
 *   1. Left/Bottom arc in Royal Emerald (#04382C -> #075D49 -> #0A7D63)
 *   2. Right/Top arc in Warm Champagne Gold (#FDF4DC -> #E6CA85 -> #C5A059 -> #8C6629)
 *   3. 45-degree precision negative space cuts separating the meeting points, creating the illusion of infinite dynamic exchange.
 *   4. An inner fine golden halo contour and outer rim.
 *   5. Grounding Yoruba diacritic jewel (the "ọ" of Ọjà) at the exact optical bottom.
 */
function getEmblemSvg(size = 1024, isFavicon = false) {
  const cx = 512;
  const cy = isFavicon ? 512 : 486;
  const R = isFavicon ? 440 : 380;       // Outer radius
  const r = isFavicon ? 270 : 230;       // Inner radius
  const strokeW = R - r;                 // Ring width (~150px)
  const rMid = (R + r) / 2;

  // Diacritic jewel parameters (Ọ mark)
  const dotY = cy + R + 38;
  const dotW = 26;
  const dotH = 46;

  return `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="${size}" height="${size}">
    <defs>
      <!-- Deep Royal Emerald Gradient -->
      <linearGradient id="emEmerald" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#022B22" />
        <stop offset="35%" stop-color="#075D49" />
        <stop offset="70%" stop-color="#0A7D63" />
        <stop offset="100%" stop-color="#10A382" />
      </linearGradient>

      <!-- Warm Polished Champagne Gold Gradient -->
      <linearGradient id="emGold" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#FFF8E8" />
        <stop offset="25%" stop-color="#F2D89D" />
        <stop offset="60%" stop-color="#C5A059" />
        <stop offset="85%" stop-color="#9C7736" />
        <stop offset="100%" stop-color="#6E501D" />
      </linearGradient>

      <!-- Fine Luminous Rim for Contrast on Dark & Light -->
      <linearGradient id="emRim" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#FDF4DC" stop-opacity="0.95" />
        <stop offset="50%" stop-color="#C5A059" stop-opacity="0.65" />
        <stop offset="100%" stop-color="#075D49" stop-opacity="0.8" />
      </linearGradient>

      <linearGradient id="emeraldSheen" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.3" />
        <stop offset="50%" stop-color="#FFFFFF" stop-opacity="0.0" />
      </linearGradient>

      <!-- Luxury Drop Shadows -->
      <filter id="softDepth" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="-6" dy="10" stdDeviation="16" flood-color="#011812" flood-opacity="0.38" />
      </filter>

      <filter id="goldGlow" x="-30%" y="-30%" width="160%" height="160%">
        <feDropShadow dx="0" dy="4" stdDeviation="8" flood-color="#C5A059" flood-opacity="0.4" />
      </filter>
    </defs>

    <!-- 0. Subtle Hairline Rim for Crisp Definition on Any Theme -->
    <circle cx="${cx}" cy="${cy}" r="${R + 2}" fill="none" stroke="url(#emRim)" stroke-width="2" opacity="0.75" />
    <circle cx="${cx}" cy="${cy}" r="${r - 2}" fill="none" stroke="url(#emRim)" stroke-width="2" opacity="0.75" />

    <!-- 1. PRIMARY ROYAL EMERALD CRESCENT (Sweeping from top-left through bottom to lower-right) -->
    <!-- From ~40 deg to ~220 deg with precision mitered end cuts -->
    <path d="
      M ${cx + R * Math.cos(0.72)} ${cy - R * Math.sin(0.72)}
      A ${R} ${R} 0 1 0 ${cx + R * Math.cos(3.85)} ${cy - R * Math.sin(3.85)}
      L ${cx + r * Math.cos(3.85)} ${cy - r * Math.sin(3.85)}
      A ${r} ${r} 0 1 1 ${cx + r * Math.cos(0.72)} ${cy - r * Math.sin(0.72)}
      Z
    " fill="url(#emEmerald)" />

    <!-- Subtle satin light reflection on Emerald -->
    <path d="
      M ${cx + R * Math.cos(0.72)} ${cy - R * Math.sin(0.72)}
      A ${R} ${R} 0 1 0 ${cx + R * Math.cos(3.85)} ${cy - R * Math.sin(3.85)}
      L ${cx + r * Math.cos(3.85)} ${cy - r * Math.sin(3.85)}
      A ${r} ${r} 0 1 1 ${cx + r * Math.cos(0.72)} ${cy - r * Math.sin(0.72)}
      Z
    " fill="url(#emeraldSheen)" />

    <!-- 2. SECONDARY CHAMPAGNE GOLD CRESCENT (The Arc of Wealth / Solar Agora) -->
    <!-- Sweeps along the upper right with precision diagonal spacing -->
    <path d="
      M ${cx + R * Math.cos(0.85)} ${cy - R * Math.sin(0.85)}
      A ${R} ${R} 0 0 1 ${cx + R * Math.cos(3.72)} ${cy - R * Math.sin(3.72)}
      L ${cx + r * Math.cos(3.72)} ${cy - r * Math.sin(3.72)}
      A ${r} ${r} 0 0 0 ${cx + r * Math.cos(0.85)} ${cy - r * Math.sin(0.85)}
      Z
    " fill="url(#emGold)" filter="url(#softDepth)" />

    <!-- Inner gold rim highlight on the crescent -->
    <path d="
      M ${cx + r * Math.cos(0.85)} ${cy - r * Math.sin(0.85)}
      A ${r} ${r} 0 0 1 ${cx + r * Math.cos(3.72)} ${cy - r * Math.sin(3.72)}
    " fill="none" stroke="#FFF8E8" stroke-width="4" opacity="0.65" />

    <!-- 3. DIAGONAL GOLD ACCENT INLAY (Echoing in the emerald body for rhythm) -->
    <line 
      x1="${cx - R * 0.45}" y1="${cy + R * 0.7}" 
      x2="${cx - r * 0.45}" y2="${cy + r * 0.7}" 
      stroke="url(#emGold)" stroke-width="6" stroke-linecap="round" opacity="0.85" 
    />

    ${!isFavicon ? `
    <!-- 4. YORUBA DIACRITIC (The Ọ of Ọjà) -->
    <!-- Precision architectural diamond / jewel capsule -->
    <g filter="url(#goldGlow)">
      <!-- Grounding capsule -->
      <rect x="${cx - dotW/2}" y="${dotY}" width="${dotW}" height="${dotH}" rx="${dotW/2}" fill="url(#emGold)" stroke="url(#emRim)" stroke-width="1.5" />
      <!-- Faceted central diamond -->
      <polygon points="${cx},${dotY + 10} ${cx + 7},${dotY + dotH/2} ${cx},${dotY + dotH - 10} ${cx - 7},${dotY + dotH/2}" fill="#FFFFFF" opacity="0.8" />
    </g>
    ` : ''}
  </svg>
  `;
}

/**
 * Returns HTML for the Wordmark:
 * [ Circular Emblem = O ] j a r k e t
 * Perfectly kerned, optical height matched, zero duplicate O.
 */
function getWordmarkHtml(isCompact = false) {
  const width = isCompact ? 1300 : 1650;
  const height = isCompact ? 380 : 480;
  const iconSize = isCompact ? 200 : 250;
  const fontSize = isCompact ? 180 : 225;

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@500;600;700&display=swap" rel="stylesheet">
    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body {
        width: ${width}px;
        height: ${height}px;
        background: transparent;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
      }
      .lockup {
        display: flex;
        align-items: baseline;
        position: relative;
      }
      .emblem-wrap {
        width: ${iconSize}px;
        height: ${iconSize}px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        margin-right: ${isCompact ? 16 : 22}px;
        /* Optical baseline alignment so bottom of circle aligns with baseline of jarket */
        transform: translateY(${isCompact ? 38 : 48}px);
        vertical-align: baseline;
      }
      .emblem-wrap svg {
        width: 100%;
        height: 100%;
        display: block;
      }
      .letters {
        font-family: 'Outfit', sans-serif;
        font-size: ${fontSize}px;
        font-weight: 600;
        letter-spacing: -0.015em;
        line-height: 1;
        display: inline-block;
        white-space: nowrap;
        
        /* High-end Multi-Tone Theme-Adaptive Styling:
           Deep Emerald core (#075D49 -> #0A7D63) with a warm Champagne Gold micro-stroke (#C5A059)
           Pops with majestic authority on Light (#FAF9F6) and glows warmly on Dark (#0B141A) */
        background: linear-gradient(170deg, #0A7D63 0%, #075D49 50%, #151E1C 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        -webkit-text-stroke: 1.5px rgba(212, 175, 55, 0.55);
        filter: drop-shadow(0 1px 1px rgba(0,0,0,0.25));
      }
    </style>
  </head>
  <body>
    <div class="lockup">
      <div class="emblem-wrap">
        ${getEmblemSvg(iconSize, false)}
      </div>
      <div class="letters">jarket</div>
    </div>
  </body>
  </html>
  `;
}

// -------------------------------------------------------------
// MAIN PLAYWRIGHT EXECUTION
// -------------------------------------------------------------

async function main() {
  console.log('=== RENDERING HIGH-PRECISION OJARKEY LOGOS ===');
  const browser = await chromium.launch({ channel: 'msedge' });
  const context = await browser.newContext({ deviceScaleFactor: 2 }); // 2x Retina rendering

  // 1. Ojarket_01_Icon_UltraPremium_Transparent.png (1024 x 1024)
  console.log('Rendering 01: Icon (1024x1024)...');
  {
    const page = await context.newPage();
    await page.setViewportSize({ width: 1024, height: 1024 });
    const svgHtml = `<!DOCTYPE html><html><body style="margin:0;padding:0;background:transparent;display:flex;align-items:center;justify-content:center;width:1024px;height:1024px;">${getEmblemSvg(1024, false)}</body></html>`;
    await page.setContent(svgHtml);
    const buf = await page.screenshot({ omitBackground: true });
    
    fs.writeFileSync(path.join(targetDir, 'Ojarket_01_Icon_UltraPremium_Transparent.png'), buf);
    fs.writeFileSync(path.join(artifactDir, 'Ojarket_01_Icon_UltraPremium_Transparent.png'), buf);
    await page.close();
    console.log('✓ 01 Icon complete.');
  }

  // 2. Ojarket_02_Wordmark_UltraPremium_Transparent.png (1650 x 480)
  console.log('Rendering 02: Wordmark UltraPremium (1650x480)...');
  {
    const page = await context.newPage();
    await page.setViewportSize({ width: 1650, height: 480 });
    await page.setContent(getWordmarkHtml(false), { waitUntil: 'networkidle' });
    const buf = await page.screenshot({ omitBackground: true });
    
    fs.writeFileSync(path.join(targetDir, 'Ojarket_02_Wordmark_UltraPremium_Transparent.png'), buf);
    fs.writeFileSync(path.join(artifactDir, 'Ojarket_02_Wordmark_UltraPremium_Transparent.png'), buf);
    await page.close();
    console.log('✓ 02 Wordmark complete.');
  }

  // 3. Ojarket_03_Compact_Wordmark_Transparent.png (1300 x 380)
  console.log('Rendering 03: Compact Wordmark (1300x380)...');
  {
    const page = await context.newPage();
    await page.setViewportSize({ width: 1300, height: 380 });
    await page.setContent(getWordmarkHtml(true), { waitUntil: 'networkidle' });
    const buf = await page.screenshot({ omitBackground: true });
    
    fs.writeFileSync(path.join(targetDir, 'Ojarket_03_Compact_Wordmark_Transparent.png'), buf);
    fs.writeFileSync(path.join(artifactDir, 'Ojarket_03_Compact_Wordmark_Transparent.png'), buf);
    await page.close();
    console.log('✓ 03 Compact Wordmark complete.');
  }

  // 4. Ojarket_04_Favicon_512_Transparent.png (512 x 512)
  console.log('Rendering 04: Favicon 512 (512x512)...');
  {
    const page = await context.newPage();
    await page.setViewportSize({ width: 512, height: 512 });
    const svgHtml = `<!DOCTYPE html><html><body style="margin:0;padding:0;background:transparent;display:flex;align-items:center;justify-content:center;width:512px;height:512px;">${getEmblemSvg(512, true)}</body></html>`;
    await page.setContent(svgHtml);
    const buf = await page.screenshot({ omitBackground: true });
    
    fs.writeFileSync(path.join(targetDir, 'Ojarket_04_Favicon_512_Transparent.png'), buf);
    fs.writeFileSync(path.join(artifactDir, 'Ojarket_04_Favicon_512_Transparent.png'), buf);
    await page.close();
    console.log('✓ 04 Favicon complete.');
  }

  // 5. Ojarket_05_AppIcon_Master_1024_Transparent.png (1024 x 1024)
  console.log('Rendering 05: AppIcon Master (1024x1024)...');
  {
    const page = await context.newPage();
    await page.setViewportSize({ width: 1024, height: 1024 });
    const svgHtml = `<!DOCTYPE html><html><body style="margin:0;padding:0;background:transparent;display:flex;align-items:center;justify-content:center;width:1024px;height:1024px;">${getEmblemSvg(1024, false)}</body></html>`;
    await page.setContent(svgHtml);
    const buf = await page.screenshot({ omitBackground: true });
    
    fs.writeFileSync(path.join(targetDir, 'Ojarket_05_AppIcon_Master_1024_Transparent.png'), buf);
    fs.writeFileSync(path.join(artifactDir, 'Ojarket_05_AppIcon_Master_1024_Transparent.png'), buf);
    await page.close();
    console.log('✓ 05 AppIcon Master complete.');
  }

  // 6. SHOWCASE SHEET: Testing Dark, Light and Checkered Transparency
  console.log('Rendering Proof of Transparency & Theme Adaptability...');
  {
    const page = await context.newPage();
    await page.setViewportSize({ width: 1800, height: 1200 });

    const wordmarkBase64 = fs.readFileSync(path.join(artifactDir, 'Ojarket_02_Wordmark_UltraPremium_Transparent.png')).toString('base64');
    const iconBase64 = fs.readFileSync(path.join(artifactDir, 'Ojarket_01_Icon_UltraPremium_Transparent.png')).toString('base64');

    const proofHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@600;700&display=swap" rel="stylesheet">
      <style>
        body {
          margin: 0;
          padding: 40px;
          background: #EAEAE6;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
        .header {
          margin-bottom: 30px;
          text-align: center;
        }
        .header h1 {
          font-size: 32px;
          color: #151E1C;
          letter-spacing: -0.02em;
        }
        .header p {
          color: #5B6661;
          font-size: 16px;
          margin-top: 6px;
        }
        .grid {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 24px;
        }
        .card {
          padding: 36px 24px;
          border-radius: 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 32px;
          box-shadow: 0 8px 30px rgba(0,0,0,0.06);
        }
        .card.light {
          background: #FAF9F6;
          border: 1px solid #DFE4DE;
        }
        .card.dark {
          background: #0B141A;
          border: 1px solid #1B2D34;
        }
        /* True Transparency Checkerboard */
        .card.transparent-proof {
          background-color: #FFFFFF;
          background-image: 
            linear-gradient(45deg, #E2E8F0 25%, transparent 25%), 
            linear-gradient(-45deg, #E2E8F0 25%, transparent 25%), 
            linear-gradient(45deg, transparent 75%, #E2E8F0 75%), 
            linear-gradient(-45deg, transparent 75%, #E2E8F0 75%);
          background-size: 20px 20px;
          background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
          border: 1px solid #CBD5E1;
        }
        .card-title {
          font-size: 15px;
          font-weight: 700;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }
        .card.light .card-title { color: #151E1C; }
        .card.dark .card-title { color: #F5F7F3; }
        .card.transparent-proof .card-title { color: #075D49; background: #FFF; padding: 4px 12px; border-radius: 8px; }
        .wm-img {
          width: 92%;
          height: auto;
          display: block;
        }
        .icon-img {
          width: 170px;
          height: 170px;
          display: block;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>OJARKEY BRAND IDENTITY · ULTRA-PREMIUM V3</h1>
        <p>Prestige Heritage: Ọjà (Yoruba Market) + Arket (Architecture of Commerce) · 100% Real Alpha Transparency</p>
      </div>

      <div class="grid">
        <!-- 1. LIGHT THEME -->
        <div class="card light">
          <div class="card-title">Thème Clair (#FAF9F6)</div>
          <img class="wm-img" src="data:image/png;base64,${wordmarkBase64}" />
          <img class="icon-img" src="data:image/png;base64,${iconBase64}" />
        </div>

        <!-- 2. DARK THEME -->
        <div class="card dark">
          <div class="card-title">Thème Sombre (#0B141A)</div>
          <img class="wm-img" src="data:image/png;base64,${wordmarkBase64}" />
          <img class="icon-img" src="data:image/png;base64,${iconBase64}" />
        </div>

        <!-- 3. REAL TRANSPARENCY PROOF -->
        <div class="card transparent-proof">
          <div class="card-title">Preuve Transparence Réelle (Damier)</div>
          <img class="wm-img" src="data:image/png;base64,${wordmarkBase64}" />
          <img class="icon-img" src="data:image/png;base64,${iconBase64}" />
        </div>
      </div>
    </body>
    </html>
    `;
    await page.setContent(proofHtml, { waitUntil: 'networkidle' });
    const buf = await page.screenshot();
    fs.writeFileSync(path.join(artifactDir, 'Ojarket_Showcase_Proof.png'), buf);
    await page.close();
    console.log('✓ Proof of transparency sheet rendered.');
  }

  await browser.close();
  console.log('=== ALL ULTRA-PREMIUM LOGOS READY ===');
}

main().catch(err => {
  console.error('Error during generation:', err);
  process.exit(1);
});
