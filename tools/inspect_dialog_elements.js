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

  const row3 = page.locator('ytcp-video-row:has-text("পৃথিবীর প্রথম চাঁদাবাজি")').first();
  const delBtn = row3.locator('button:has-text("Delete video"), ytcp-button:has-text("Delete video")').first();
  await delBtn.click({ force: true });
  await page.waitForTimeout(3000);

  // Print all elements inside dialog
  const dialogInfo = await page.evaluate(() => {
    const d = document.querySelector('ytcp-confirmation-dialog, ytcp-dialog, [role="dialog"]');
    if (!d) return 'No dialog found';
    return {
      tagName: d.tagName,
      id: d.id,
      className: d.className,
      inputs: Array.from(d.querySelectorAll('input, ytcp-checkbox-lit, tp-yt-paper-checkbox, [role="checkbox"]')).map(i => ({
        tagName: i.tagName,
        id: i.id,
        className: i.className,
        type: i.type,
        role: i.getAttribute('role')
      })),
      buttons: Array.from(d.querySelectorAll('button, ytcp-button')).map(b => ({
        tagName: b.tagName,
        id: b.id,
        className: b.className,
        innerText: b.innerText
      }))
    };
  });

  console.log('Dialog Info:\n', JSON.stringify(dialogInfo, null, 2));

  await ctx.close();
  process.exit(0);
})().catch(e => {
  console.error(e);
  process.exit(1);
});
