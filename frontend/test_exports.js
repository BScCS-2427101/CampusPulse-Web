import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

console.log("================================================================================");
console.log("   CAMPUSPULSE COMPREHENSIVE PNG & PDF EXPORT VERIFICATION TEST SUITE           ");
console.log("================================================================================");

const APP_URL = process.env.TEST_APP_URL || 'http://127.0.0.1:5173';
const DOWNLOAD_DIR = path.resolve('./downloads_verification');

if (fs.existsSync(DOWNLOAD_DIR)) {
  fs.rmSync(DOWNLOAD_DIR, { recursive: true, force: true });
}
fs.mkdirSync(DOWNLOAD_DIR, { recursive: true });

// Chrome executable candidates for Windows
const CHROME_PATHS = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  process.env.CHROME_BIN
].filter(Boolean);

let chromePath = CHROME_PATHS.find(p => fs.existsSync(p));
if (!chromePath) {
  console.error("❌ Google Chrome binary not found. Please ensure Chrome is installed.");
  process.exit(1);
}

// Pixel verification algorithm to guarantee canvas is not blank
function verifyPixels(data, width, height) {
  const r0 = data[0], g0 = data[1], b0 = data[2];
  let nonBgPixels = 0;
  for (let i = 0; i < data.length; i += 32) {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    if (Math.abs(r - r0) > 15 || Math.abs(g - g0) > 15 || Math.abs(b - b0) > 15) {
      nonBgPixels++;
    }
  }
  return {
    sampledPoints: data.length / 32,
    nonBgPixels,
    isNonBlank: nonBgPixels > 250
  };
}

