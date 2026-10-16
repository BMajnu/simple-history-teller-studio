const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const PROJECT_JSON = path.join(ROOT, 'projects', 'simple_itihash_002_first_language', 'project.json');
const RAW_DIR = path.join(ROOT, 'projects', 'simple_itihash_002_first_language', 'audio', 'raw_aistudio');

async function main() {
  const proj = JSON.parse(fs.readFileSync(PROJECT_JSON, 'utf8'));
  const shot48 = proj.scenes.find(s => s.scene_id === 48);
  const text = shot48.narration.bn;
  console.log('Target text for Shot 48:', text);

  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const page = await ctx.newPage();

  // Try signing in with badiuzzaman.majnu123@gmail.com
  console.log('Navigating to AddSession...');
  await page.goto('https://accounts.google.com/AddSession?hl=en&continue=https%3A%2F%2Faistudio.google.com%2F', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(3000);

  const emailInput = page.locator('input[type="email"]');
  if (await emailInput.count() > 0) {
    console.log('Entering email badiuzzaman.majnu123@gmail.com...');
    await emailInput.fill('badiuzzaman.majnu123@gmail.com');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(4000);

    const passInput = page.locator('input[type="password"]');
    if (await passInput.count() > 0) {
      console.log('Entering password...');
      await passInput.fill('***REMOVED***');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(6000);
    }
  }

  console.log('Current URL after login attempt:', page.url());
  await page.screenshot({ path: 'tools/after_login_attempt.png' });

  // Navigate to generate-speech
  console.log('Navigating to generate-speech...');
  await page.goto('https://aistudio.google.com/generate-speech?model=gemini-3.8-flash-tts', { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(3000);
  await page.keyboard.press('Escape');

  // Check card
  const hasCard = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('*')).some(el => el.innerText && el.innerText.trim() === 'Create new dialog');
  });
  if (hasCard) {
    console.log('Clicking Create new dialog...');
    await page.mouse.click(350, 420);
    await page.waitForTimeout(2000);
  }

  // Ensure Puck
  const chip = page.locator('button.voice-chip, button.voice-playground-chip').first();
  if (await chip.count() > 0) {
    const cur = await chip.innerText();
    console.log('Current voice:', cur.replace(/\n/g, ' '));
    if (!cur.toLowerCase().includes('puck')) {
      console.log('Switching to Puck...');
      await chip.click();
      await page.waitForTimeout(800);
      const search = page.locator('input[placeholder*="Search"]').first();
      if (await search.count() > 0) {
        await search.fill('Puck');
        await page.waitForTimeout(500);
      }
      const puckBtn = page.locator('button:has-text("Puck")').first();
      if (await puckBtn.count() > 0) {
        await puckBtn.click();
        await page.waitForTimeout(400);
      }
      const closeBtn = page.locator('button[aria-label="Close panel"], button.close-button, button:has-text("Done")').first();
      if (await closeBtn.count() > 0) {
        await closeBtn.click();
        await page.waitForTimeout(400);
      }
    }
  }

  const voiceAfter = await chip.innerText();
  console.log('Voice after check:', voiceAfter.replace(/\n/g, ' '));

  // Synthesize Shot 48
  const textarea = page.locator('textarea.textarea, textarea').first();
  await textarea.click();
  await textarea.fill(text);
  await page.waitForTimeout(300);

  const runBtn = page.locator('button.ctrl-enter-submits, button:has-text("Run")').first();
  await runBtn.click();
  console.log('Clicked Run, waiting for Shot 48...');

  let elapsed = 0;
  let newSrc = null;
  let prevLen = 0;
  let stableCount = 0;

  while (elapsed < 35000) {
    await page.waitForTimeout(1000);
    elapsed += 1000;

    const info = await page.evaluate(() => {
      const a = document.querySelector('audio');
      const btns = Array.from(document.querySelectorAll('button'));
      const stopBtn = btns.find(b => (b.innerText || '').includes('Stop') || (b.getAttribute('aria-label') || '').includes('Stop'));
      return {
        src: a ? a.src : '',
        readyState: a ? a.readyState : 0,
        hasStop: !!stopBtn
      };
    });

    if (info.src && info.src.startsWith('data:audio/wav;base64,')) {
      if (info.src.length === prevLen && info.src.length > 50000) {
        stableCount++;
        if (stableCount >= 2 && !info.hasStop) {
          newSrc = info.src;
          break;
        }
      } else {
        prevLen = info.src.length;
        stableCount = 0;
      }
    }
  }

  if (newSrc) {
    const b64 = newSrc.replace(/^data:audio\/wav;base64,/, '');
    const buf = Buffer.from(b64, 'base64');
    const targetFile = path.join(RAW_DIR, 'bn_shot_0048.wav');
    fs.writeFileSync(targetFile, buf);
    console.log(`🎉 SUCCESS: Shot 48 saved (${buf.length} bytes, Puck voice)`);
  } else {
    console.error('Failed to generate audio for Shot 48');
  }

  await page.close();
}

main().catch(console.error);
