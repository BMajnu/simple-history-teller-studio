const { chromium } = require('playwright-core');
const path = require('path');

const PROFILE_DIR = path.join(process.env.USERPROFILE, '.gemini', 'antigravity', 'scratch', 'chrome_aistudio_profile');
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

(async () => {
  console.log('Clicking Describe Music button in AI Studio...');
  const ctx = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: false,
    executablePath: CHROME_PATH,
    args: ['--disable-blink-features=AutomationControlled', '--no-sandbox'],
    viewport: { width: 1366, height: 850 }
  });

  const page = ctx.pages()[0] || await ctx.newPage();
  await page.goto('https://aistudio.google.com/app/new_music?model=lyria-3.5', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(6000);

  const btn = page.locator('button:has-text("Describe the music you want to generate")').first();
  console.log('Describe button count:', await btn.count());
  if (await btn.count() > 0) {
    await btn.click();
    await page.waitForTimeout(3000);
    await page.screenshot({ path: path.join(__dirname, 'lyria_after_describe_click.png') });
    console.log('Saved lyria_after_describe_click.png');

    const inputs = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('textarea, input, [contenteditable="true"]')).map(el => ({
        tag: el.tagName,
        class: el.className,
        placeholder: el.getAttribute('placeholder'),
        ariaLabel: el.getAttribute('aria-label')
      }));
    });
    console.log('Inputs after describe click:', JSON.stringify(inputs, null, 2));

    const btns = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('button')).map(b => (b.innerText || '').trim()).filter(Boolean);
    });
    console.log('Buttons after describe click (sample 20):', btns.slice(0, 20));
  }

  await ctx.close();
  process.exit(0);
})().catch(console.error);
