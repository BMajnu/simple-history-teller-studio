const { chromium } = require('playwright-core');

async function run() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const context = browser.contexts()[0];
  const page = await context.newPage();
  
  await page.goto('https://studio.youtube.com/channel/UCvEQdVnctkuYZw3iNDo5krg/editing/profile', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(5000);
  
  // dismiss dialogs
  try {
    const continueBtn = page.locator('#confirm-button, button:has-text("Continue"), ytcp-button:has-text("Continue")').first();
    if (await continueBtn.isVisible()) await continueBtn.click();
  } catch (e) {}

  await page.keyboard.press('Escape');
  await page.waitForTimeout(500);

  // Scroll down to links
  await page.evaluate(() => window.scrollBy(0, 1200));
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'tools/c1_scrolled_links_inspect.png' });
  
  const textInfo = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('*'))
      .filter(e => e.children.length === 0 && (e.textContent.includes('Link') || e.textContent.includes('Social') || e.textContent.includes('Contact') || e.textContent.includes('Email') || e.textContent.includes('Add link')))
      .map(e => ({ tag: e.tagName, text: e.textContent.trim(), cls: e.className }));
  });
  console.log('Links & Contact elements:', JSON.stringify(textInfo, null, 2));
  
  // Find all buttons on bottom of page
  const buttons = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('button, ytcp-button')).map(b => ({
      text: b.innerText ? b.innerText.trim() : '',
      id: b.id,
      cls: b.className
    })).filter(b => b.text && b.text.length > 0);
  });
  console.log('Buttons:', JSON.stringify(buttons, null, 2));

  await page.close();
  process.exit(0);
}

run().catch(e => { console.error(e); process.exit(1); });
