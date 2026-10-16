const { chromium } = require('playwright-core');

(async () => {
  console.log('=== SUBMITTING INSTAGRAM VERIFICATION CODE: 751679 ===');
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const igPage = ctx.pages().find(p => p.url().includes('instagram.com'));
  if (!igPage) {
    console.log('No IG page found');
    process.exit(1);
  }

  // Find the input
  await igPage.evaluate(() => {
    const el = document.querySelector('input, textarea');
    if (el) {
      el.focus();
      el.click();
    }
  });
  await igPage.waitForTimeout(500);

  console.log('Typing 751679 via keyboard...');
  await igPage.keyboard.type('751679', { delay: 100 });
  await igPage.waitForTimeout(1000);

  await igPage.screenshot({ path: 'tools/ig_code_typed_751679.png' });
  console.log('Saved tools/ig_code_typed_751679.png');

  // Click Next
  const nextBtn = igPage.locator('div[aria-label="Next"], button:has-text("Next"), div[role="button"]:has-text("Next")').first();
  console.log('Clicking Next...');
  await nextBtn.click({ force: true });
  await igPage.waitForTimeout(10000);

  console.log('IG URL after code submission:', igPage.url());
  await igPage.screenshot({ path: 'tools/ig_after_code_submitted.png' });
  console.log('Saved tools/ig_after_code_submitted.png');

  process.exit(0);
})();
