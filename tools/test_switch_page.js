const { chromium } = require('playwright-core');
const path = require('path');

const ARTIFACTS_DIR = 'C:\\Users\\badiu\\.gemini\\antigravity\\brain\\522a240f-2122-4427-9348-850afc4de7cf';

(async () => {
  console.log('Connecting to Chrome CDP...');
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const p = ctx.pages()[0] || await ctx.newPage();

  console.log('Navigating to Bangla page: https://www.facebook.com/61595477341365 ...');
  await p.goto('https://www.facebook.com/61595477341365', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await p.waitForTimeout(4000);

  // Press escape to close any open dropdowns
  await p.keyboard.press('Escape');
  await p.waitForTimeout(500);

  // Look for the blue "Switch" button in the bottom-left card
  console.log('Looking for Switch button...');
  const switchBtns = p.locator('div[role="button"]:has-text("Switch")');
  const count = await switchBtns.count();
  console.log('Switch buttons found:', count);

  for (let i = 0; i < count; i++) {
    const btn = switchBtns.nth(i);
    const text = await btn.innerText().catch(() => '');
    console.log(`Btn ${i}: "${text}"`);
    if (text.trim() === 'Switch') {
      console.log(`Clicking Switch button #${i}...`);
      await btn.click();
      await p.waitForTimeout(6000);
      break;
    }
  }

  const switchedScreenshot = path.join(ARTIFACTS_DIR, 'fb_bangla_switched_state.png');
  await p.screenshot({ path: switchedScreenshot });
  console.log('Saved screenshot:', switchedScreenshot);

  // Check URL and profile text
  console.log('Current URL:', p.url());
  const bodyText = await p.evaluate(() => document.body.innerText.slice(0, 500));
  console.log('Body text sample:\n', bodyText);

  process.exit(0);
})();
