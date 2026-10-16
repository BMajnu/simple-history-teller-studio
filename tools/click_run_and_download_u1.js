const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const VISUAL_DIR = path.join(ROOT, 'projects', 'sample_first_king', 'visual_assets');
const outPath = path.join(VISUAL_DIR, 'clip_scene_0001.mp4');

async function clickRunAndDownload() {
  console.log('Connecting to browser on 9224...');
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const page = browser.contexts()[0].pages()[0];

  console.log('Current URL:', page.url());

  // Click Run button
  const runBtn = page.locator('button.ctrl-enter-submits, button:has-text("Run")').first();
  console.log('Clicking Run button...');
  await runBtn.click();
  console.log('Run clicked! Monitoring generation...');

  let videoSrc = null;
  const t0 = Date.now();

  for (let i = 0; i < 60; i++) {
    await page.waitForTimeout(3000);
    try {
      const state = await page.evaluate(() => {
        const vid = document.querySelector('video');
        const stop = Array.from(document.querySelectorAll('button')).some(b => (b.innerText || '').includes('Stop'));
        const err = document.querySelector('.error-message, mat-error, [role="alert"]');
        return {
          hasVid: !!vid && !!vid.src,
          src: vid ? vid.src : null,
          hasStop: stop,
          err: err ? err.innerText : null
        };
      });

      const elapsed = Math.round((Date.now() - t0) / 1000);
      console.log(`[${elapsed}s] StopBtn: ${state.hasStop} | VideoElement: ${state.hasVid}`);

      if (state.err) {
        throw new Error(`AI Studio error: ${state.err}`);
      }

      if (state.hasVid && !state.hasStop) {
        videoSrc = state.src;
        console.log(`🎉 Video successfully generated in ${elapsed}s!`);
        break;
      }
    } catch (e) {
      console.warn('Poll notice:', e.message);
    }
  }

  if (!videoSrc) {
    const vSrc = await page.evaluate(() => {
      const v = document.querySelector('video');
      return v ? v.src : null;
    });
    if (vSrc) videoSrc = vSrc;
  }

  if (!videoSrc) {
    await page.screenshot({ path: 'tools/generation_timeout.png' });
    throw new Error('Video generation timed out!');
  }

  console.log('Extracting video blob from:', videoSrc);
  const videoBase64 = await page.evaluate(async (src) => {
    const res = await fetch(src);
    const blob = await res.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result.split(',')[1]);
      reader.readAsDataURL(blob);
    });
  }, videoSrc);

  const buffer = Buffer.from(videoBase64, 'base64');
  fs.writeFileSync(outPath, buffer);
  console.log(`💾 Saved genuine AI video to: ${outPath} (${(buffer.length / (1024 * 1024)).toFixed(2)} MB)`);

  await page.screenshot({ path: 'tools/u1_video_success.png' });
  console.log('Saved tools/u1_video_success.png');
}

clickRunAndDownload().catch(console.error);
