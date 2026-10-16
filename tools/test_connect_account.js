const { chromium } = require('playwright-core');

(async () => {
  try {
    const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
    const page = browser.contexts()[0].pages()[0];
    console.log('Navigating page to /u/1/ speech...');
    await page.goto('https://aistudio.google.com/u/1/generate-speech?model=gemini-3.8-flash-tts', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(4000);
    console.log('URL:', page.url());

    const email = await page.evaluate(() => {
      const el = document.querySelector('button[aria-label*="Google Account"], img[alt*="Google Account"], a[aria-label*="Google Account"]');
      return el ? (el.getAttribute('aria-label') || el.getAttribute('alt')) : 'none';
    });
    console.log('Active account:', email);

    await page.screenshot({ path: 'tools/current_state_u1.png' });
    console.log('Screenshot saved to tools/current_state_u1.png');
  } catch (e) {
    console.error('Error:', e.message);
  }
})();
