const { chromium } = require('playwright-core');

(async () => {
  try {
    const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
    const page = browser.contexts()[0].pages()[0];

    const info = await page.evaluate(() => {
      const btn = document.querySelector('button[aria-label*="Google Account"], img[alt*="Google Account"], a[aria-label*="Google Account"]');
      const text = document.body.innerText;
      const runBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Run'));
      return {
        label: btn ? (btn.getAttribute('aria-label') || btn.getAttribute('alt')) : null,
        hasUpgrade: text.includes('Upgrade to unlock more'),
        hasGetApiKey: text.includes('Get API key'),
        hasRun: !!runBtn,
        runText: runBtn ? runBtn.innerText : null
      };
    });
    console.log('Account state on /u/1/:', JSON.stringify(info, null, 2));

    await page.screenshot({ path: 'tools/account_1_state.png' });
    console.log('Screenshot saved to tools/account_1_state.png');
  } catch (err) {
    console.error('Error:', err.message);
  }
})();
