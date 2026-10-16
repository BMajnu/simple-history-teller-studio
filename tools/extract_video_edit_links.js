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
  await page.goto('https://studio.youtube.com/channel/UCOzERwa3GJqO00B8LMTPtDg/videos/short', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(3000);

  const videoData = await page.evaluate(() => {
    const rows = Array.from(document.querySelectorAll('ytcp-video-row'));
    return rows.map(r => {
      const titleEl = r.querySelector('#video-title') || r.querySelector('a#video-title');
      const linkEl = r.querySelector('a[href*="/video/"]');
      const thumbImg = r.querySelector('ytcp-thumbnail img');
      return {
        title: titleEl ? titleEl.innerText.trim() : '',
        href: linkEl ? linkEl.getAttribute('href') : '',
        thumbSrc: thumbImg ? thumbImg.getAttribute('src') : '',
        rowText: r.innerText.slice(0, 100)
      };
    });
  });

  console.log('Video data:', JSON.stringify(videoData, null, 2));
  await ctx.close();
})();
