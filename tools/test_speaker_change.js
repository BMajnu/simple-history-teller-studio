const { chromium } = require('playwright-core');
const path = require('path');

const PROFILE_DIR = path.join(process.env.USERPROFILE, '.gemini', 'antigravity', 'scratch', 'chrome_aistudio_profile');
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

(async () => {
  const ctx = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: true,
    executablePath: CHROME_PATH,
    args: ['--headless=new', '--disable-blink-features=AutomationControlled', '--no-sandbox']
  });
  const page = ctx.pages()[0] || await ctx.newPage();
  await page.goto('https://aistudio.google.com/u/0/generate-speech?model=gemini-3.8-flash-tts', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);
  const card = page.locator('[data-testid="create-new-dialog-card"]').first();
  await card.click();
  await page.waitForTimeout(2500);

  // Click speaker dropdown
  const speakerBtn = page.locator('button:has-text("Speaker")').first();
  console.log('Speaker button text:', await speakerBtn.innerText());
  await speakerBtn.click();
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(__dirname, 'speaker_dropdown.png') });

  const overlayTexts = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('.cdk-overlay-container *, [role="menu"] *, [role="listbox"] *'))
      .map(e => e.innerText ? e.innerText.trim() : '')
      .filter(t => t.length > 0 && t.length < 50);
  });
  console.log('Overlay texts:', [...new Set(overlayTexts)].slice(0, 30));

  await ctx.close();
  console.log('Done test_speaker_change.');
})().catch(err => {
  console.error(err);
  process.exit(1);
});
