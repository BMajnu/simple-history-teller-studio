const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright-core');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PROFILE_DIR = path.resolve(__dirname, '..', 'chrome_yt_sessions');

const seo = JSON.parse(fs.readFileSync(path.resolve(__dirname, '..', 'projects', 'simple_itihash_002_first_language', 'metadata', 'youtube_seo.json'), 'utf8'));
const OUT = {};

(async () => {
  const ctx = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: true, executablePath: CHROME_PATH,
    args: ['--headless=new', '--disable-blink-features=AutomationControlled', '--no-sandbox', '--window-size=1440,900'],
    viewport: { width: 1440, height: 900 },
  });
  const page = ctx.pages()[0] || await ctx.newPage();
  for (const lang of ['bn', 'en', 'hi']) {
    const { url } = seo.publish_log[lang];
    try {
      await page.goto(url + '&hl=en', { waitUntil: 'domcontentloaded', timeout: 60000 });
      await page.waitForTimeout(5000);
      const data = await page.evaluate(() => {
        const pr = window.ytInitialPlayerResponse || {};
        const mf = pr.microformat?.playerMicroformatRenderer || {};
        const vd = pr.videoDetails || {};
        return {
          title: vd.title || document.title,
          isPrivate: mf.isPrivate,
          publishDate: mf.publishDate,
          lengthSeconds: vd.lengthSeconds,
          description_head: (vd.shortDescription || '').slice(0, 120),
          chapters_count: ((vd.shortDescription || '').match(/^\S{1,8}:\d\d.*$/gm) || []).length,
          playability: pr.playabilityStatus?.status,
          familySafe: mf.isFamilySafe,
          category: mf.category,
        };
      });
      OUT[lang] = data;
      console.log(`[${lang}] "${data.title}" | private=${data.isPrivate} | chapters=${data.chapters_count} | ${data.lengthSeconds}s | ${data.playability}`);
    } catch (e) { OUT[lang] = { err: String(e.message).slice(0, 120) }; console.log(`[${lang}] ERR`); }
  }
  fs.writeFileSync(path.join(__dirname, '_yt_evidence', 'publish_check.json'), JSON.stringify(OUT, null, 2));
  await ctx.close();
  process.exit(0);
})().catch((e) => { console.error('FATAL', e.message); process.exit(1); });
