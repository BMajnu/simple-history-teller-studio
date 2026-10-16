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

  console.log('Navigating to https://studio.youtube.com/ ...');
  await page.goto('https://studio.youtube.com/', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(5000);

  const title = await page.locator('#entity-name, #channel-title').first().textContent().catch(() => '');
  console.log('Active Channel:', title);

  // Click Content tab on the left menu
  console.log('Clicking Content menu item...');
  const contentTab = page.locator('tp-yt-paper-item:has-text("Content"), a#destination-content, ytcp-navigation-drawer a[href*="videos"]').first();
  await contentTab.click();
  await page.waitForTimeout(5000);

  await page.screenshot({ path: 'tools/current_active_content_tab.png' });

  const rows = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('ytcp-video-row')).map(r => r.innerText.replace(/\n+/g, ' | '));
  });

  console.log('Videos Count:', rows.length);
  rows.forEach((r, idx) => console.log(`Row ${idx + 1}: ${r}`));

  await ctx.close();
  process.exit(0);
})().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
