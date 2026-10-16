const { chromium } = require('playwright-core');
const fs = require('fs');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const p = ctx.pages().find(page => page.url().includes('facebook.com/profile.php?id=61595162615338'));
  if (!p) {
    console.error('Bangla FB page not found');
    process.exit(1);
  }

  // Look for Save changes
  const saveBtn = p.locator('div[aria-label="Save changes"][role="button"], div[role="button"]:has-text("Save changes")').first();
  if (await saveBtn.isVisible().catch(() => false)) {
    console.log('Found Save changes button! Clicking...');
    await saveBtn.click();
    await p.waitForTimeout(5000);
  } else {
    console.log('No Save changes button visible. Let us check what buttons are present.');
    const buttons = await p.evaluate(() => {
      return Array.from(document.querySelectorAll('div[role="button"]'))
        .map(b => b.innerText)
        .filter(t => t && t.trim().length > 0);
    });
    console.log('Buttons on page:', buttons.slice(0, 20));
  }

  try {
    // Take screenshot without waiting for font loading
    const buf = await p.screenshot({ timeout: 5000 });
    fs.writeFileSync('tools/fb_c2_live_page_final.png', buf);
    fs.writeFileSync('C:/Users/badiu/.gemini/antigravity/brain/522a240f-2122-4427-9348-850afc4de7cf/fb_page_c2_live.png', buf);
    console.log('Saved fb_c2_live_page_final.png');
  } catch(e) {
    console.log('Screenshot timeout, trying via CDP Page.captureScreenshot...');
    const client = await p.context().newCDPSession(p);
    const { data } = await client.send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('tools/fb_c2_live_page_final.png', Buffer.from(data, 'base64'));
    fs.writeFileSync('C:/Users/badiu/.gemini/antigravity/brain/522a240f-2122-4427-9348-850afc4de7cf/fb_page_c2_live.png', Buffer.from(data, 'base64'));
    console.log('CDP captureScreenshot succeeded!');
  }

  process.exit(0);
})();
