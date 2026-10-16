const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const PROJECT_DIR = path.join(ROOT, 'projects', 'simple_itihash_002_first_language');
const PROJECT_JSON = path.join(PROJECT_DIR, 'project.json');
const RAW_DIR = path.join(PROJECT_DIR, 'audio', 'raw_aistudio');

async function testScene49() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const page = browser.contexts()[0].pages()[0];
  
  const createCard = page.locator('text="Create new dialog"').first();
  if (await createCard.isVisible().catch(() => false)) {
    console.log('Clicking Create new dialog...');
    await createCard.click();
    await page.waitForTimeout(2000);
  }

  const project = JSON.parse(fs.readFileSync(PROJECT_JSON, 'utf8'));
  const scene49 = project.scenes.find(s => s.scene_id === 49);
  console.log('Synthesizing Scene 49:', scene49.narration.bn);

  const textarea = page.locator('textarea[aria-label="Speech block text"], textarea').first();
  await textarea.waitFor({ timeout: 10000 });
  await textarea.focus();
  await textarea.fill(scene49.narration.bn);
  await page.waitForTimeout(300);

  const oldSrc = await page.evaluate(() => document.querySelector('audio')?.src || '');

  const runBtn = page.locator('button.ctrl-enter-submits, button:has-text("Run")').first();
  await runBtn.click();
  console.log('Clicked Run button!');

  let completed = false;
  for (let i = 0; i < 40; i++) {
    await page.waitForTimeout(1000);
    const isStillRunning = await page.locator('button:has-text("Stop")').count() > 0;
    const currentSrc = await page.evaluate(() => document.querySelector('audio')?.src || '');
    const audioDuration = await page.evaluate(() => document.querySelector('audio')?.duration || 0);

    if (!isStillRunning && currentSrc && currentSrc !== oldSrc && audioDuration > 0.5) {
      completed = true;
      console.log(`✓ Audio generated! Duration: ${audioDuration}s`);
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

    const outFile = path.join(RAW_DIR, 'bn_shot_0049.wav');
    fs.writeFileSync(outFile, Buffer.from(b64, 'base64'));
    console.log(`✓ Saved Shot 49: ${outFile} (${fs.statSync(outFile).size} bytes)`);
  } else {
    console.log('Failed to generate in time. Taking screenshot...');
    await page.screenshot({ path: 'tools/scene49_fail_state.png' });
  }
}

testScene49().catch(console.error);
