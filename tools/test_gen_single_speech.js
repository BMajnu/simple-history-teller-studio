const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

const PROFILE_DIR = 'C:\\Users\\badiu\\.gemini\\antigravity\\scratch\\chrome_aistudio_profile_3';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const testText = "আমি সময়ের রক্ষক ইতিহাসের বিশাল গ্রন্থাগারে দাঁড়িয়ে গত পাঁচ হাজার বছরের মানবসভ্যতার হারানো গল্প তোমাদের শোনাতে এসেছি আজ নতুন আনন্দে হাসিমুখে।";

(async () => {
  console.log('Testing AI Studio Speech generation (Cruz with Old Story Teller style)...');
  const ctx = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: false,
    executablePath: CHROME_PATH,
    args: ['--start-maximized', '--disable-blink-features=AutomationControlled'],
    viewport: null
  });

  const page = ctx.pages()[0] || await ctx.newPage();
  await page.bringToFront();

  await page.goto('https://aistudio.google.com/u/1/generate-speech?model=gemini-3.8-flash-tts', { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(5000);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(500);

  // Dismiss onboarding dialog if present
  for (let c = 0; c < 3; c++) {
    const dlg = await page.locator('[role="dialog"], mat-dialog-container').count().catch(() => 0);
    if (dlg === 0) break;
    const cbs = await page.locator('[role="dialog"] input[type="checkbox"], mat-dialog-container input[type="checkbox"]').all().catch(() => []);
    for (const cb of cbs) { try { await cb.check({ force: true, timeout: 2000 }); } catch (e) {} }
    await page.waitForTimeout(600);
    try { await page.locator('[role="dialog"] button, mat-dialog-container button').filter({ hasText: 'Continue' }).first().click({ timeout: 4000 }); } catch (e) {}
    await page.waitForTimeout(2000);
  }

  // Click "Create new dialog" if present
  const cards = await page.$$('button, div, a');
  for (const c of cards) {
    const t = ((await c.innerText().catch(() => '')) || '').trim();
    if (t.includes('Create new dialog')) {
      console.log('Clicking Create new dialog...');
      await c.click().catch(() => {});
      break;
    }
  }
  await page.waitForTimeout(3000);

  // Select Cruz voice
  console.log('Selecting Cruz voice...');
  const spkBtn = page.locator('button').filter({ hasText: 'Speaker 1' }).first();
  if (await spkBtn.count() > 0) {
    await spkBtn.click();
    await page.waitForTimeout(1500);
    const searchBox = page.locator('.cdk-overlay-container input').first();
    await searchBox.waitFor({ state: 'visible', timeout: 6000 }).catch(() => {});
    await searchBox.fill('Cruz');
    await page.waitForTimeout(1000);
    const row = page.locator('.cdk-overlay-container').getByText('Cruz', { exact: true }).first();
    if (await row.count() > 0) await row.click().catch(() => {});
    await page.waitForTimeout(1000);
  }

  // Set Style Prompt: "An Old Story Teller, Old Man voice"
  try {
    const styleBtn = page.locator('button').filter({ hasText: 'Style' }).first();
    if (await styleBtn.count() > 0) {
      console.log('Setting Style prompt: An Old Story Teller, Old Man voice...');
      await styleBtn.click();
      await page.waitForTimeout(800);
      const styleInput = page.locator('input[placeholder*="style"], textarea[placeholder*="style"], input[placeholder*="Style"]').first();
      if (await styleInput.count() > 0) {
        await styleInput.fill('An Old Story Teller, Old Man voice');
        await page.waitForTimeout(400);
        await page.keyboard.press('Enter');
        await page.waitForTimeout(600);
      }
    }
  } catch(e) {
    console.log('Style prompt note:', e.message);
  }

  // Fill text
  console.log('Filling speech block text...');
  const ta = page.locator("textarea[aria-label='Speech block text'], textarea").first();
  await ta.waitFor({ state: 'visible', timeout: 10000 });
  await ta.fill(testText);
  await page.waitForTimeout(600);

  // Submit via Ctrl+Enter
  console.log('Triggering generation (Ctrl+Enter)...');
  await page.keyboard.press('Control+Enter');

  // Wait for audio
  console.log('Waiting for audio output...');
  let audioData = null;
  for (let i = 0; i < 40; i++) {
    await page.waitForTimeout(2000);
    const result = await page.evaluate(async () => {
      const aud = Array.from(document.querySelectorAll('audio')).find(a => a.duration > 1);
      if (!aud) return null;
      try {
        const res = await fetch(aud.src || aud.currentSrc);
        const blob = await res.blob();
        const ab = await blob.arrayBuffer();
        const bytes = new Uint8Array(ab);
        let bin = '';
        for (let k = 0; k < bytes.length; k++) bin += String.fromCharCode(bytes[k]);
        return { b64: btoa(bin), dur: aud.duration, size: bytes.length };
      } catch(e) { return { err: e.message }; }
    });
    if (result && result.b64) {
      audioData = result;
      break;
    }
  }

  if (audioData) {
    const rawDir = path.resolve('projects/simple_itihash_002_first_language/audio/raw');
    fs.mkdirSync(rawDir, { recursive: true });
    const outWav = path.join(rawDir, 'bn_shot_0001.wav');
    fs.writeFileSync(outWav, Buffer.from(audioData.b64, 'base64'));
    console.log(`SUCCESS! Saved test speech to ${outWav} (Duration: ${audioData.dur.toFixed(2)}s, Size: ${(audioData.size / 1024).toFixed(0)} KB)`);
  } else {
    console.log('Audio not ready. Taking debug screenshot...');
    await page.screenshot({ path: 'tools/debug_tts_state.png' });
  }

  await ctx.close();
  process.exit(0);
})().catch(err => {
  console.error(err);
  process.exit(1);
});
