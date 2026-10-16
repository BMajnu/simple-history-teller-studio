const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const p = ctx.pages().find(x => x.url().includes('youtube.com/verify'));
  if (!p) {
    console.error('No verify page found!');
    process.exit(1);
  }

  console.log('Focusing phone input and clicking NEXT paper button...');
  const phoneInput = p.locator('input').last();
  await phoneInput.focus();
  await p.keyboard.press('Enter');
  await p.waitForTimeout(1000);

  // Click the actual paper-button inside send-code-button
  const paperBtn = p.locator('#send-code-button tp-yt-paper-button, #send-code-button a, #send-code-button #text').first();
  console.log('Paper button visible:', await paperBtn.isVisible());
  if (await paperBtn.isVisible()) {
    await paperBtn.click();
    console.log('Clicked paper button! Waiting 4s...');
    await p.waitForTimeout(4000);
  }

  await p.screenshot({ path: 'tools/yt_after_proper_click.png' });
  console.log('Saved tools/yt_after_proper_click.png');

  process.exit(0);
})().catch(console.error);
