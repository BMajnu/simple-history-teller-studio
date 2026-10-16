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

  await page.goto('https://studio.youtube.com/', { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(4000);

  // Click avatar at top right
  console.log('Clicking avatar button...');
  const avatarBtn = page.locator('#avatar-btn, button#avatar-btn, ytcp-app-header button:has(img)').last();
  await avatarBtn.click();
  await page.waitForTimeout(2000);

  // Click switch account
  console.log('Clicking Switch account...');
  const switchItem = page.locator('tp-yt-paper-item:has-text("Switch account")').first();
  await switchItem.click();
  await page.waitForTimeout(2000);

  // Click Simple History Teller (English)
  console.log('Clicking Simple History Teller (English)...');
  const enAccount = page.locator('ytd-account-item-renderer:has-text("Simple History Teller")')
    .filter({ hasNotText: 'Bangla' })
    .filter({ hasNotText: 'Hindi' })
    .first();
  await enAccount.click();
  await page.waitForTimeout(8000);

  console.log('Current URL after switch:', page.url());
  await page.screenshot({ path: 'tools/en_channel_studio_dashboard.png' });

  // Go to Content tab
  console.log('Navigating to Content tab...');
  const contentLink = page.locator('tp-yt-paper-item:has-text("Content"), a#destination-content, ytcp-navigation-drawer a[href*="videos"]').first();
  if (await contentLink.isVisible().catch(() => false)) {
    await contentLink.click();
    await page.waitForTimeout(5000);
  } else {
    // Navigate via URL
    const url = page.url();
    const match = url.match(/channel\/([^/]+)/);
    if (match) {
      await page.goto(`https://studio.youtube.com/channel/${match[1]}/videos/upload`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(5000);
    }
  }

  await page.screenshot({ path: 'tools/en_channel_content_tab.png' });

  // List rows
  const rows = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('ytcp-video-row')).map(r => r.innerText.replace(/\n+/g, ' | '));
  });

  console.log('English Channel Videos Count:', rows.length);
  rows.forEach((r, idx) => console.log(`Row ${idx + 1}: ${r}`));

  await ctx.close();
  process.exit(0);
})().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
