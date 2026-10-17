const { chromium } = require('playwright-core');
const path = require('path');

const PROFILE_DIR = path.join(process.env.USERPROFILE, '.gemini', 'antigravity', 'scratch', 'chrome_aistudio_profile');
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

(async () => {
  console.log('Testing Lyria 3.5 prompt input...');
  const ctx = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: false,
    executablePath: CHROME_PATH,
    args: ['--disable-blink-features=AutomationControlled', '--no-sandbox'],
    viewport: { width: 1366, height: 850 }
  });

  const page = ctx.pages()[0] || await ctx.newPage();
  await page.goto('https://aistudio.google.com/app/new_music?model=lyria-3.5', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(5000);

  // Click the preset card to open the editor
  const card = page.locator('button:has-text("Compose a cinematic orchestral hybrid score")').first();
  if (await card.count() > 0) {
    console.log('Clicking Cinematic score preset card...');
    await card.click();
    await page.waitForTimeout(2000);
  }

  await page.screenshot({ path: path.join(__dirname, 'lyria_after_card_click.png') });
  console.log('Saved lyria_after_card_click.png');

  // Find the text input area
  const inputEl = page.locator('textarea, rich-textarea, div[contenteditable="true"], [role="textbox"]').first();
  console.log('Input count:', await inputEl.count());

  const buttons = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('button')).map(b => (b.innerText || b.getAttribute('aria-label') || '').trim()).filter(Boolean);
  });
  console.log('Buttons visible:', buttons.slice(0, 25));

  await ctx.close();
  process.exit(0);
})().catch(console.error);
