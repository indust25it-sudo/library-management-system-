import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const iconsDir = path.resolve(__dirname, '../frontend/icons');

if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// 1. Standard SVG Icon (Purpose: Any / Browser Tab)
const standardSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#7065ff" />
      <stop offset="100%" stop-color="#4f46e5" />
    </linearGradient>
    <linearGradient id="bookGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" />
      <stop offset="100%" stop-color="#f0f4ff" />
    </linearGradient>
    <linearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#38bdf8" />
      <stop offset="100%" stop-color="#818cf8" />
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="130%" filterUnits="userSpaceOnUse">
      <feDropShadow dx="0" dy="16" stdDeviation="20" flood-color="#1e1b4b" flood-opacity="0.35"/>
    </filter>
  </defs>

  <!-- Background Rounded Squircle -->
  <rect width="512" height="512" rx="112" fill="url(#bgGrad)" />

  <!-- Inner Soft Glow Ring -->
  <rect x="12" y="12" width="488" height="488" rx="100" fill="none" stroke="rgba(255,255,255,0.18)" stroke-width="4" />

  <g filter="url(#shadow)">
    <!-- Open Book Left Page -->
    <path d="M112 188 C 112 188, 170 170, 240 190 L 240 350 C 170 330, 112 346, 112 346 Z" 
          fill="url(#bookGrad)" />
    
    <!-- Open Book Right Page -->
    <path d="M400 188 C 400 188, 342 170, 272 190 L 272 350 C 342 330, 400 346, 400 346 Z" 
          fill="url(#bookGrad)" />

    <!-- Book Spine Center Fold -->
    <path d="M240 190 C 248 184, 264 184, 272 190 L 272 350 C 264 345, 248 345, 240 350 Z" 
          fill="#e0e7ff" />

    <!-- Decorative Text / Page Lines on Left Page -->
    <path d="M142 222 C 175 212, 210 220, 222 226" stroke="#94a3b8" stroke-width="6" stroke-linecap="round" fill="none" />
    <path d="M142 248 C 175 238, 210 246, 222 252" stroke="#cbd5e1" stroke-width="6" stroke-linecap="round" fill="none" />
    <path d="M142 274 C 175 264, 210 272, 222 278" stroke="#cbd5e1" stroke-width="6" stroke-linecap="round" fill="none" />

    <!-- Decorative Text / Page Lines on Right Page -->
    <path d="M370 222 C 337 212, 302 220, 290 226" stroke="#94a3b8" stroke-width="6" stroke-linecap="round" fill="none" />
    <path d="M370 248 C 337 238, 302 246, 290 252" stroke="#cbd5e1" stroke-width="6" stroke-linecap="round" fill="none" />
    <path d="M370 274 C 337 264, 302 272, 290 278" stroke="#cbd5e1" stroke-width="6" stroke-linecap="round" fill="none" />

    <!-- Bookmark Ribbon Ribbon Hanging Down -->
    <path d="M256 186 L 256 280 L 246 270 L 236 280 L 236 188 Z" fill="url(#accentGrad)" />

    <!-- Sparkle / Modern Star at Top Right -->
    <path d="M366 142 L 372 158 L 388 164 L 372 170 L 366 186 L 360 170 L 344 164 L 360 158 Z" fill="#38bdf8" />
  </g>

  <!-- Wordmark "LibraX" at bottom inside emblem -->
  <text x="256" y="420" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" 
        font-size="44" font-weight="800" letter-spacing="4" fill="#ffffff" text-anchor="middle">LIBRAX</text>
