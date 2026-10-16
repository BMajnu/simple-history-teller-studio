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
  await page.bringToFront();

  // Navigate to YouTube Studio
  await page.goto('https://studio.youtube.com', { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(4000);

  // Switch to Bangla channel
  const avatar = page.locator('#avatar-btn, button#avatar-btn, ytcp-app-header #avatar-btn').first();
  await avatar.click();
  await page.waitForTimeout(1500);

  const switchItem = page.locator('tp-yt-paper-item:has-text("Switch account"), ytcp-text-menu-item:has-text("Switch account")').first();
  await switchItem.click();
  await page.waitForTimeout(2000);

  const bnChannel = page.locator('ytd-account-item-renderer:has-text("Simple History Teller Bangla")').first();
  await bnChannel.click();
  await page.waitForTimeout(6000);

  // Go to channel content / videos
  await page.goto('https://studio.youtube.com/channel/videos', { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(5000);

  // Go to Shorts tab
  const shortsTab = page.locator('tp-yt-paper-tab:has-text("Shorts"), div[role="tab"]:has-text("Shorts")').first();
  if (await shortsTab.isVisible().catch(() => false)) {
    await shortsTab.click();
    await page.waitForTimeout(3000);
  }

  // Extract video items
  const videos = await page.evaluate(() => {
    const rows = Array.from(document.querySelectorAll('ytcp-video-row, #row-container'));
    return rows.map(r => {
      const link = r.querySelector('a[href*="/video/"]');
      const title = r.querySelector('#video-title, #title');
      const thumb = r.querySelector('img');
      return {
        title: title ? title.innerText.trim() : null,
        href: link ? link.getAttribute('href') : null,
        thumbSrc: thumb ? thumb.src : null
      };
    }).filter(v => v.href);
  });

  console.log('Bangla Shorts List:', JSON.stringify(videos, null, 2));

  await ctx.close();
  process.exit(0);
})().catch(err => {
  console.error(err);
  process.exit(1);
});
