const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

const PROFILE_DIR = path.join(process.env.USERPROFILE, '.gemini', 'antigravity', 'scratch', 'chrome_aistudio_profile');
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

(async () => {
  const ctx = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: true,
    executablePath: CHROME_PATH,
    args: ['--headless=new', '--disable-blink-features=AutomationControlled', '--no-sandbox']
  });
  const page = ctx.pages()[0] || await ctx.newPage();

  page.on('console', msg => console.log(`[Console ${msg.type()}]`, msg.text()));

  page.on('request', req => {
    const url = req.url();
    if (url.includes('alkali') || url.includes('generate') || url.includes('speech') || url.includes('predict') || url.includes('stream')) {
      console.log(`[REQ] ${req.method()} ${url}`);
    }
  });

  page.on('response', async res => {
    const url = res.url();
    if (url.includes('alkali') || url.includes('generate') || url.includes('speech') || url.includes('predict') || url.includes('stream')) {
      console.log(`[RES] ${res.status()} ${url}`);
      try {
        const text = await res.text();
        console.log(`[RES BODY preview]:`, text.slice(0, 300));
      } catch (e) {}
    }
  });

  await page.goto('https://aistudio.google.com/u/0/generate-speech?model=gemini-3.8-flash-tts', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);

  const card = page.locator('[data-testid="create-new-dialog-card"]').first();
  await card.click();
  await page.waitForTimeout(2000);

  const ta = page.locator('textarea').first();
  await ta.fill('Three thousand years ago, the great civilizations fell.');
  await page.waitForTimeout(1000);

  await page.screenshot({ path: path.join(__dirname, 'clean_before_preview.png') });

  // Find the play button inside the block
  const playBtn = page.locator('button:has-text("play_arrow"), button[aria-label*="preview" i]').first();
  console.log('Clicking play/preview button in speech block...');
  await playBtn.click();
  await page.waitForTimeout(8000);

  await page.screenshot({ path: path.join(__dirname, 'clean_after_preview.png') });

  // Now also try Run button
  const runBtn = page.locator('button:has-text("Run")').first();
  console.log('Clicking Run button...');
  await runBtn.click({ force: true });
  await page.waitForTimeout(8000);

  await page.screenshot({ path: path.join(__dirname, 'clean_after_run.png') });

  const audios = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('audio')).map(a => ({
      src: a.src,
      currentSrc: a.currentSrc,
      duration: a.duration,
      paused: a.paused
    }));
  });
  console.log('Audios found:', JSON.stringify(audios, null, 2));

  await ctx.close();
  console.log('Done test_clean_speech.');
})().catch(err => {
  console.error(err);
  process.exit(1);
});
