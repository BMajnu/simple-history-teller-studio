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
  console.log('Target text for Shot 48:\n', text);

  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const page = browser.contexts()[0].pages()[0];
  console.log('Connected to page:', page.url());

  // Record old audio src
  const oldSrc = await page.evaluate(() => {
    const a = document.querySelector('audio');
    return a ? a.src : '';
  });
  console.log('Old audio src length:', oldSrc.length);

  // Click inside the text area
  // In the screenshot, the speech block text is inside the block
  const textarea = page.locator('textarea, div[contenteditable="true"], .speech-block-text, .text-input').first();
  await textarea.click();
  await page.keyboard.press('Control+A');
  await page.keyboard.press('Backspace');
  await page.waitForTimeout(300);
  
  // Fill new text
  await textarea.fill(text);
  await page.waitForTimeout(500);

  // Click Run button at bottom right: "Run Ctrl ↵"
  console.log('Clicking Run button...');
  const runBtn = page.locator('button:has-text("Run"), button.ctrl-enter-submits').first();
  await runBtn.click();

  console.log('Waiting for generation of Shot 48...');
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

    if (info.src && info.src.startsWith('data:audio/wav;base64,') && info.src !== oldSrc) {
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
    console.log(`🎉 SUCCESS: Shot 48 saved (${buf.length} bytes, Puck voice)!`);
  } else {
    console.error('Failed to get new audio src for Shot 48');
    await page.screenshot({ path: 'tools/shot48_failed_screen.png' });
  }
}

main().catch(console.error);
