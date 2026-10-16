const { chromium } = require('playwright-core');

(async () => {
  try {
    const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
    const ctx = browser.contexts()[0];
    const page = await ctx.newPage();
    console.log('Navigating test tab to /u/2/ speech...');
    await page.goto('https://aistudio.google.com/u/2/generate-speech?model=gemini-3.8-flash-tts', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(4000);
    console.log('Tab URL:', page.url());

    const accountInfo = await page.evaluate(() => {
      const el = document.querySelector('button[aria-label*="Google Account"], img[alt*="Google Account"], a[aria-label*="Google Account"]');
      const text = document.body.innerText;
      return {
        label: el ? (el.getAttribute('aria-label') || el.getAttribute('alt')) : 'none',
        hasUpgrade: text.includes('Upgrade to unlock more'),
        hasPro: text.includes('PRO')
      };
    });
    console.log('Account 2 info:', JSON.stringify(accountInfo, null, 2));
    await page.screenshot({ path: 'tools/account_2_state.png' });
    console.log('Saved tools/account_2_state.png');
    await page.close();
  } catch (err) {
    console.error('Error checking account 2:', err.message);
  }
})();
