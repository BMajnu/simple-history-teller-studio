const { chromium } = require('playwright-core');
const fs = require('fs');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const p = ctx.pages().find(page => page.url().includes('instagram.com/accounts/suspended'));
  if (!p) {
    console.error('Suspended page not found');
    process.exit(1);
  }

  // Check what captcha is currently displayed
  const client = await ctx.newCDPSession(p);
  let snap = await client.send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('tools/ig_captcha_now.png', Buffer.from(snap.data, 'base64'));

  // Fill via dispatchEvent and click Next
  console.log('Dispatching input event with 116060 and clicking Next...');
  const res = await p.evaluate(() => {
    const el = document.querySelector('textarea, input[placeholder*="Enter the code"]');
    if (!el) return 'input not found';
    el.focus();
    el.value = '116060';
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));

    const nextBtn = Array.from(document.querySelectorAll('div, button')).find(b => 
      (b.innerText && b.innerText.trim() === 'Next') || b.getAttribute('aria-label') === 'Next'
    );
    if (nextBtn) {
      nextBtn.removeAttribute('disabled');
      nextBtn.removeAttribute('aria-disabled');
      nextBtn.click();
      return 'clicked next';
    }
    return 'next button not found';
  });
  console.log('Result:', res);

  await p.waitForTimeout(6000);

  snap = await client.send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('tools/ig_after_captcha_solve.png', Buffer.from(snap.data, 'base64'));

  console.log('URL now:', p.url());
  const bodyText = await p.innerText('body');
  console.log('Body snippet:\n', bodyText.slice(0, 500).replace(/\n+/g, ' '));

  process.exit(0);
})();
