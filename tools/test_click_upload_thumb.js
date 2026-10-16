const { chromium } = require('playwright-core');

const PROFILE_DIR = 'C:\\Users\\badiu\\.gemini\\antigravity\\scratch\\chrome_aistudio_profile_3';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

(async () => {
  const ctx = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: false,
    executablePath: CHROME_PATH,
    args: ['--start-maximized', '--disable-blink-features=AutomationControlled'],
    viewport: null
  });

  const page = ctx.pages()[0] || await ctx.newPage();
  await page.bringToFront();

  console.log('Navigating to English video edit page...');
  await page.goto('https://studio.youtube.com/video/lNNFHePozVs/edit', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(6000);

  // Inspect thumbnail element
  const info = await page.evaluate(() => {
    const uploadBtn = document.querySelector('button#select-button, [aria-label*="Upload thumbnail"], ytcp-thumbnails-compact-editor');
    const inputs = Array.from(document.querySelectorAll('input[type="file"]')).map(i => ({
      id: i.id,
      accept: i.accept,
      name: i.name
    }));
    const questionIcon = document.querySelector('tp-yt-iron-icon[icon*="help"], ytcp-icon-button[aria-label*="Learn more"]');
    return {
      hasBtn: !!uploadBtn,
      btnHtml: uploadBtn ? uploadBtn.outerHTML.substring(0, 300) : null,
      inputs: inputs,
      hasHelp: !!questionIcon
    };
  });

  console.log('Thumbnail DOM info:', JSON.stringify(info, null, 2));

  // Let's click the upload button and see if a dialog appears or what happens
  const uploadBtn = page.locator('button#select-button, ytcp-button#select-button, div:has-text("Upload file")').first();
  console.log('Clicking upload button...');
  await uploadBtn.click();
  await page.waitForTimeout(3000);

  await page.screenshot({ path: 'tools/debug_thumb_click.png' });
  console.log('Screenshot saved to tools/debug_thumb_click.png');

  // Check if any dialog or modal opened
  const dialogInfo = await page.evaluate(() => {
    const dialog = document.querySelector('ytcp-dialog, tp-yt-paper-dialog, [role="dialog"]');
    return {
      hasDialog: !!dialog,
      dialogText: dialog ? dialog.innerText.substring(0, 300) : null
    };
  });
  console.log('Dialog info after click:', JSON.stringify(dialogInfo, null, 2));

  await ctx.close();
  process.exit(0);
})().catch(err => {
  console.error(err);
  process.exit(1);
});
