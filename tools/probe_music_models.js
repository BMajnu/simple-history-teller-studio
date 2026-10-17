const { chromium } = require('playwright-core');
const path = require('path');

const PROFILE_DIR = path.join(process.env.USERPROFILE, '.gemini', 'antigravity', 'scratch', 'chrome_aistudio_profile');
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

(async () => {
  console.log('Probing Music generation options on slot u/0 (PRO)...');
  const ctx = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: false,
    executablePath: CHROME_PATH,
    args: ['--disable-blink-features=AutomationControlled', '--no-sandbox'],
    viewport: { width: 1366, height: 850 }
  });

  const page = ctx.pages()[0] || await ctx.newPage();

  // Test 1: AI Studio new_music
  console.log('\n--- 1. Testing AI Studio new_music ---');
  try {
    await page.goto('https://aistudio.google.com/u/0/prompts/new_music?model=lyria-3.5', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(5000);
    console.log('AI Studio Music URL:', page.url(), '| Title:', await page.title());
    await page.screenshot({ path: path.join(__dirname, 'probe_aistudio_music.png') });
    console.log('Saved probe_aistudio_music.png');
  } catch (e) {
    console.log('AI Studio Music error:', e.message);
  }

  // Test 2: AI Studio app/new_music
  console.log('\n--- 2. Testing AI Studio app/new_music ---');
  try {
    await page.goto('https://aistudio.google.com/app/new_music?model=lyria-3.5', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(5000);
    console.log('AI Studio App Music URL:', page.url(), '| Title:', await page.title());
    await page.screenshot({ path: path.join(__dirname, 'probe_app_music.png') });
    console.log('Saved probe_app_music.png');
  } catch (e) {
    console.log('AI Studio App Music error:', e.message);
  }

  // Test 3: Flow Music link from flow.google.com
  console.log('\n--- 3. Testing Flow Music ---');
  try {
    await page.goto('https://flow.google.com/', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(4000);
    const flowMusicBtn = page.locator('button, a').filter({ hasText: 'Flow Music' }).first();
    if (await flowMusicBtn.count() > 0) {
      console.log('Found Flow Music button! Clicking...');
      await flowMusicBtn.click();
      await page.waitForTimeout(5000);
      console.log('Flow Music URL:', page.url(), '| Title:', await page.title());
      await page.screenshot({ path: path.join(__dirname, 'probe_flow_music.png') });
      console.log('Saved probe_flow_music.png');
    }
  } catch (e) {
    console.log('Flow Music error:', e.message);
  }

  await ctx.close();
  process.exit(0);
})().catch(err => {
  console.error(err);
  process.exit(1);
});
