const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

const PROFILE_DIR = path.join(process.env.USERPROFILE, '.gemini', 'antigravity', 'scratch', 'chrome_aistudio_profile');
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

(async () => {
  const ctx = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: false,
    executablePath: CHROME_PATH,
    args: ['--disable-blink-features=AutomationControlled', '--no-sandbox'],
    viewport: { width: 1280, height: 800 }
  });

  const page = ctx.pages()[0] || await ctx.newPage();

  let chunks = [];

  page.on('response', async res => {
    const url = res.url();
    if (url.includes('GenerateContent') && res.status() === 200) {
      try {
        const text = await res.text();
        fs.writeFileSync(path.join(__dirname, 'raw_response.txt'), text);
        console.log(`Saved raw_response.txt (${text.length} chars)`);

        // Find all base64 occurrences
        const regex = /\["audio\/l16[^"]*",\s*"([^"]+)"\]/g;
        let m;
        while ((m = regex.exec(text)) !== null) {
          chunks.push(m[1]);
        }
        console.log(`Extracted ${chunks.length} audio chunks!`);
      } catch (e) {
        console.error('Error reading response:', e.message);
      }
    }
  });

  await page.goto('https://aistudio.google.com/u/0/generate-speech?model=gemini-3.8-flash-tts', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);

  const card = page.locator('[data-testid="create-new-dialog-card"]').first();
  if (await card.count() > 0) {
    await card.click();
    await page.waitForTimeout(2000);
  }

  const scene1Text = 'আজ থেকে ৩২০০ বছর আগে, ভূমধ্যসাগরীয় পৃথিবী ছিল এক উন্নত ও সমৃদ্ধ সভ্যতা।';
  const ta = page.locator('textarea').first();
  await ta.click();
  await ta.fill(scene1Text);
  await page.waitForTimeout(1000);

  const runBtn = page.locator('button:has-text("Run")').first();
  await runBtn.click();
  await page.waitForTimeout(12000);

  if (chunks.length > 0) {
    // Combine all chunks into one PCM buffer
    const buffers = chunks.map(c => Buffer.from(c, 'base64'));
    const totalPcm = Buffer.concat(buffers);
    console.log(`Total PCM bytes: ${totalPcm.length}`);
    const durSec = (totalPcm.length / 2 / 24000).toFixed(2);
    console.log(`Calculated duration: ${durSec} seconds`);
  }

  await ctx.close();
  console.log('Done chunk test.');
})().catch(err => {
  console.error(err);
  process.exit(1);
});
