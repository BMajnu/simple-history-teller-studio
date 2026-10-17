const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

const PROFILE_DIR = path.join(process.env.USERPROFILE, '.gemini', 'antigravity', 'scratch', 'chrome_aistudio_profile');
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

(async () => {
  console.log('Testing full synthesis pipeline on scene 1...');
  const ctx = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: true,
    executablePath: CHROME_PATH,
    args: [
      '--headless=new',
      '--disable-blink-features=AutomationControlled',
      '--no-sandbox',
      '--disable-infobars',
      '--window-size=1280,800',
      '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36'
    ],
    viewport: { width: 1280, height: 800 }
  });

  const page = ctx.pages()[0] || await ctx.newPage();

  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
    Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] });
    Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });
    window.chrome = {
      app: { isInstalled: false },
      runtime: {},
      loadTimes: function() {},
      csi: function() {}
    };
  });

  console.log('Navigating to AI Studio...');
  await page.goto('https://aistudio.google.com/u/0/generate-speech?model=gemini-3.8-flash-tts', { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(4000);

  // If create new dialog card exists, click it
  const createCard = page.locator('[data-testid="create-new-dialog-card"]').first();
  if (await createCard.count() > 0) {
    console.log('Clicking create-new-dialog-card...');
    await createCard.click();
    await page.waitForTimeout(3000);
  }

  // 1. Voice selection:
  // Scene 1 is TIME_CHRONICLER -> Cruz
  const targetVoice = 'Cruz';
  console.log(`Setting voice to: ${targetVoice}...`);
  const speakerBtn = page.locator('button:has-text("Speaker 1")').first();
  if (await speakerBtn.count() > 0) {
    const curText = await speakerBtn.innerText();
    console.log('Current speaker button:', curText);
    if (!curText.includes(targetVoice)) {
      await speakerBtn.click();
      await page.waitForTimeout(1000);

      const searchInput = page.locator('input[placeholder*="Search"]').first();
      if (await searchInput.count() > 0) {
        await searchInput.fill(targetVoice);
        await page.waitForTimeout(1000);
        // Look for the voice item in search results
        const voiceItem = page.locator(`.cdk-overlay-container, mat-drawer, mat-sidenav, [role="region"], div`).getByText(targetVoice, { exact: true }).first();
        if (await voiceItem.count() > 0) {
          console.log(`Found voice item ${targetVoice}, clicking...`);
          await voiceItem.click();
          await page.waitForTimeout(800);
        } else {
          console.log(`Could not find exact text ${targetVoice}`);
        }
      }
      // Close side panel / overlay if needed
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
    }
  }

  // 2. Style setting:
  console.log('Checking style button...');
  const styleBtn = page.locator('button:has-text("Style")').first();
  if (await styleBtn.count() > 0) {
    await styleBtn.click();
    await page.waitForTimeout(800);
    // Let's see what style options or inputs appeared
    const styleInputs = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('input, textarea, [role="menuitem"], [role="option"]')).map(e => ({
        tag: e.tagName,
        placeholder: e.placeholder || null,
        ariaLabel: e.getAttribute('aria-label') || null,
        text: e.innerText ? e.innerText.trim() : null
      })).filter(e => e.placeholder || e.ariaLabel || e.text);
    });
    console.log('Style popup elements:', JSON.stringify(styleInputs.slice(0, 15), null, 2));
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
  }

  // 3. Text area input:
  const testText = 'আজ থেকে ৩২০০ বছর আগে, ভূমধ্যসাগরীয় পৃথিবী ছিল এক উন্নত ও সমৃদ্ধ সভ্যতা।';
  console.log('Entering text into textarea...');
  const ta = page.locator('textarea[aria-label="Speech block text"], textarea').first();
  await ta.click();
  await ta.fill(testText);
  await page.waitForTimeout(500);

  await page.screenshot({ path: path.join(__dirname, 'before_run.png') });
  console.log('Saved before_run.png');

  // Track existing audio tags
  const prevAudios = await page.evaluate(() => Array.from(document.querySelectorAll('audio')).map(a => a.src || a.currentSrc));
  console.log('Initial audio count:', prevAudios.length);

  // 4. Click Run
  console.log('Triggering generation...');
  const runBtn = page.locator('button:has-text("Run")').first();
  if (await runBtn.count() > 0) {
    await runBtn.click();
  } else {
    await page.keyboard.press('Control+Enter');
  }

  // 5. Wait for audio element with new src or duration
  console.log('Waiting for synthesized audio...');
  let audioFound = null;
  for (let i = 0; i < 30; i++) {
    await page.waitForTimeout(2000);
    const result = await page.evaluate(async (prevs) => {
      const auds = Array.from(document.querySelectorAll('audio')).filter(a => a.duration > 0.5 && !isNaN(a.duration));
      if (auds.length === 0) return null;
      const fresh = auds.filter(a => !prevs.includes(a.src || a.currentSrc));
      const target = fresh.length > 0 ? fresh[fresh.length - 1] : auds[auds.length - 1];
      if (!target) return null;
      try {
        const res = await fetch(target.src || target.currentSrc);
        const blob = await res.blob();
        const ab = await blob.arrayBuffer();
        const bytes = new Uint8Array(ab);
        let bin = '';
        for (let k = 0; k < bytes.length; k++) bin += String.fromCharCode(bytes[k]);
        return { b64: btoa(bin), dur: target.duration, size: bytes.length, src: target.src };
      } catch (e) {
        return { err: e.message, src: target.src, dur: target.duration };
      }
    }, prevAudios);

    if (result) {
      console.log(`Poll ${i + 1}: Found audio! Duration: ${result.dur}s, Size: ${result.size || 0} bytes`);
      if (result.b64) {
        audioFound = result;
        break;
      }
    } else {
      process.stdout.write('.');
    }
  }

  await page.screenshot({ path: path.join(__dirname, 'after_run.png') });

  if (audioFound && audioFound.b64) {
    const outPath = path.join(__dirname, 'test_scene_0001.wav');
    fs.writeFileSync(outPath, Buffer.from(audioFound.b64, 'base64'));
    console.log(`\nSUCCESS! Audio saved to: ${outPath} (${audioFound.dur.toFixed(1)}s, ${fs.statSync(outPath).size} bytes)`);
  } else {
    console.log('\nCould not extract audio or timed out.');
  }

  await ctx.close();
  console.log('Test completed.');
})().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
