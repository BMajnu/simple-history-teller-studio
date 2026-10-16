const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const igPage = ctx.pages().find(p => p.url().includes('instagram.com'));
  if (!igPage) {
    console.log('No IG page found');
    process.exit(1);
  }

  // Inspect the input element
  const inputInfo = await igPage.evaluate(() => {
    const el = document.querySelector('input[placeholder*="Phone"], textarea[placeholder*="Phone"], input[type="tel"], input:not([type="hidden"])');
    return el ? { tag: el.tagName, type: el.type, placeholder: el.placeholder, id: el.id, className: el.className } : null;
  });
  console.log('Phone input info:', inputInfo);

  // Focus and type
  await igPage.evaluate(() => {
    const el = document.querySelector('input[placeholder*="Phone"], textarea[placeholder*="Phone"], input[type="tel"]');
    if (el) {
      el.focus();
      el.click();
    }
  });
  await igPage.waitForTimeout(500);

  // Try typing 01833933521
  console.log('Typing 01833933521...');
  await igPage.keyboard.type('01833933521', { delay: 100 });
  await igPage.waitForTimeout(1000);

  await igPage.screenshot({ path: 'tools/ig_phone_typed.png' });
  console.log('Saved tools/ig_phone_typed.png');

  // Check Send code button
  const sendBtn = igPage.locator('div[aria-label="Send code"], button:has-text("Send code"), div[role="button"]:has-text("Send code")').first();
  console.log('Clicking Send code button...');
  await sendBtn.click({ force: true });
  await igPage.waitForTimeout(6000);

  console.log('IG URL after Send code:', igPage.url());
  await igPage.screenshot({ path: 'tools/ig_after_send_code.png' });
  console.log('Saved tools/ig_after_send_code.png');

  process.exit(0);
})();
