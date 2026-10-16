const { chromium } = require('playwright-core');

const PROFILE_DIR = 'C:\\Users\\badiu\\.gemini\\antigravity\\scratch\\chrome_aistudio_profile_3';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

(async () => {
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
  await page.waitForTimeout(5000);

  // Close any error popup first
  const closeBtn = page.locator('button:has-text("Close"), ytcp-button:has-text("Close")').first();
  if (await closeBtn.isVisible({ timeout: 1500 }).catch(() => false)) {
    await closeBtn.click().catch(() => {});
    await page.waitForTimeout(1000);
  }

  // Click Delete video on Part 3
  const row3 = page.locator('ytcp-video-row:has-text("পৃথিবীর প্রথম চাঁদাবাজি")').first();
  if (await row3.isVisible().catch(() => false)) {
    const delBtn = row3.locator('button:has-text("Delete video"), ytcp-button:has-text("Delete video")').first();
    console.log('Clicking Delete video on Part 3...');
    await delBtn.click({ force: true });
    await page.waitForTimeout(2000);

    // Click label with text "I understand"
    console.log('Clicking text="I understand"...');
    const understandLabel = page.locator('text="I understand that deleting"').first();
    if (await understandLabel.isVisible({ timeout: 5000 }).catch(() => false)) {
      await understandLabel.click({ force: true });
      console.log('Clicked understand label!');
      await page.waitForTimeout(1000);

      // Click Delete forever
      const delForever = page.locator('button:has-text("Delete forever"), ytcp-button:has-text("Delete forever")').first();
      await delForever.click({ force: true });
      console.log('Clicked Delete forever!');
      await page.waitForTimeout(6000);
    }
  }

  // Click Cancel upload on Part 1
  const row1 = page.locator('ytcp-video-row:has-text("মানুষের প্রথম রাজা")').first();
  if (await row1.isVisible().catch(() => false)) {
    const cancelBtn = row1.locator('button:has-text("Cancel upload"), ytcp-button:has-text("Cancel upload")').first();
    if (await cancelBtn.isVisible().catch(() => false)) {
      console.log('Clicking Cancel upload on Part 1...');
      await cancelBtn.click({ force: true });
      await page.waitForTimeout(2000);
      const confirmCancel = page.locator('button:has-text("Cancel upload"), ytcp-button:has-text("Cancel upload"), button:has-text("CANCEL")').last();
      if (await confirmCancel.isVisible({ timeout: 3000 }).catch(() => false)) {
        await confirmCancel.click({ force: true });
        console.log('Confirmed cancel Part 1!');
        await page.waitForTimeout(4000);
      }
    }
  }

  await page.screenshot({ path: 'tools/after_text_click_cleanup.png' });
  console.log('Saved tools/after_text_click_cleanup.png');

  await ctx.close();
  process.exit(0);
})().catch(e => {
  console.error(e);
  process.exit(1);
});
