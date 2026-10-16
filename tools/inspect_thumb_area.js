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
  await page.goto('https://studio.youtube.com/video/Kuc5FRoYJW0/edit', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(4000);

  const thumbHtml = await page.evaluate(() => {
    const el = document.querySelector('ytcp-thumbnails-compact-editor, ytcp-video-thumbnail-editor, [test-id="thumbnail-editor"]') || document.querySelector('#thumbnail');
    return el ? el.outerHTML : document.body.innerHTML.slice(0, 500);
  });

  console.log('Thumbnail container HTML length:', thumbHtml.length);
  require('fs').writeFileSync('tools/thumb_container.html', thumbHtml);

  await ctx.close();
})();
