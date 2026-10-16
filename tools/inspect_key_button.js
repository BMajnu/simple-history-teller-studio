const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const page = browser.contexts()[0].pages()[0];

  const btns = await page.locator('button').all();
  for (let i = 0; i < btns.length; i++) {
    const text = (await btns[i].innerText()).trim();
    const aria = await btns[i].getAttribute('aria-label');
    const title = await btns[i].getAttribute('title');
    const disabled = await btns[i].getAttribute('disabled');
    if (text.includes('key') || text.includes('Run') || (aria && aria.includes('key')) || (title && title.includes('key'))) {
      console.log(`Btn ${i}: text="${text}" aria="${aria}" title="${title}" disabled=${disabled !== null}`);
    }
  }

  // Also check why Run is disabled:
  const runBtn = page.locator('button:has-text("Run")').last();
  console.log('Run disabled attribute:', await runBtn.getAttribute('disabled'));
  console.log('Run aria-disabled:', await runBtn.getAttribute('aria-disabled'));

  // What does clicking key_off do?
  const keyOffBtn = page.locator('button:has-text("key_off")').first();
  if (await keyOffBtn.count() > 0) {
    console.log('Clicking key_off button...');
    await keyOffBtn.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'tools/after_key_off_click.png' });
    console.log('Saved tools/after_key_off_click.png');
  }
})();
