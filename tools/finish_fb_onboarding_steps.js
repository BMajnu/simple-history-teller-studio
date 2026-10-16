const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const p = ctx.pages().find(page => page.url().includes('facebook.com'));

  for (let i = 0; i < 4; i++) {
    await p.waitForTimeout(3000);
    console.log(`Checking screen ${i}, URL: ${p.url()}`);
    await p.screenshot({ path: `tools/fb_onboard_step_${i}.png` });

    const btn = p.locator('div[aria-label="Next"][role="button"], div[aria-label="Done"][role="button"], div[role="button"]:has-text("Next"), div[role="button"]:has-text("Done"), div[role="button"]:has-text("Skip")').first();
    if (await btn.isVisible().catch(() => false)) {
      console.log(`Clicking next/done/skip button...`);
      await btn.click({ force: true });
    } else {
      console.log('No next button found, might be completed!');
    }
  }

  await p.waitForTimeout(5000);
  await p.screenshot({ path: 'tools/fb_page_live_final.png' });
  console.log('Saved tools/fb_page_live_final.png. Final URL:', p.url());

  process.exit(0);
})();
