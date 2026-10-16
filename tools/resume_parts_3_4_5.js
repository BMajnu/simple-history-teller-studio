const { chromium } = require('playwright-core');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SHORTS_DIR = path.resolve(ROOT, 'projects', 'sample_first_king', 'renders', 'shorts_full');

const pendingShorts = [
  { match: 'পৃথিবীর প্রথম চাঁদাবাজি', file: path.join(SHORTS_DIR, 'short_bn_full3.mp4'), part: 3 },
  { match: 'সুমেরীয় সম্রাট', file: path.join(SHORTS_DIR, 'short_bn_full4.mp4'), part: 4 },
  { match: 'রাজার পতন', file: path.join(SHORTS_DIR, 'short_bn_full5.mp4'), part: 5 }
];

(async () => {
  console.log('Connecting via CDP to trigger resume on Parts 3, 4, 5...');
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const page = await ctx.newPage();

  await page.goto('https://studio.youtube.com/channel/UCOzERwa3GJqO00B8LMTPtDg/videos/short', {
    waitUntil: 'domcontentloaded',
    timeout: 30000
  });
  await page.waitForTimeout(4000);

  for (const item of pendingShorts) {
    console.log(`Checking row for Part ${item.part}: ${item.match}...`);
    const row = page.locator(`ytcp-video-row:has-text("${item.match}"), [role="row"]:has-text("${item.match}")`).first();
    if (await row.isVisible({ timeout: 4000 }).catch(() => false)) {
      const resumeBtn = row.locator('button:has-text("Resume upload"), ytcp-button:has-text("Resume upload")').first();
      if (await resumeBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        console.log(`Clicking Resume upload for Part ${item.part}...`);
        const [fileChooser] = await Promise.all([
          page.waitForEvent('filechooser', { timeout: 8000 }),
          resumeBtn.click()
        ]);
        await fileChooser.setFiles(item.file);
        console.log(`Attached ${path.basename(item.file)}! Part ${item.part} resumed!`);
        await page.waitForTimeout(4000);
      } else {
        console.log(`Part ${item.part} does not have Resume button (status might already be uploading).`);
      }
    }
  }

  await page.screenshot({ path: path.resolve(ROOT, 'tools', 'resumed_parts_3_4_5.png') });
  console.log('Saved tools/resumed_parts_3_4_5.png');
  // Keep tab open to allow background upload stream
  process.exit(0);
})().catch(e => {
  console.error('Error:', e);
  process.exit(1);
});
