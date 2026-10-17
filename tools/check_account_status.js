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

  for (const slot of [0, 1, 2]) {
    console.log(`\n--- Checking slot u/${slot} ---`);
    await page.goto(`https://aistudio.google.com/u/${slot}/prompts/new_chat`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(4000);
    console.log(`Slot ${slot} URL:`, page.url());
    console.log(`Slot ${slot} Title:`, await page.title());

    // Check if there is a dialog or terms modal
    const modalText = await page.evaluate(() => {
      const dialog = document.querySelector('mat-dialog-container, .cdk-overlay-container, .terms-dialog, ms-terms-of-service');
      return dialog ? dialog.innerText : null;
    });
    if (modalText) {
      console.log(`Slot ${slot} Modal:`, modalText.slice(0, 300));
    } else {
      console.log(`Slot ${slot} No modal.`);
    }

    // Try a simple text prompt to see if Gemini text works
    const ta = page.locator('textarea, rich-textarea, [contenteditable="true"]').first();
    if (await ta.count() > 0) {
      console.log(`Slot ${slot} found input, testing prompt...`);
      await ta.fill('Hi');
      await page.waitForTimeout(500);
      const runBtn = page.locator('button:has-text("Run")').first();
      if (await runBtn.count() > 0) {
        await runBtn.click();
        await page.waitForTimeout(4000);
      }
    }
    await page.screenshot({ path: path.join(__dirname, `slot_${slot}_chat.png`) });
  }

  await ctx.close();
  console.log('Done checking slots.');
})().catch(err => {
  console.error(err);
  process.exit(1);
});
