const { chromium } = require('playwright-core');

async function main() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const page = await browser.contexts()[0].newPage();

  // Channel 3 is currently active in this session
  await page.goto('https://studio.youtube.com/channel/UCkG4y9NJQ5yCys3jxFDUOcg/editing/profile', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);

  // Dismiss popup
  try {
    const cont = page.locator('button:has-text("Continue"), ytcp-button:has-text("Continue")').first();
    if (await cont.count() > 0 && await cont.isVisible()) {
      await cont.click();
      await page.waitForTimeout(1000);
    }
  } catch (e) {}

  await page.keyboard.press('Escape');

  // Inspect the description area
  const descInfo = await page.evaluate(() => {
    const ta = document.querySelector('textarea, #description-textarea, ytcp-form-textarea');
    return {
      found: !!ta,
      tag: ta?.tagName,
      id: ta?.id,
      className: ta?.className,
      placeholder: ta?.getAttribute('placeholder')
    };
  });
  console.log('Description element info:', descInfo);

  // Click description box and type test
  const desc = page.locator('textarea, ytcp-form-textarea textarea, #description-textarea textarea').first();
  if (await desc.count() > 0) {
    await desc.click();
    await page.keyboard.press('Control+A');
    await page.keyboard.press('Backspace');
    await desc.fill('This is a test description for SEO verification.');
    await page.keyboard.press('Tab');
  }

  await page.screenshot({ path: 'tools/desc_test.png' });
  await page.close();
}

main().catch(console.error);
