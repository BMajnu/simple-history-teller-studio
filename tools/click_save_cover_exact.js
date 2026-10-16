const { chromium } = require('playwright-core');
const fs = require('fs');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const p = ctx.pages().find(page => page.url().includes('facebook.com/profile.php?id=61595162615338'));
  
  const btnInfo = await p.evaluate(() => {
    const all = Array.from(document.querySelectorAll('*'));
    const el = all.find(e => e.innerText && e.innerText.trim() === 'Save changes');
    if (!el) return null;
    const parent = el.closest('[role="button"]') || el;
    const rect = parent.getBoundingClientRect();
    return {
      text: el.innerText,
      x: rect.x,
      y: rect.y,
      width: rect.width,
      height: rect.height
    };
  });

  console.log('Button info:', btnInfo);
  if (btnInfo) {
    const cx = btnInfo.x + btnInfo.width / 2;
    const cy = btnInfo.y + btnInfo.height / 2;
    console.log(`Clicking exact center: (${cx}, ${cy})`);
    await p.mouse.click(cx, cy);
    await p.waitForTimeout(6000);

    const client = await p.context().newCDPSession(p);
    const { data } = await client.send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('tools/fb_c2_live_page_final.png', Buffer.from(data, 'base64'));
    fs.writeFileSync('C:/Users/badiu/.gemini/antigravity/brain/522a240f-2122-4427-9348-850afc4de7cf/fb_page_c2_live.png', Buffer.from(data, 'base64'));
    console.log('Cover photo saved successfully!');
  } else {
    console.log('Button not found');
  }

  process.exit(0);
})();