(async () => {
  console.log(`\n[Environment] Target URL: ${APP_URL}`);
  console.log(`[Environment] Chrome Path: ${chromePath}`);
  console.log(`[Environment] Downloads Dir: ${DOWNLOAD_DIR}`);

  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1400,1050']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 1050 });

  page.on('console', msg => {
    const txt = msg.text();
    if (txt.includes('Export') || txt.includes('error') || txt.includes('Error')) {
      console.log('  [Console]:', txt);
    }
  });

  page.on('pageerror', err => {
    console.error('  [PageError]:', err.message);
  });

  // Setup download intercept via CDP
  const client = await page.target().createCDPSession();
  await client.send('Page.setDownloadBehavior', {
    behavior: 'allow',
    downloadPath: DOWNLOAD_DIR
  });

  console.log(`\nNavigating to ${APP_URL}/exports...`);
  await page.goto(`${APP_URL}/exports`, { waitUntil: 'networkidle2', timeout: 35000 });
  await new Promise(r => setTimeout(r, 2000));

  // Helper to wait for download
  const waitForDownload = async (pattern, extension, timeoutMs = 40000) => {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      const files = fs.readdirSync(DOWNLOAD_DIR).filter(f => !f.endsWith('.crdownload') && !f.endsWith('.tmp'));
      const match = files.find(f => f.includes(pattern) && (!extension || f.endsWith(extension)));
      if (match) {
        const fullPath = path.join(DOWNLOAD_DIR, match);
        const stats = fs.statSync(fullPath);
        if (stats.size > 2000) {
          return { filename: match, fullPath, size: stats.size };
        }
      }
      await new Promise(r => setTimeout(r, 400));
    }
    throw new Error(`Timeout waiting for file pattern: "${pattern}" (ext: ${extension})`);
  };

  // Helper to visually decode PNG in headless browser and sample pixels
  const decodeAndVerifyPng = async (pngPath) => {
    const fileUrl = 'file://' + pngPath.replace(/\\/g, '/');
    const inspectPage = await browser.newPage();
    await inspectPage.goto(fileUrl);
    const metrics = await inspectPage.evaluate(() => {
      const img = document.querySelector('img');
      if (!img) return null;
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;
      
      const r0 = data[0], g0 = data[1], b0 = data[2];
      let nonBgPixels = 0;
      for (let i = 0; i < data.length; i += 32) {
        const r = data[i], g = data[i + 1], b = data[i + 2];
        if (Math.abs(r - r0) > 15 || Math.abs(g - g0) > 15 || Math.abs(b - b0) > 15) {
          nonBgPixels++;
        }
      }
      return {
        width: img.naturalWidth,
        height: img.naturalHeight,
        nonBgPixels,
        totalSampled: data.length / 32
      };
    });
    await inspectPage.close();
    return metrics;
  };

  const results = [];

  // =========================================================================
  // 1. Dashboard PNG
  // =========================================================================
  console.log("\n--------------------------------------------------");
  console.log("TEST 1: Dashboard PNG Visual Export");
  console.log("--------------------------------------------------");
  const dashBtn = await page.evaluateHandle(() => {
    return Array.from(document.querySelectorAll('button')).find(b => b.innerText.trim() === 'PNG Image');
  });
  if (!dashBtn) throw new Error("Dashboard 'PNG Image' button not found");
  await dashBtn.click();

  const dashPng = await waitForDownload('Dashboard', '.png');
  console.log(`  Downloaded: ${dashPng.filename} (${dashPng.size.toLocaleString()} bytes)`);

  const dashBuf = fs.readFileSync(dashPng.fullPath);
  const isDashPngHeader = dashBuf[0] === 0x89 && dashBuf[1] === 0x50 && dashBuf[2] === 0x4E && dashBuf[3] === 0x47;
  const dashVisual = await decodeAndVerifyPng(dashPng.fullPath);
  console.log(`  Header 0x89PNG: ${isDashPngHeader ? 'VALID' : 'INVALID'}`);
  console.log(`  Dimensions: ${dashVisual.width}x${dashVisual.height}px`);
  console.log(`  Non-background pixels: ${dashVisual.nonBgPixels} / ${dashVisual.totalSampled}`);
  
  if (!isDashPngHeader || dashVisual.width === 0 || dashVisual.nonBgPixels < 500) {
    throw new Error("Dashboard PNG is blank or invalid!");
  }
  results.push({ name: 'Dashboard PNG', size: dashPng.size, width: dashVisual.width, height: dashVisual.height, nonBlankPixels: dashVisual.nonBgPixels, status: 'PASSED' });

  // =========================================================================
  // 2. Practical 13 PNG
  // =========================================================================
  console.log("\n--------------------------------------------------");
  console.log("TEST 2: Practical 13 (Academic Performance) PNG Export");
  console.log("--------------------------------------------------");
  await new Promise(r => setTimeout(r, 1000));
  const p13Btn = await page.evaluateHandle(() => {
    const card = Array.from(document.querySelectorAll('.card')).find(c => c.innerText.includes('Practical 13'));
    return card ? Array.from(card.querySelectorAll('button')).find(b => b.innerText.trim() === 'PNG') : null;
  });
  if (!p13Btn) throw new Error("Practical 13 PNG button not found");
  await p13Btn.click();

  const p13Png = await waitForDownload('Practical13', '.png');
  console.log(`  Downloaded: ${p13Png.filename} (${p13Png.size.toLocaleString()} bytes)`);
  const p13Visual = await decodeAndVerifyPng(p13Png.fullPath);
  console.log(`  Dimensions: ${p13Visual.width}x${p13Visual.height}px`);
  console.log(`  Non-background pixels: ${p13Visual.nonBgPixels} / ${p13Visual.totalSampled}`);

  if (p13Visual.width === 0 || p13Visual.nonBgPixels < 500) {
    throw new Error("Practical 13 PNG is blank or invalid!");
  }
  results.push({ name: 'Practical 13 PNG', size: p13Png.size, width: p13Visual.width, height: p13Visual.height, nonBlankPixels: p13Visual.nonBgPixels, status: 'PASSED' });

  // =========================================================================
  // 3. Storytelling Stage 1 PNG
  // =========================================================================
  console.log("\n--------------------------------------------------");
  console.log("TEST 3: Storytelling Stage 1 PNG Export");
  console.log("--------------------------------------------------");
  await new Promise(r => setTimeout(r, 1000));
  const stage1PngBtn = await page.evaluateHandle(() => {
    return Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Export Stage PNG'));
  });
  if (!stage1PngBtn) throw new Error("Storytelling Export Stage PNG button not found");
  await stage1PngBtn.click();

  const s1Png = await waitForDownload('Storytelling_Stage1', '.png');
  console.log(`  Downloaded: ${s1Png.filename} (${s1Png.size.toLocaleString()} bytes)`);
  const s1Visual = await decodeAndVerifyPng(s1Png.fullPath);
  console.log(`  Dimensions: ${s1Visual.width}x${s1Visual.height}px`);
  console.log(`  Non-background pixels: ${s1Visual.nonBgPixels} / ${s1Visual.totalSampled}`);

  if (s1Visual.width === 0 || s1Visual.nonBgPixels < 500) {
    throw new Error("Storytelling Stage 1 PNG is blank!");
  }
  results.push({ name: 'Storytelling Stage 1 PNG', size: s1Png.size, width: s1Visual.width, height: s1Visual.height, nonBlankPixels: s1Visual.nonBgPixels, status: 'PASSED' });

  // =========================================================================
  // 4. Storytelling Stage 1 PDF
  // =========================================================================
  console.log("\n--------------------------------------------------");
  console.log("TEST 4: Storytelling Stage 1 PDF Export");
  console.log("--------------------------------------------------");
  await new Promise(r => setTimeout(r, 1000));
  const stage1PdfBtn = await page.evaluateHandle(() => {
    return Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Export Stage PDF'));
  });
  if (!stage1PdfBtn) throw new Error("Storytelling Export Stage PDF button not found");
  await stage1PdfBtn.click();

  const s1Pdf = await waitForDownload('Storytelling_Stage1', '.pdf');
  console.log(`  Downloaded: ${s1Pdf.filename} (${s1Pdf.size.toLocaleString()} bytes)`);
  const s1PdfBuf = fs.readFileSync(s1Pdf.fullPath);
  const isS1PdfValid = s1PdfBuf.slice(0, 4).toString('ascii') === '%PDF';
  const s1PdfContent = s1PdfBuf.toString('binary');
  const s1PdfPages = (s1PdfContent.match(/\/Type\s*\/Page\b/g) || []).length;
  console.log(`  PDF Magic Header %PDF: ${isS1PdfValid ? 'VALID' : 'INVALID'}`);
  console.log(`  PDF Page Count: ${s1PdfPages} (Expected: 1)`);

  if (!isS1PdfValid || s1PdfPages !== 1 || s1Pdf.size < 50000) {
    throw new Error("Storytelling Stage 1 PDF is empty or invalid!");
  }
  results.push({ name: 'Storytelling Stage 1 PDF', size: s1Pdf.size, width: 1280, height: 800, nonBlankPixels: 'PDF Stream (>50KB)', status: 'PASSED' });

  // =========================================================================
  // 5. Data Quality PDF
  // =========================================================================
  console.log("\n--------------------------------------------------");
  console.log("TEST 5: Data Quality Audit PDF Export");
  console.log("--------------------------------------------------");
  await new Promise(r => setTimeout(r, 1000));
  const dqPdfBtn = await page.evaluateHandle(() => {
    const card = Array.from(document.querySelectorAll('.card')).find(c => c.innerText.includes('Data Quality'));
    return card ? Array.from(card.querySelectorAll('button')).find(b => b.innerText.trim() === 'PDF') : null;
  });
  if (!dqPdfBtn) throw new Error("Data Quality PDF button not found");
  await dqPdfBtn.click();

  const dqPdf = await waitForDownload('DataQuality', '.pdf');
  console.log(`  Downloaded: ${dqPdf.filename} (${dqPdf.size.toLocaleString()} bytes)`);
  const dqPdfBuf = fs.readFileSync(dqPdf.fullPath);
  const isDqPdfValid = dqPdfBuf.slice(0, 4).toString('ascii') === '%PDF';
  console.log(`  PDF Magic Header %PDF: ${isDqPdfValid ? 'VALID' : 'INVALID'}`);

  if (!isDqPdfValid || dqPdf.size < 50000) {
    throw new Error("Data Quality PDF is empty or invalid!");
  }
  results.push({ name: 'Data Quality PDF', size: dqPdf.size, width: 1280, height: 'Auto', nonBlankPixels: 'PDF Stream (>50KB)', status: 'PASSED' });

  // =========================================================================
  // 6. Full 8-Stage Storytelling Master PDF
  // =========================================================================
  console.log("\n--------------------------------------------------");
  console.log("TEST 6: Full Storytelling Master PDF (All 8 Stages)");
  console.log("--------------------------------------------------");
  await new Promise(r => setTimeout(r, 1000));
  const fullStoryBtn = await page.evaluateHandle(() => {
    return Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Full Story PDF (All 8 Stages)'));
  });
  if (!fullStoryBtn) throw new Error("Full Story PDF button not found");
  await fullStoryBtn.click();

  console.log("  Iterating through stages 1 to 8 deterministically...");
  const masterPdf = await waitForDownload('Storytelling_Full_8_Stages', '.pdf', 60000);
  console.log(`  Downloaded Master PDF: ${masterPdf.filename} (${masterPdf.size.toLocaleString()} bytes)`);

  const masterBuf = fs.readFileSync(masterPdf.fullPath);
  const isMasterPdf = masterBuf.slice(0, 4).toString('ascii') === '%PDF';
  const masterContent = masterBuf.toString('binary');
  const masterPages = (masterContent.match(/\/Type\s*\/Page\b/g) || []).length;
  console.log(`  PDF Header %PDF: ${isMasterPdf ? 'VALID' : 'INVALID'}`);
  console.log(`  Total Pages Counted: ${masterPages} (Expected: 8)`);

  if (!isMasterPdf || masterPages !== 8 || masterPdf.size < 500000) {
    throw new Error(`Master 8-Stage PDF failed requirements! Pages: ${masterPages}, Size: ${masterPdf.size}`);
  }
  results.push({ name: 'Storytelling 8-Stage PDF', size: masterPdf.size, width: 1280, height: 850, nonBlankPixels: '8 Distinct Pages', status: 'PASSED' });

  // =========================================================================
  // Print Summary Table
  // =========================================================================
  console.log("\n================================================================================");
  console.log("                    EXPORT VERIFICATION RESULTS SUMMARY                         ");
  console.log("================================================================================");
  console.table(results);
  console.log("\n✅ ALL EXPORT VISUAL INTEGRITY TESTS PASSED SUCCESSFULLY!");
  console.log("================================================================================\n");

  await browser.close();
  process.exit(0);
})().catch(err => {
  console.error("\n❌ TEST SUITE FAILED WITH ERROR:", err);
  process.exit(1);
});
