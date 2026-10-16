const { chromium } = require('playwright-core');

(async () => {
  try {
    const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
    const context = browser.contexts()[0];
    const page = await context.newPage();
    console.log('Navigating new page to gemini-3.1-flash-image chat...');
    await page.goto('https://aistudio.google.com/prompts/new_chat?model=gemini-3.1-flash-image', { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForTimeout(5000);
    console.log('URL:', page.url());
    console.log('Title:', await page.title());
    await page.screenshot({ path: 'C:/Users/badiu/.gemini/antigravity/brain/522a240f-2122-4427-9348-850afc4de7cf/aistudio_image_chat_test.png' });
    const text = await page.evaluate(() => document.body.innerText);
    console.log('Text snippet:\n', text.substring(0, 1000));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
