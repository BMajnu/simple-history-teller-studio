const { chromium } = require('playwright-core');

async function check() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const page = ctx.pages()[0];

  console.log('Page URL:', page.url());
  await page.screenshot({ path: 'tools/current_state.png' });
  console.log('Saved tools/current_state.png');

  const info = await page.evaluate(() => {
    const alerts = Array.from(document.querySelectorAll('[role="alert"], mat-error, .error-message, .cdk-overlay-container')).map(el => el.innerText).filter(Boolean);
    const buttons = Array.from(document.querySelectorAll('button')).map(b => ({
      text: b.innerText ? b.innerText.trim() : '',
      disabled: b.disabled || b.getAttribute('aria-disabled') === 'true',
      classes: b.className
    })).filter(b => b.text.length > 0 && b.text.length < 50);
    return { alerts, buttons };
  });

  console.log('Info:', JSON.stringify(info, null, 2));
}

check().catch(console.error);
