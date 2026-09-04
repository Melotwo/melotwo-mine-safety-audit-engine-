import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

// 1. Generate the optimized wide MeloTwo Shield SVG for both standalone use and PWA rasterization
function getMeloTwoShieldSvg({ 
  width = 512, 
  height = 512, 
  isFullBleedMaskable = false,
  background = 'solid' // 'solid' | 'transparent' | 'gradient'
}) {
  // Safe zone calculation for Android maskable icons (central 80% circle)
  // For maskable, shield scale is ~72% to guarantee full visibility inside any launcher shape (circle/squircle/teardrop)
  // For standard icons, shield scale is ~86% for maximum visual punch and authority
  const scale = isFullBleedMaskable ? 0.72 : 0.86;
  const cx = width / 2;
  const cy = height / 2;
  
  // Transform to center and scale the 64x64 coordinate system into width x height
  const matrixScale = (width / 64) * scale;
  const translateX = cx - (32 * matrixScale);
  const translateY = cy - (32 * matrixScale);

  const bgRect = background === 'transparent' ? '' : `
    <!-- Background Canvas -->
    <rect width="${width}" height="${height}" fill="url(#pwaBgGrad)" rx="${isFullBleedMaskable ? 0 : Math.round(width * 0.18)}" />
    <!-- Subtle radial spotlight behind the golden shield -->
    <circle cx="${cx}" cy="${cy * 0.95}" r="${width * 0.42}" fill="url(#pwaSpotlight)" />
  `;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <defs>
    <!-- Background Dark Gradient (Industrial Heavy Deep Slate) -->
    <radialGradient id="pwaBgGrad" cx="50%" cy="40%" r="70%">
      <stop offset="0%" stop-color="#182235"/>
      <stop offset="60%" stop-color="#0b0f19"/>
      <stop offset="100%" stop-color="#05070c"/>
    </radialGradient>

    <!-- Radial Amber/Gold Glow behind shield -->
    <radialGradient id="pwaSpotlight" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#f59e0b" stop-opacity="0.18"/>
      <stop offset="50%" stop-color="#d97706" stop-opacity="0.06"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
    </radialGradient>

    <!-- Shield Interior Gradient -->
    <linearGradient id="shieldFill" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#24324a"/>
      <stop offset="40%" stop-color="#151e2e"/>
      <stop offset="100%" stop-color="#080c14"/>
    </linearGradient>

    <!-- South African Mining Gold / Amber Heavy Border -->
    <linearGradient id="goldBorder" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fef08a"/>
      <stop offset="25%" stop-color="#f59e0b"/>
      <stop offset="60%" stop-color="#d97706"/>
      <stop offset="100%" stop-color="#92400e"/>
    </linearGradient>

    <!-- High-Tech Cyan / ISO Precision Inner Rim -->
    <linearGradient id="cyanPrecisionRim" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8"/>
      <stop offset="50%" stop-color="#0284c7"/>
      <stop offset="100%" stop-color="#0369a1"/>
    </linearGradient>

    <!-- 2 Metallic Gold Gradient -->
    <linearGradient id="num2Gold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fef08a"/>
      <stop offset="40%" stop-color="#fbbf24"/>
      <stop offset="100%" stop-color="#d97706"/>
    </linearGradient>

    <!-- Drop Shadow Filter for Industrial Depth -->
    <filter id="shieldShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#000000" flood-opacity="0.65"/>
    </filter>
  </defs>

  ${bgRect}

  <g transform="translate(${translateX}, ${translateY}) scale(${matrixScale})" filter="url(#shieldShadow)">
    <!-- 1. Outer Wide Shield with Heavy Safety Gold Bevel -->
    <!-- Expanded width: x=6.5 to x=57.5 (width 51, was 44) -->
    <path 
      d="M32 4.5 
         L57.5 12.8 
         C57.5 32 46.5 49 32 60 
         C17.5 49 6.5 32 6.5 12.8 
         Z" 
      fill="url(#shieldFill)" 
      stroke="url(#goldBorder)" 
      stroke-width="3.4" 
      stroke-linejoin="round"
      stroke-linecap="round"
    />

    <!-- 2. High-Tech Cyan Precision Accent (Inner Rim) -->
    <path 
      d="M32 9.5 
         L52.5 16.2 
         C52.5 31.5 43.5 44.8 32 54 
         C20.5 44.8 11.5 31.5 11.5 16.2 
         Z" 
      fill="none" 
      stroke="url(#cyanPrecisionRim)" 
      stroke-width="1.3" 
      stroke-opacity="0.85"
    />

    <!-- 3. Bold Industrial "M" (White, widened, authoritative) -->
    <!-- Left stem: 16.5 to 20.8, right stem: 30.2 to 34.5, vertex: 25.5 -->
    <path 
      d="M16.5 41 
         L16.5 22 
         L21.2 22 
         L25.5 32 
         L29.8 22 
         L34.5 22 
         L34.5 41 
         L30.2 41 
         L30.2 28.5 
         L27 36 
         L24 36 
         L20.8 28.5 
         L20.8 41 
         Z" 
      fill="#ffffff"
    />

    <!-- 4. Bold Industrial "2" (Safety Amber/Gold, perfectly balanced) -->
    <path 
      d="M37.5 25.8
         C37.5 23.2 39.5 21.2 42.8 21.2
         C46 21.2 48 23.2 48 25.6
         C48 27.6 46.8 29.5 44 32
         L39.8 36
         L48.2 36
         L48.2 40.2
         L37.2 40.2
         L37.2 37.2
         L42.5 32.2
         C44.2 30.6 44.8 29.4 44.8 28.2
         C44.8 26.8 43.8 25.8 42.5 25.8
         C41.2 25.8 40.4 26.6 40.3 27.8
         Z" 
      fill="url(#num2Gold)"
    />

    <!-- 5. Bottom Statutory Seal / Mechanical Crosshair (Gold rivet) -->
    <circle cx="32" cy="46.8" r="3.2" fill="#f59e0b" stroke="#78350f" stroke-width="0.6"/>
    <path 
      d="M32 44.2 L32 49.4 M29.4 46.8 L34.6 46.8" 
      stroke="#0b0f19" 
      stroke-width="1.3" 
      stroke-linecap="round"
    />
  </g>
</svg>`;
}

async function main() {
  console.log('--- Generating MeloTwo PWA App Icons ---');

  // 1. Standalone SVG without background box (for <link rel="icon" type="image/svg+xml">)
  const standaloneSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none" width="100%" height="100%">
  <defs>
    <linearGradient id="m2ShieldBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#24324a"/>
      <stop offset="50%" stop-color="#151e2e"/>
      <stop offset="100%" stop-color="#080c14"/>
    </linearGradient>
    <linearGradient id="m2GoldBorder" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fef08a"/>
      <stop offset="25%" stop-color="#f59e0b"/>
      <stop offset="60%" stop-color="#d97706"/>
      <stop offset="100%" stop-color="#92400e"/>
    </linearGradient>
    <linearGradient id="m2CyanRim" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8"/>
      <stop offset="50%" stop-color="#0284c7"/>
      <stop offset="100%" stop-color="#0369a1"/>
    </linearGradient>
    <linearGradient id="m2Num2Gold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fef08a"/>
      <stop offset="40%" stop-color="#fbbf24"/>
      <stop offset="100%" stop-color="#d97706"/>
    </linearGradient>
  </defs>

  <path 
    d="M32 4.5 
       L57.5 12.8 
       C57.5 32 46.5 49 32 60 
       C17.5 49 6.5 32 6.5 12.8 
       Z" 
    fill="url(#m2ShieldBg)" 
    stroke="url(#m2GoldBorder)" 
    stroke-width="3.4" 
    stroke-linejoin="round"
    stroke-linecap="round"
  />

  <path 
    d="M32 9.5 
       L52.5 16.2 
       C52.5 31.5 43.5 44.8 32 54 
       C20.5 44.8 11.5 31.5 11.5 16.2 
       Z" 
    fill="none" 
    stroke="url(#m2CyanRim)" 
    stroke-width="1.3" 
    stroke-opacity="0.85"
  />

  <path 
    d="M16.5 41 
       L16.5 22 
       L21.2 22 
       L25.5 32 
       L29.8 22 
       L34.5 22 
       L34.5 41 
       L30.2 41 
       L30.2 28.5 
       L27 36 
       L24 36 
       L20.8 28.5 
       L20.8 41 
       Z" 
    fill="#ffffff"
  />

  <path 
    d="M37.5 25.8
       C37.5 23.2 39.5 21.2 42.8 21.2
       C46 21.2 48 23.2 48 25.6
       C48 27.6 46.8 29.5 44 32
       L39.8 36
       L48.2 36
       L48.2 40.2
       L37.2 40.2
       L37.2 37.2
       L42.5 32.2
       C44.2 30.6 44.8 29.4 44.8 28.2
       C44.8 26.8 43.8 25.8 42.5 25.8
       C41.2 25.8 40.4 26.6 40.3 27.8
       Z" 
    fill="url(#m2Num2Gold)"
  />

  <circle cx="32" cy="46.8" r="3.2" fill="#f59e0b" stroke="#78350f" stroke-width="0.6"/>
  <path 
    d="M32 44.2 L32 49.4 M29.4 46.8 L34.6 46.8" 
    stroke="#0b0f19" 
    stroke-width="1.3" 
    stroke-linecap="round"
  />
</svg>`;

  fs.writeFileSync('public/melotwo_shield_logo.svg', standaloneSvg);
  console.log('✓ Updated public/melotwo_shield_logo.svg with wider, balanced shield & typography');

  // 2. Full-bleed square icon SVG for PWA rasterization (standard and maskable)
  const icon512SvgStandard = getMeloTwoShieldSvg({ width: 512, height: 512, isFullBleedMaskable: false });
  const icon512SvgMaskable = getMeloTwoShieldSvg({ width: 512, height: 512, isFullBleedMaskable: true });
  const appleTouchSvg = getMeloTwoShieldSvg({ width: 180, height: 180, isFullBleedMaskable: false });

  // Generate PNGs using Sharp
  const targets = [
    { filename: 'icon-512.png', svg: icon512SvgStandard, size: 512 },
    { filename: 'icon-512-maskable.png', svg: icon512SvgMaskable, size: 512 },
    { filename: 'pwa-512x512.png', svg: icon512SvgStandard, size: 512 },
    { filename: 'pwa-maskable-512x512.png', svg: icon512SvgMaskable, size: 512 },
    { filename: 'pwa-icon-512.png', svg: icon512SvgStandard, size: 512 },
    { filename: 'icon-192.png', svg: icon512SvgStandard, size: 192 },
    { filename: 'icon-192-maskable.png', svg: icon512SvgMaskable, size: 192 },
    { filename: 'pwa-192x192.png', svg: icon512SvgStandard, size: 192 },
    { filename: 'pwa-icon.png', svg: icon512SvgStandard, size: 192 },
    { filename: 'apple-touch-icon.png', svg: appleTouchSvg, size: 180 },
    { filename: 'favicon-32x32.png', svg: standaloneSvg, size: 32 },
    { filename: 'favicon-16x16.png', svg: standaloneSvg, size: 16 },
    { filename: 'favicon.png', svg: standaloneSvg, size: 32 },
  ];

  for (const target of targets) {
    const outPath = path.join('public', target.filename);
    const buffer = Buffer.from(target.svg);
    await sharp(buffer)
      .resize(target.size, target.size)
      .png({ compressionLevel: 9 })
      .toFile(outPath);
    console.log(`✓ Generated public/${target.filename} (${target.size}x${target.size} PNG)`);
  }

  // Also create a 48x48 PNG for favicon.ico compatibility
  const fav48Buffer = await sharp(Buffer.from(standaloneSvg))
    .resize(48, 48)
    .png()
    .toBuffer();
  fs.writeFileSync('public/favicon.ico', fav48Buffer);
  console.log('✓ Generated public/favicon.ico');

  console.log('--- All icon assets generated successfully! ---');
}

main().catch(err => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
