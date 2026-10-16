const { chromium } = require('playwright-core');
const path = require('path');

const PROFILE_DIR = 'C:\\Users\\badiu\\.gemini\\antigravity\\scratch\\chrome_aistudio_profile_3';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ROOT = path.join(__dirname, '..');
const SHORTS_DIR = path.resolve(ROOT, 'projects', 'sample_first_king', 'renders', 'shorts_full');

async function resumeAndFinishShort(partNum, titleSnippet, fileName) {
  console.log(`\n======================================================`);
  console.log(`RESUMING & COMPLETING PART ${partNum}: ${titleSnippet}`);
  console.log(`======================================================`);

  const ctx = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: false,
    executablePath: CHROME_PATH,
    args: ['--start-maximized', '--disable-blink-features=AutomationControlled'],
    viewport: null
  });

  const page = ctx.pages()[0] || await ctx.newPage();
  await page.goto('https://studio.youtube.com/channel/UCOzERwa3GJqO00B8LMTPtDg/videos/short', {
    waitUntil: 'domcontentloaded',
    timeout: 30000
  });
  await page.waitForTimeout(6000);

  const row = page.locator(`ytcp-video-row:has-text("${titleSnippet}"), [role="row"]:has-text("${titleSnippet}")`).first();
  if (!await row.isVisible({ timeout: 5000 }).catch(() => false)) {
    console.log(`Row for ${titleSnippet} not found!`);
    await ctx.close();
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

    // Stay on page and monitor upload until complete
    let done = false;
    let ticks = 0;
    while (!done && ticks < 40) { // Up to 5-7 minutes
      ticks++;
      await page.waitForTimeout(10000);
      const text = await page.innerText('body').catch(() => '');
      const uploading = text.includes('Uploading') || text.includes('uploading');
      const processing = text.includes('Checks') || text.includes('Processing');
      console.log(`[Part ${partNum} Tick ${ticks}] Uploading: ${uploading}, Processing: ${processing}`);

      if (!uploading && ticks > 2) {
        console.log(`Part ${partNum} upload stream finished!`);
        done = true;
        break;
      }
    }
  } else {
    console.log(`Part ${partNum} does not have Resume upload button.`);
  }

  // If on edit page or from list, navigate to video edit page
  console.log(`Navigating to edit page of Part ${partNum}...`);
  await page.goto('https://studio.youtube.com/channel/UCOzERwa3GJqO00B8LMTPtDg/videos/short', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(4000);
  const updatedRow = page.locator(`ytcp-video-row:has-text("${titleSnippet}"), [role="row"]:has-text("${titleSnippet}")`).first();
  const editLink = updatedRow.locator('a#video-title, a[href*="/edit"]').first();
  if (await editLink.isVisible({ timeout: 3000 }).catch(() => false)) {
    await editLink.click({ force: true });
    await page.waitForTimeout(5000);

    // Scroll to thumbnail
    await page.evaluate(() => {
      const m = document.querySelector('main#main');
      if (m) m.scrollTop = 450;
    });
    await page.waitForTimeout(1500);

    // Check auto thumbnails
    const autoThumbs = page.locator('ytcp-thumbnail-button, [aria-label*="Auto-generated thumbnail"], ytcp-thumbnails-compact button');
    const count = await autoThumbs.count();
    console.log(`Auto thumbnail count on edit page: ${count}`);
    if (count > 0) {
      const pick = count > 1 ? autoThumbs.nth(1) : autoThumbs.first();
      await pick.click({ force: true });
      console.log('Selected action frame thumbnail!');
      await page.waitForTimeout(1000);
    }

    // Save
    const saveBtn = page.locator('#save-button, ytcp-button#save-button, button:has-text("Save"), button:has-text("সংরক্ষণ করুন")').first();
    if (await saveBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      const disabled = await saveBtn.getAttribute('aria-disabled');
      if (disabled !== 'true') {
        await saveBtn.click({ force: true });
        console.log('Saved changes!');
        await page.waitForTimeout(3000);
      }
    }
  }

  await page.screenshot({ path: path.resolve(ROOT, 'tools', `part${partNum}_completed.png`) });
  await ctx.close();
}

(async () => {
  // Let's resume Part 3 first
  await resumeAndFinishShort(3, 'পৃথিবীর প্রথম চাঁদাবাজি', 'short_bn_full3.mp4');
  process.exit(0);
})().catch(e => {
  console.error(e);
  process.exit(1);
});
