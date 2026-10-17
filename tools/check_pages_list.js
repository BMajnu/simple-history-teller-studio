const { chromium } = require('playwright-core');
const path = require('path');
const fs = require('fs');

const PROFILE_DIR = 'C:\\Users\\badiu\\.gemini\\antigravity\\scratch\\chrome_aistudio_profile_3';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:\\Users\\badiu\\.gemini\\antigravity\\brain\\522a240f-2122-4427-9348-850afc4de7cf';

(async () => {
  console.log('=== CHECKING YOUR PAGES ===');
  const ctx = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: false,
    executablePath: CHROME_PATH,
    args: ['--start-maximized', '--disable-blink-features=AutomationControlled'],
    viewport: null
  });

  const page = ctx.pages()[0] || await ctx.newPage();
  await page.goto('https://www.facebook.com/pages/?category=your_pages', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(5000);

  const shot = path.join(ARTIFACT_DIR, 'fb_your_pages_after_bn.png');
  await page.screenshot({ path: shot });
  console.log('Saved:', shot);

  const textSnippets = await page.evaluate(() => {
    return document.body.innerText.split('\n').map(s => s.trim()).filter(Boolean);
  });
  console.log('Text snippets:', textSnippets.slice(0, 40));

  await ctx.close();
})().catch(console.error);