</svg>`;

// 2. Maskable SVG Icon (Safe zone compliant: 15-20% margin, full-bleed background)
const maskableSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bgGradM" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#635bff" />
      <stop offset="50%" stop-color="#4f46e5" />
      <stop offset="100%" stop-color="#3730a3" />
    </linearGradient>
    <linearGradient id="bookGradM" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" />
      <stop offset="100%" stop-color="#f8fafc" />
    </linearGradient>
    <linearGradient id="accentGradM" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#38bdf8" />
      <stop offset="100%" stop-color="#818cf8" />
    </linearGradient>
    <filter id="shadowM" x="-10%" y="-10%" width="120%" height="130%" filterUnits="userSpaceOnUse">
      <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#1e1b4b" flood-opacity="0.3"/>
    </filter>
  </defs>

  <!-- Full-bleed background rectangle (essential for maskable icons) -->
  <rect width="512" height="512" fill="url(#bgGradM)" />

  <!-- Center all icon graphics comfortably inside the 80% circle safe zone (radius 204px) -->
  <g transform="translate(256, 256) scale(0.78) translate(-256, -256)" filter="url(#shadowM)">
    <!-- Open Book Left Page -->
    <path d="M120 188 C 120 188, 174 170, 240 190 L 240 346 C 174 326, 120 342, 120 342 Z" 
          fill="url(#bookGradM)" />
    
    <!-- Open Book Right Page -->
    <path d="M392 188 C 392 188, 338 170, 272 190 L 272 346 C 338 326, 392 342, 392 342 Z" 
          fill="url(#bookGradM)" />

    <!-- Book Spine Center Fold -->
    <path d="M240 190 C 248 184, 264 184, 272 190 L 272 346 C 264 341, 248 341, 240 346 Z" 
          fill="#e2e8f0" />

    <!-- Lines Left Page -->
    <path d="M148 222 C 178 212, 210 220, 222 226" stroke="#94a3b8" stroke-width="6" stroke-linecap="round" fill="none" />
    <path d="M148 248 C 178 238, 210 246, 222 252" stroke="#cbd5e1" stroke-width="6" stroke-linecap="round" fill="none" />
    <path d="M148 274 C 178 264, 210 272, 222 278" stroke="#cbd5e1" stroke-width="6" stroke-linecap="round" fill="none" />

    <!-- Lines Right Page -->
    <path d="M364 222 C 334 212, 302 220, 290 226" stroke="#94a3b8" stroke-width="6" stroke-linecap="round" fill="none" />
    <path d="M364 248 C 334 238, 302 246, 290 252" stroke="#cbd5e1" stroke-width="6" stroke-linecap="round" fill="none" />
    <path d="M364 274 C 334 264, 302 272, 290 278" stroke="#cbd5e1" stroke-width="6" stroke-linecap="round" fill="none" />

    <!-- Bookmark Ribbon -->
    <path d="M256 186 L 256 280 L 246 270 L 236 280 L 236 188 Z" fill="url(#accentGradM)" />

    <!-- Modern Sparkle -->
    <path d="M366 142 L 372 158 L 388 164 L 372 170 L 366 186 L 360 170 L 344 164 L 360 158 Z" fill="#38bdf8" />

    <!-- Wordmark -->
    <text x="256" y="415" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" 
          font-size="44" font-weight="800" letter-spacing="4" fill="#ffffff" text-anchor="middle">LIBRAX</text>
  </g>
</svg>`;

async function generate() {
  console.log('Generating PWA icons...');

  // Save SVG
  fs.writeFileSync(path.join(iconsDir, 'icon.svg'), standardSvg, 'utf8');
  fs.writeFileSync(path.join(iconsDir, 'icon-maskable.svg'), maskableSvg, 'utf8');

  // Generate 512x512 standard
  await sharp(Buffer.from(standardSvg))
    .resize(512, 512)
    .png()
    .toFile(path.join(iconsDir, 'icon-512.png'));
  console.log('Generated icon-512.png');

  // Generate 192x192 standard
  await sharp(Buffer.from(standardSvg))
    .resize(192, 192)
    .png()
    .toFile(path.join(iconsDir, 'icon-192.png'));
  console.log('Generated icon-192.png');

  // Generate 512x512 maskable (with safe zone full bleed)
  await sharp(Buffer.from(maskableSvg))
    .resize(512, 512)
    .png()
    .toFile(path.join(iconsDir, 'icon-maskable-512.png'));
  console.log('Generated icon-maskable-512.png');

  // Generate 180x180 Apple Touch Icon (iOS Safari compliant PNG)
  await sharp(Buffer.from(standardSvg))
    .resize(180, 180)
    .png()
    .toFile(path.join(iconsDir, 'apple-touch-icon.png'));
  console.log('Generated apple-touch-icon.png');

  // Generate 32x32 and 64x64 favicon
  await sharp(Buffer.from(standardSvg))
    .resize(64, 64)
    .png()
    .toFile(path.join(iconsDir, 'favicon-64.png'));
  await sharp(Buffer.from(standardSvg))
    .resize(32, 32)
    .png()
    .toFile(path.join(iconsDir, 'favicon.png'));
  console.log('Generated favicons');

  console.log('All PWA icons generated successfully!');
}

generate().catch(err => {
  console.error(err);
  process.exit(1);
});
