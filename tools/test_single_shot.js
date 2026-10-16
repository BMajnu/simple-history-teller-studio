const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const PROJECT_DIR = path.join(ROOT, 'projects', 'simple_itihash_002_first_language');
const PROJECT_JSON = path.join(PROJECT_DIR, 'project.json');
const RAW_DIR = path.join(PROJECT_DIR, 'audio', 'raw_aistudio');

async function testSingleShot() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const page = browser.contexts()[0].pages()[0];
  console.log('Main page URL:', page.url());
  
  if (!page.url().includes('generate-speech')) {
    await page.goto('https://aistudio.google.com/generate-speech?model=gemini-3.8-flash-tts', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
  }
  
  // Close any modal
  await page.keyboard.press('Escape');
  const closeBtn = page.locator('button[aria-label="Close"], button[aria-label="Close dialog"]').first();
  if (await closeBtn.isVisible().catch(() => false)) {
    await closeBtn.click();
    console.log('Clicked close dialog button.');
  }

  const project = JSON.parse(fs.readFileSync(PROJECT_JSON, 'utf8'));
  const scene50 = project.scenes.find(s => s.scene_id === 50);
  console.log('Testing Scene 50 text:', scene50.narration.bn);

  const textarea = page.locator('textarea[aria-label="Speech block text"], textarea').first();
  await textarea.waitFor({ timeout: 10000 });
  await textarea.focus();
  await textarea.fill(scene50.narration.bn);
  await page.waitForTimeout(300);

  const runBtn = page.locator('button.ctrl-enter-submits, button:has-text("Run")').first();
  await runBtn.click();
  console.log('Clicked Run...');

  const oldSrc = await page.evaluate(() => document.querySelector('audio')?.src || '');

  let completed = false;
  for (let i = 0; i < 30; i++) {
    await page.waitForTimeout(1000);
    const isStillRunning = await page.locator('button:has-text("Stop")').count() > 0;
    const currentSrc = await page.evaluate(() => document.querySelector('audio')?.src || '');
    const audioDuration = await page.evaluate(() => document.querySelector('audio')?.duration || 0);

    if (!isStillRunning && currentSrc && currentSrc !== oldSrc && audioDuration > 0.5) {
      completed = true;
      console.log(`Generated! Duration: ${audioDuration}s`);
      break;
    }
  }

  if (completed) {
    const b64 = await page.evaluate(async () => {
      const audio = document.querySelector('audio');
      if (!audio || !audio.src) return null;
      const resp = await fetch(audio.src);
      const buf = await resp.arrayBuffer();
      const bytes = new Uint8Array(buf);
      let bin = '';
      for (let i = 0; i < bytes.byteLength; i++) bin += String.fromCharCode(bytes[i]);
      return btoa(bin);
    });

    const outFile = path.join(RAW_DIR, 'bn_shot_0050.wav');
    fs.writeFileSync(outFile, Buffer.from(b64, 'base64'));
    console.log(`✓ Shot 50 successfully saved to ${outFile} (${fs.statSync(outFile).size} bytes)`);
  } else {
    console.log('Did not complete in 30s. Checking screenshot...');
    const shot = await page.screenshot({ type: 'png' });
    fs.writeFileSync('tools/test_single_state.png', shot);
  }
}

testSingleShot().catch(console.error);
