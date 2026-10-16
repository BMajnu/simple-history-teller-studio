const { chromium } = require('playwright-core');

const KEYWORDS_LIST = [
  'Simple History Teller Hindi',
  'सिंपल हिस्ट्री टेलर हिंदी',
  'history in hindi',
  'animated history hindi',
  'world history in hindi',
  'ancient history hindi',
  'mysterious history',
  'indian history',
  'itihas',
  'prachin itihas',
  'historical documentaries hindi',
  'oversimplified hindi',
  'history facts',
  'educational animation hindi'
];

async function run() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('editing')) || context.pages()[0];
  
  // 1. Enter Keywords
  console.log('Finding Keywords input...');
  const kwInput = page.locator('#keywords-input input, input[placeholder*="keywords"], input#text-input').first();
  await kwInput.click();
  for (const kw of KEYWORDS_LIST) {
    await kwInput.fill(kw);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(100);
  }
  console.log('All keywords entered!');
  await page.waitForTimeout(1000);

  // 2. Click Advanced settings
  console.log('Clicking Advanced settings tab...');
  const advTab = page.locator('tp-yt-paper-tab:has-text("Advanced settings"), div:has-text("Advanced settings")').first();
  await advTab.click();
  await page.waitForTimeout(1500);

  // 3. Select "No, set this channel as not made for kids"
  console.log('Selecting "Not made for kids"...');
  const notKidsRadio = page.locator('tp-yt-paper-radio-button[name="NOT_MADE_FOR_KIDS"]').first();
  if (await notKidsRadio.count() > 0) {
    await notKidsRadio.click();
  } else {
    const radio2 = page.locator('tp-yt-paper-radio-button').nth(1);
    await radio2.click();
  }
  await page.waitForTimeout(1000);

  await page.screenshot({ path: 'tools/c3_settings_configured.png' });

  // 4. Click Save
  console.log('Clicking Save...');
  const saveBtn = page.locator('ytcp-button#save-button button, button:has-text("Save")').first();
  await saveBtn.click();
  await page.waitForTimeout(4000);
  console.log('Settings Saved!');

  await page.screenshot({ path: 'tools/c3_settings_all_done.png' });
  process.exit(0);
}

run().catch(e => { console.error(e); process.exit(1); });
