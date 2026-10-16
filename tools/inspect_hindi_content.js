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

  console.log('Navigating to Hindi Content tab in YouTube Studio...');
  await page.goto('https://studio.youtube.com/channel/UCkG4y9NJQ5yCys3jxFDUOcg/videos/upload', { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(5000);

  await page.screenshot({ path: 'tools/yt_hindi_content_tab.png' });

  // Get table rows text
  const rows = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('ytcp-video-row')).map(r => r.innerText.replace(/\n+/g, ' | '));
  });

  console.log('Hindi Channel Videos Count:', rows.length);
  rows.forEach((r, idx) => console.log(`Row ${idx + 1}: ${r}`));

  await ctx.close();
  process.exit(0);
})().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
