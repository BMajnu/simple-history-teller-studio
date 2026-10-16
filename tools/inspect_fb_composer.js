const { chromium } = require('playwright-core');
const path = require('path');

(async () => {
  try {
    const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
    for (let c = 0; c < browser.contexts().length; c++) {
      const ctx = browser.contexts()[c];
      console.log(`Context ${c} has ${ctx.pages().length} pages:`);
      for (const p of ctx.pages()) {
        console.log(`  - [${p.url()}] ${await p.title().catch(() => '')}`);
      }
    }
    const page = browser.contexts().flatMap(c => c.pages()).find(p => p.url().includes('facebook.com'));
    if (!page) {
      console.log('No FB page found in any context');
      process.exit(1);
    }

    console.log('FB Page title:', await page.title());
    console.log('FB Page url:', page.url());

    const fileInputs = page.locator('input[type="file"]');
    const count = await fileInputs.count();
    console.log('File inputs count:', count);
    for (let i = 0; i < count; i++) {
      const input = fileInputs.nth(i);
      const accept = await input.getAttribute('accept');
      console.log(`Input ${i} accept:`, accept);
    }

    const photoBtn = page.locator('div[aria-label="Photo/video"], div[aria-label="Photo/Video"], div[role="button"]:has-text("Photo/video")').first();
    console.log('Photo/video button visible:', await photoBtn.isVisible().catch(() => false));

    const textBox = page.locator('div[role="textbox"][contenteditable="true"]').first();
    console.log('TextBox visible:', await textBox.isVisible().catch(() => false));
    if (await textBox.isVisible().catch(() => false)) {
      console.log('TextBox text:', await textBox.innerText().catch(() => ''));
    }

    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
})();
