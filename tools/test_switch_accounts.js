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
  await page.waitForTimeout(5000);

  // Click avatar at top right
  console.log('Clicking avatar button at top right...');
  const avatarBtn = page.locator('#avatar-btn, button#avatar-btn, ytcp-app-header button:has(img)').last();
  await avatarBtn.click();
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'tools/avatar_menu_clicked.png' });

  // Click switch account
  console.log('Looking for Switch account...');
  const switchItem = page.locator('tp-yt-paper-item:has-text("Switch account"), ytcp-text-menu-item:has-text("Switch account"), [role="menuitem"]:has-text("Switch")').first();
  if (await switchItem.isVisible().catch(() => false)) {
    console.log('Clicking Switch account...');
    await switchItem.click();
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'tools/switch_accounts_list.png' });

    // Print all accounts visible
    const accounts = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('ytd-account-item-renderer, tp-yt-paper-item')).map(a => a.innerText.replace(/\n+/g, ' | '));
    });
    console.log('Available Accounts:');
    accounts.forEach((a, i) => console.log(`[${i+1}] ${a}`));
  }

  await ctx.close();
  process.exit(0);
})().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
