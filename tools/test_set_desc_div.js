const { chromium } = require('playwright-core');

const CHANNEL_ID = 'UCvEQdVnctkuYZw3iNDo5krg';
const TEST_TEXT = 'Welcome to Simple History Teller!';

async function run() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes(CHANNEL_ID) && p.url().includes('editing')) || context.pages()[0];
  await page.bringToFront();

  const descDiv = page.locator('#description-textbox #textbox').first();
  console.log('Desc div count:', await descDiv.count());
  await descDiv.scrollIntoViewIfNeeded();
  await descDiv.click();
  await page.keyboard.press('Control+A');
  await page.keyboard.press('Backspace');
  
  // Set content and dispatch input
  await page.evaluate((text) => {
    const el = document.querySelector('#description-textbox #textbox');
    el.focus();
    document.execCommand('insertText', false, text);
  }, TEST_TEXT);

  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'tools/c1_test_desc_input.png' });

  const val = await descDiv.innerText();
  console.log('Desc div text now:', val);

  process.exit(0);
}

run().catch(e => { console.error(e); process.exit(1); });
