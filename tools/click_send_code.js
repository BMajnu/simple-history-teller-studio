const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const p = ctx.pages().find(x => x.url().includes('youtube.com/verify'));
  if (!p) {
    console.error('No verify page found!');
    process.exit(1);
  }

  console.log('Clicking #send-code-button...');
  const btn = p.locator('#send-code-button, tp-yt-paper-button:has-text("NEXT")').first();
  await btn.click({ force: true });
  console.log('Clicked NEXT! Waiting 5s for SMS to be dispatched...');
  await p.waitForTimeout(5000);

  console.log('Current URL:', p.url());
  await p.screenshot({ path: 'tools/yt_verify_step2_enter_code.png' });
  console.log('Saved tools/yt_verify_step2_enter_code.png');

  process.exit(0);
})().catch(console.error);
