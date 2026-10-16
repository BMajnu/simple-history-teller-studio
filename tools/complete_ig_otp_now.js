const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const igPage = ctx.pages().find(p => p.url().includes('instagram.com'));

  if (!igPage) {
    console.log('Instagram page not found!');
    process.exit(1);
  }

  console.log('Found open Instagram page! URL:', igPage.url());
  await igPage.bringToFront();
  await igPage.screenshot({ path: 'tools/ig_current_live.png' });
  console.log('Saved tools/ig_current_live.png');

  // Find the confirmation code input
  const visibleInputs = igPage.locator('input:visible');
  console.log('Visible inputs count:', await visibleInputs.count());
  
  if (await visibleInputs.count() > 0) {
    console.log('Filling OTP: 531111 into input...');
    await visibleInputs.first().fill('531111');
    await igPage.waitForTimeout(1000);
    await igPage.screenshot({ path: 'tools/ig_filled_531111.png' });

    const continueBtn = igPage.locator('button:has-text("Continue"), div[role="button"]:has-text("Continue"), button:has-text("Next")').first();
    console.log('Clicking Continue...');
    await continueBtn.click();
    await igPage.waitForTimeout(8000);

    console.log('URL after Continue:', igPage.url());
    await igPage.screenshot({ path: 'tools/ig_after_continue.png' });
    console.log('Saved tools/ig_after_continue.png');
  }

  process.exit(0);
})();
