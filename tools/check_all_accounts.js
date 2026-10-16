const { chromium } = require('playwright-core');

async function checkAccounts() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const page = browser.contexts()[0].pages()[0];

  const slots = ['u/0', 'u/1', 'u/2', 'u/3', 'u/4', 'u/5'];
  const results = [];

  for (const slot of slots) {
    const url = `https://aistudio.google.com/${slot}/prompts/new_chat?model=gemini-omni-1.1-flash`;
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 25000 });
      await page.waitForTimeout(3000);
      await page.keyboard.press('Escape');

      const info = await page.evaluate(() => {
        const bodyText = document.body ? document.body.innerText : '';
        const emailEl = document.querySelector('button[aria-label*="@"], div[aria-label*="@"]');
        const email = emailEl ? (emailEl.getAttribute('aria-label') || emailEl.innerText || '') : 'unknown';
        
        // Find run button
        const btns = Array.from(document.querySelectorAll('button'));
        const runBtn = btns.find(b => (b.innerText || '').includes('Run'));
        const isDisabled = runBtn ? (runBtn.disabled || runBtn.getAttribute('aria-disabled') === 'true') : null;
        const paidAlert = bodyText.includes('requires a paid API key');
        const quotaExceeded = bodyText.includes('quota') || bodyText.includes('limit reached');

        return {
          currentUrl: window.location.href,
          email,
          hasRunBtn: !!runBtn,
          runDisabled: isDisabled,
          hasPaidAlert: paidAlert,
          quotaExceeded
        };
      });

      console.log(`Slot ${slot}: URL=${info.currentUrl} | Email=${info.email} | RunDisabled=${info.runDisabled} | PaidAlert=${info.hasPaidAlert}`);
      results.push({ slot, ...info });
    } catch (e) {
      console.log(`Slot ${slot} error: ${e.message}`);
      results.push({ slot, error: e.message });
    }
  }

  console.log('Results summary:', JSON.stringify(results, null, 2));
}

checkAccounts().catch(console.error);
