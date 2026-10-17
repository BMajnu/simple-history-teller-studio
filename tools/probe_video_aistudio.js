const { chromium } = require('playwright-core');
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

  console.log('Testing video model on slot u/0 (PRO)...');
  const models = ['gemini-omni-1.1-flash', 'veo-3.1-fast-generate-preview', 'veo-3.1-generate-preview'];

  for (const m of models) {
    console.log(`\nNavigating to model: ${m}...`);
    try {
      await page.goto(`https://aistudio.google.com/u/0/prompts/new_chat?model=${m}`, { waitUntil: 'domcontentloaded', timeout: 20000 });
      await page.waitForTimeout(4000);
      const title = await page.title();
      const url = page.url();
      const bodySnippet = await page.evaluate(() => document.body.innerText.slice(0, 300));
      console.log(`Model: ${m} | URL: ${url} | Title: ${title}`);
      console.log(`Snippet: ${bodySnippet.replace(/\n+/g, ' ')}`);
      await page.screenshot({ path: path.join(__dirname, `probe_video_${m.replace(/[^a-z0-9]/gi, '_')}.png`) });
    } catch (e) {
      console.log(`Error on ${m}:`, e.message);
    }
  }

  await ctx.close();
  process.exit(0);
})().catch(console.error);
