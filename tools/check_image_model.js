const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

const PROFILE_DIR = path.join(process.env.USERPROFILE, '.gemini', 'antigravity', 'scratch', 'chrome_aistudio_profile');
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

(async () => {
  const ctx = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: false,
    executablePath: CHROME_PATH,
    args: ['--disable-blink-features=AutomationControlled', '--no-sandbox']
  });

  const page = ctx.pages()[0] || await ctx.newPage();

  // Test opening new chat with imagen or gemini image model
  await page.goto('https://aistudio.google.com/u/0/prompts/new_chat?model=gemini-3.1-flash-image', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);

  console.log('Page Title:', await page.title());
  console.log('Page URL:', page.url());

  await page.screenshot({ path: path.join(__dirname, 'image_model_check.png') });
  console.log('Saved image_model_check.png');

  // Check the model name shown on screen
  const modelText = await page.evaluate(() => {
    const el = document.querySelector('.model-name, .model-selector, button[aria-label*="model" i]');
    return el ? el.innerText : 'none';
  });
  console.log('Model text:', modelText);

  await ctx.close();
  process.exit(0);
})().catch(err => {
  console.error(err);
  process.exit(1);
});
