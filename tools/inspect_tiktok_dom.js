const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const page = ctx.pages().find(p => p.url().includes('tiktok.com')) || await ctx.newPage();

  if (!page.url().includes('tiktokstudio/upload')) {
    await page.goto('https://www.tiktok.com/tiktokstudio/upload', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(4000);
  }

  // Look for file input or iframes
  const inputs = await page.locator('input[type="file"]').count();
  console.log('Top level file inputs count:', inputs);

  const frames = page.frames();
  console.log(`Page has ${frames.length} frames.`);
  for (let i = 0; i < frames.length; i++) {
    const frame = frames[i];
    const frameInputs = await frame.locator('input[type="file"]').count().catch(() => 0);
    if (frameInputs > 0) {
      console.log(`Frame ${i} (${frame.url()}) has ${frameInputs} file inputs.`);
    }
  }

  process.exit(0);
})().catch(console.error);
