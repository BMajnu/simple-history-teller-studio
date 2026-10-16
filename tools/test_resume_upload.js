const { chromium } = require('playwright-core');
const path = require('path');

const PROFILE_DIR = 'C:\\Users\\badiu\\.gemini\\antigravity\\scratch\\chrome_aistudio_profile_3';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ROOT = path.join(__dirname, '..');
const SHORTS_DIR = path.resolve(ROOT, 'projects', 'sample_first_king', 'renders', 'shorts_full');

(async () => {
  console.log('Testing Resume Upload on Part 1...');
  const ctx = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: false,
    executablePath: CHROME_PATH,
    args: [
      '--start-maximized',
      '--disable-blink-features=AutomationControlled'
    ],
    viewport: null
  });

  const page = ctx.pages()[0] || await ctx.newPage();
  await page.goto('https://studio.youtube.com/channel/UCOzERwa3GJqO00B8LMTPtDg/videos/short', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(5000);

  // Find row for Part 1: "মানুষের প্রথম রাজা"
  const part1Row = page.locator('ytcp-video-row:has-text("মানুষের প্রথম রাজা"), [role="row"]:has-text("মানুষের প্রথম রাজা")').first();
  console.log('Part 1 row visible:', await part1Row.isVisible({ timeout: 5000 }).catch(() => false));

  // Find "Resume upload" button in that row
  const resumeBtn = part1Row.locator('button:has-text("Resume upload"), ytcp-button:has-text("Resume upload"), button:has-text("আপলোড আবার শুরু করুন")').first();
  console.log('Resume button visible:', await resumeBtn.isVisible({ timeout: 3000 }).catch(() => false));

  if (await resumeBtn.isVisible()) {
    console.log('Clicking Resume upload and attaching short_bn_full1.mp4...');
    const [fileChooser] = await Promise.all([
      page.waitForEvent('filechooser', { timeout: 10000 }),
      resumeBtn.click()
    ]);
    const file1 = path.join(SHORTS_DIR, 'short_bn_full1.mp4');
    await fileChooser.setFiles(file1);
    console.log('File attached! Waiting 15s to observe upload progress...');
    await page.waitForTimeout(15000);
    await page.screenshot({ path: 'tools/resume_part1_progress.png' });
    console.log('Saved tools/resume_part1_progress.png');
  }

  await ctx.close();
  process.exit(0);
})().catch(e => {
  console.error(e);
  process.exit(1);
});
