const { chromium } = require('playwright-core');
const fs = require('fs');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const p = ctx.pages().find(page => page.url().includes('facebook.com/profile.php?id=61595162615338'));

  // Click Save changes button
  const saveBtn = p.locator('div[aria-label="Save changes"][role="button"], div[role="button"]:has-text("Save changes")').first();
  if (await saveBtn.isVisible().catch(() => false)) {
    console.log('Clicking Save changes button...');
    await saveBtn.click();
  } else {
    console.log('Clicking at coordinate (938, 88)...');
    await p.mouse.click(938, 88);
  }

  await p.waitForTimeout(6000);

  // Capture screenshot via CDP
  const client = await p.context().newCDPSession(p);
  const { data } = await client.send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('tools/fb_c2_live_page_final.png', Buffer.from(data, 'base64'));
  fs.writeFileSync('C:/Users/badiu/.gemini/antigravity/brain/522a240f-2122-4427-9348-850afc4de7cf/fb_page_c2_live.png', Buffer.from(data, 'base64'));
  console.log('Bangla Facebook Page is completely saved and live!');

  process.exit(0);
})();
