const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const igPage = ctx.pages().find(p => p.url().includes('instagram.com'));
  if (igPage) {
    console.log('Evaluating in page context to fill captcha and click Next...');
    const result = await igPage.evaluate(() => {
      const textarea = document.querySelector('textarea, input[placeholder*="Enter the code"]');
      if (!textarea) return 'no textarea';
      
      textarea.focus();
      textarea.value = '041650';
      textarea.dispatchEvent(new Event('input', { bubbles: true }));
      textarea.dispatchEvent(new Event('change', { bubbles: true }));

      // Find Next button
      const nextBtn = Array.from(document.querySelectorAll('div, button')).find(el => el.innerText.trim() === 'Next' && el.getAttribute('role') === 'button' || el.getAttribute('aria-label') === 'Next');
      if (nextBtn) {
        nextBtn.click();
        return 'clicked next';
      }
      return 'next not found';
    });
    console.log('Evaluation result:', result);

    await igPage.waitForTimeout(6000);
    console.log('IG URL after Captcha submission:', igPage.url());
    await igPage.screenshot({ path: 'tools/ig_captcha_submitted_result.png' });
    console.log('Saved tools/ig_captcha_submitted_result.png');
  }
  process.exit(0);
})();
