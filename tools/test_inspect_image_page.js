const { chromium } = require('playwright-core');

(async () => {
  try {
    const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
    const ctx = browser.contexts()[0];
    const page = await ctx.newPage();
    console.log('Navigating to gemini-3.1-flash-image...');
    await page.goto('https://aistudio.google.com/u/1/prompts/new_chat?model=gemini-3.1-flash-image', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(4000);

    console.log('URL:', page.url());
    console.log('Title:', await page.title());

    // Dismiss any modal
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);

    const inputs = await page.evaluate(() => {
      return {
        textareas: document.querySelectorAll('textarea').length,
        contenteditables: document.querySelectorAll('[contenteditable="true"]').length,
        buttons: Array.from(document.querySelectorAll('button')).map(b => b.innerText.trim()).filter(Boolean).slice(0, 20),
        selects: Array.from(document.querySelectorAll('mat-select, select')).map(s => s.getAttribute('aria-label') || s.name || s.id)
      };
    });
    console.log('Inputs info:', JSON.stringify(inputs, null, 2));

    await page.screenshot({ path: 'tools/test_image_tab.png' });
    console.log('Saved screenshot to tools/test_image_tab.png');
    await page.close();
  } catch (err) {
    console.error('Error:', err);
  }
  process.exit(0);
})();
