const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

const PROFILE_DIR = path.join(process.env.USERPROFILE, '.gemini', 'antigravity', 'scratch', 'chrome_aistudio_profile');
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

(async () => {
  console.log('Launching browser to test AI Studio UI...');
  const ctx = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: true,
    executablePath: CHROME_PATH,
    args: [
      '--headless=new',
      '--disable-blink-features=AutomationControlled',
      '--no-sandbox',
      '--disable-infobars',
      '--window-size=1280,800',
      '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36'
    ],
    viewport: { width: 1280, height: 800 }
  });

  const page = ctx.pages()[0] || await ctx.newPage();

  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
    Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] });
    Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });
    window.chrome = {
      app: { isInstalled: false },
      runtime: {},
      loadTimes: function() {},
      csi: function() {}
    };
  });

  console.log('Navigating to AI Studio generate-speech...');
  await page.goto('https://aistudio.google.com/u/0/generate-speech?model=gemini-3.8-flash-tts', { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(4000);
  console.log('Current URL:', page.url());

  // Click "Create new dialog"
  const createCard = page.locator('text="Create new dialog", button:has-text("Create new dialog")').first();
  if (await createCard.count() > 0) {
    console.log('Clicking Create new dialog...');
    await createCard.click({ force: true });
    await page.waitForTimeout(4000);
  } else {
    console.log('Create new dialog not found directly, checking other elements...');
  }

  await page.screenshot({ path: path.join(__dirname, 'test_after_click_dialog.png') });
  console.log('Saved screenshot test_after_click_dialog.png');

  // Let's dump all textareas and inputs and buttons
  const elements = await page.evaluate(() => {
    return {
      textareas: Array.from(document.querySelectorAll('textarea')).map(t => ({
        placeholder: t.placeholder,
        ariaLabel: t.getAttribute('aria-label'),
        className: t.className,
        value: t.value
      })),
      buttons: Array.from(document.querySelectorAll('button')).map(b => ({
        text: b.innerText.trim(),
        ariaLabel: b.getAttribute('aria-label')
      })).filter(b => b.text || b.ariaLabel).slice(0, 30),
      audios: Array.from(document.querySelectorAll('audio')).map(a => a.src)
    };
  });

  console.log('DOM Elements found:', JSON.stringify(elements, null, 2));

  await ctx.close();
  console.log('Done test.');
})().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
