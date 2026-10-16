const { chromium } = require('playwright-core');
const path = require('path');

const PROFILE_DIR = 'C:\\Users\\badiu\\.gemini\\antigravity\\scratch\\chrome_aistudio_profile_3';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const VIDEO_PATH = path.resolve('projects/sample_first_king/renders/shorts_full/short_bn_full3.mp4');

(async () => {
  const ctx = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: false,
    executablePath: CHROME_PATH,
    args: ['--start-maximized', '--disable-blink-features=AutomationControlled'],
    viewport: null
  });
  const page = ctx.pages()[0] || await ctx.newPage();
  await page.goto('https://studio.youtube.com/channel/UCOzERwa3GJqO00B8LMTPtDg/videos/short', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(3000);

  // Click create
  const createBtn = page.locator('#create-icon').first();
  await createBtn.click();
  await page.waitForTimeout(1000);

  // Find all items in text-menu
  const items = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('ytcp-text-menu tp-yt-paper-item, ytcp-text-menu #text-item-0, paper-item')).map(el => ({
      text: el.innerText.trim(),
      id: el.id,
      tag: el.tagName
    }));
  });
  console.log('Menu items:', items);

  const uploadItem = page.locator('tp-yt-paper-item:has-text("Upload videos"), #text-item-0').first();
  await uploadItem.click();
  await page.waitForTimeout(3000);

  const fileInput = page.locator('input[type="file"]').first();
  await fileInput.setInputFiles(VIDEO_PATH);
  console.log('Uploaded short_bn_full3.mp4 to file input.');
  await page.waitForTimeout(6000);

  await page.screenshot({ path: 'tools/upload_wizard_opened.png' });
  console.log('Saved tools/upload_wizard_opened.png');

  // Check for daily limit banner
  const bodyText = await page.innerText('body');
  const hasDailyLimit = bodyText.includes('Daily limit reached');
  console.log('Has daily limit banner:', hasDailyLimit);

  await ctx.close();
})();
