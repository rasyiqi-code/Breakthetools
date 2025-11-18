/**
 * Script untuk generate semua file favicon dari SVG
 * 
 * Usage:
 *   cd apps/web
 *   bun scripts/generate-favicons.js
 * 
 * Atau install sharp terlebih dahulu:
 *   bun add -d sharp
 */

const fs = require('fs');
const path = require('path');

// Check if sharp is available
let sharp;
try {
  sharp = require('sharp');
} catch (e) {
  console.error('❌ Sharp tidak terinstall. Install dengan: bun add -d sharp');
  console.log('\n📝 Atau gunakan opsi lain:');
  console.log('   1. Buka generate-favicons.html di browser');
  console.log('   2. Atau gunakan https://realfavicongenerator.net/');
  process.exit(1);
}

const publicDir = path.join(__dirname, '../public');
const svgPath = path.join(publicDir, 'favicon.svg');

// Check if SVG exists
if (!fs.existsSync(svgPath)) {
  console.error(`❌ File ${svgPath} tidak ditemukan!`);
  process.exit(1);
}

// Sizes to generate
const sizes = [
  { size: 16, name: 'icon-16x16.png' },
  { size: 32, name: 'icon-32x32.png' },
  { size: 180, name: 'apple-touch-icon.png' },
  { size: 192, name: 'icon-192x192.png' },
  { size: 512, name: 'icon-512x512.png' },
];

async function generateFavicons() {
  console.log('🚀 Generating favicons from SVG...\n');

  try {
    // Read SVG
    const svgBuffer = fs.readFileSync(svgPath);
    
    // Generate each size
    for (const { size, name } of sizes) {
      const outputPath = path.join(publicDir, name);
      
      await sharp(svgBuffer)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        .png()
        .toFile(outputPath);
      
      console.log(`✅ Generated: ${name} (${size}x${size}px)`);
    }

    // Generate favicon.ico (using 32x32)
    const favicon32Path = path.join(publicDir, 'icon-32x32.png');
    const faviconIcoPath = path.join(publicDir, 'favicon.ico');
    
    // Copy 32x32 as favicon.ico (browsers will accept PNG as ICO)
    // For true ICO format, use online converter
    fs.copyFileSync(favicon32Path, faviconIcoPath);
    console.log(`✅ Generated: favicon.ico (from 32x32px)`);
    
    console.log('\n✨ Semua favicon berhasil di-generate!');
    console.log('\n📝 Catatan:');
    console.log('   - Untuk favicon.ico format asli, convert icon-32x32.png menggunakan:');
    console.log('     https://convertio.co/png-ico/');
    console.log('   - Hard refresh browser (Ctrl+Shift+R) untuk melihat favicon baru');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

generateFavicons();

