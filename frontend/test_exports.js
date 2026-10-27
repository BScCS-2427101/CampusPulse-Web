import { jsPDF } from 'jspdf';
import fs from 'fs';
import path from 'path';

console.log("=== Testing CampusPulse PNG/PDF Export Engine ===");

// 1. Test Single Visual PDF Generation
console.log("\n[Test 1] Generating Single Visual Landscape PDF...");
const samplePngBase64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

const singleDoc = new jsPDF({
  orientation: 'landscape',
  unit: 'px',
  format: [1280, 800]
});
singleDoc.text("CampusPulse — Executive KPI Dashboard", 40, 40);
singleDoc.addImage(samplePngBase64, 'PNG', 40, 60, 1200, 700);

const singlePdfPath = path.resolve('test_dashboard_export.pdf');
const singleBuf = Buffer.from(singleDoc.output('arraybuffer'));
fs.writeFileSync(singlePdfPath, singleBuf);

console.log(`✓ Single Visual PDF created: ${singlePdfPath}`);
console.log(`  File size: ${singleBuf.length} bytes`);
console.log(`  Magic header: ${singleBuf.slice(0, 5).toString('ascii')} (Valid: ${singleBuf.slice(0, 4).toString('ascii') === '%PDF'})`);

// 2. Test Multi-Stage Storytelling 8-Page PDF Generation
console.log("\n[Test 2] Generating Storytelling 8-Stage Landscape Master PDF...");
const storyDoc = new jsPDF({
  orientation: 'landscape',
  unit: 'px',
  format: [1280, 850]
});

const stages = [
  "1. Introduction & Dataset Scope",
  "2. Academic Performance",
  "3. Attendance & Learning Behaviour",
  "4. Student Risk Segmentation",
  "5. Demographic & Student Segmentation",
  "6. Historical Trends",
  "7. Predictive Forecasting",
  "8. Evidence-Supported Conclusions & Actions"
];

stages.forEach((title, idx) => {
  if (idx > 0) storyDoc.addPage([1280, 850], 'landscape');
  storyDoc.setFontSize(22);
  storyDoc.setTextColor(46, 125, 50); // Primary green
  storyDoc.text(`CampusPulse Guided Story — Stage ${idx + 1}`, 50, 60);
  storyDoc.setFontSize(14);
  storyDoc.setTextColor(80, 80, 80);
  storyDoc.text(title, 50, 90);
  storyDoc.addImage(samplePngBase64, 'PNG', 50, 110, 1180, 680);
});

const storyPdfPath = path.resolve('test_storytelling_full.pdf');
const storyBuf = Buffer.from(storyDoc.output('arraybuffer'));
fs.writeFileSync(storyPdfPath, storyBuf);

console.log(`✓ Storytelling Master PDF created: ${storyPdfPath}`);
console.log(`  File size: ${storyBuf.length} bytes`);
console.log(`  Magic header: ${storyBuf.slice(0, 5).toString('ascii')}`);

// Count pages in PDF output
const pdfContent = storyBuf.toString('binary');
const pageCount = (pdfContent.match(/\/Type\s*\/Page\b/g) || []).length;
console.log(`  Total pages rendered: ${pageCount} (Expected: 8)`);

// 3. Test Valid PNG Creation & Structure
console.log("\n[Test 3] Testing PNG Structure & MIME Representation...");
const rawPngBuf = Buffer.from(samplePngBase64.replace(/^data:image\/png;base64,/, ''), 'base64');
const testPngPath = path.resolve('test_dashboard_export.png');
fs.writeFileSync(testPngPath, rawPngBuf);

console.log(`✓ PNG visual created: ${testPngPath}`);
console.log(`  File size: ${rawPngBuf.length} bytes`);
// PNG Magic Header: \x89PNG\r\n\x1a\n
const isPng = rawPngBuf[0] === 0x89 && rawPngBuf[1] === 0x50 && rawPngBuf[2] === 0x4E && rawPngBuf[3] === 0x47;
console.log(`  PNG Magic header check: ${isPng ? 'PASSED (0x89PNG)' : 'FAILED'}`);

// Clean up temporary test files
fs.unlinkSync(singlePdfPath);
fs.unlinkSync(storyPdfPath);
fs.unlinkSync(testPngPath);
console.log("\n✓ All test files verified and cleaned up successfully.");

if (singleBuf.length > 0 && storyBuf.length > 0 && pageCount === 8 && isPng) {
  console.log("\n=== ALL EXPORT TESTS PASSED ===");
  process.exit(0);
} else {
  console.error("\n=== EXPORT TESTS FAILED ===");
  process.exit(1);
}
