const { chromium } = require('playwright-core');
const path = require('path');

const PROFILE_DIR = 'C:\\Users\\badiu\\.gemini\\antigravity\\scratch\\chrome_aistudio_profile_3';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ROOT = path.join(__dirname, '..');
const SHORTS_DIR = path.resolve(ROOT, 'projects', 'sample_first_king', 'renders', 'shorts_full');

async function resumeOneShort(page, partNum, titleSnippet, fileName) {
  console.log(`\n======================================================`);
  console.log(`RESUMING PART ${partNum}: ${titleSnippet}`);
  console.log(`======================================================`);

  await page.goto('https://studio.youtube.com/channel/UCOzERwa3GJqO00B8LMTPtDg/videos/short', {
    waitUntil: 'domcontentloaded',
    timeout: 30000
  });
  await page.waitForTimeout(5000);

  const row = page.locator(`ytcp-video-row:has-text("${titleSnippet}"), [role="row"]:has-text("${titleSnippet}")`).first();
  if (!await row.isVisible({ timeout: 5000 }).catch(() => false)) {
    console.log(`Row for ${titleSnippet} not found!`);
    return;
  }

  const resumeBtn = row.locator('button:has-text("Resume upload"), ytcp-button:has-text("Resume upload")').first();
  if (await resumeBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    console.log(`Clicking Resume upload for Part ${partNum}...`);
    const [fileChooser] = await Promise.all([
      page.waitForEvent('filechooser', { timeout: 10000 }),
      resumeBtn.click()
    ]);
    const filePath = path.join(SHORTS_DIR, fileName);
    await fileChooser.setFiles(filePath);
    console.log(`Attached ${fileName}! Monitoring upload...`);

    let done = false;
    let ticks = 0;
    while (!done && ticks < 30) { // Up to 5 minutes
      ticks++;
      await page.waitForTimeout(10000);
      const text = await page.innerText('body').catch(() => '');
      const uploading = text.includes('Uploading') || text.includes('uploading');
      console.log(`[Part ${partNum} Tick ${ticks}] Uploading: ${uploading}`);

      if (!uploading && ticks > 2) {
        console.log(`Part ${partNum} upload stream finished!`);
        done = true;
        break;
      }
    }
  } else {
    console.log(`Part ${partNum} does not have Resume button.`);
  }
}

(async () => {
  const ctx = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: false,
    executablePath: CHROME_PATH,
    args: ['--start-maximized', '--disable-blink-features=AutomationControlled'],
    viewport: null
  });

  const page = ctx.pages()[0] || await ctx.newPage();

  // Resume Part 4
  await resumeOneShort(page, 4, 'সুমেরীয় সম্রাট', 'short_bn_full4.mp4');

  // Resume Part 5
  await resumeOneShort(page, 5, 'রাজার পতন', 'short_bn_full5.mp4');

  // Check Part 1 status
  console.log('\nChecking Part 1 status...');
  await page.goto('https://studio.youtube.com/channel/UCOzERwa3GJqO00B8LMTPtDg/videos/short', {
    waitUntil: 'domcontentloaded',
    timeout: 30000
  });
  await page.waitForTimeout(6000);

  const part1Row = page.locator('ytcp-video-row:has-text("মানুষের প্রথম রাজা")').first();
  const part1Text = await part1Row.innerText().catch(() => '');
  console.log('Part 1 Row text:\n', part1Text);

  if (part1Text.includes('Upload interrupted')) {
    console.log('Resuming Part 1...');
    const resumeBtn1 = part1Row.locator('button:has-text("Resume upload")').first();
    const [fileChooser] = await Promise.all([
      page.waitForEvent('filechooser', { timeout: 10000 }),
      resumeBtn1.click()
    ]);
    await fileChooser.setFiles(path.join(SHORTS_DIR, 'short_bn_full1.mp4'));
    await page.waitForTimeout(15000);
  }

  // Final Overview
  await page.goto('https://studio.youtube.com/channel/UCOzERwa3GJqO00B8LMTPtDg/videos/short', {
    waitUntil: 'domcontentloaded',
    timeout: 30000
  });
  await page.waitForTimeout(6000);
  await page.screenshot({ path: path.resolve(ROOT, 'tools', 'shorts_overview_after_resume_all.png') });
  console.log('Saved tools/shorts_overview_after_resume_all.png');

  await ctx.close();
  process.exit(0);
})().catch(e => {
  console.error(e);
  process.exit(1);
});
