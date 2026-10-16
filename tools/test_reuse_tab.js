const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

(async () => {
  try {
    const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
    const page = browser.contexts()[0].pages()[0];

    const s50Text = "কিন্তু মানুষের স্বরতন্ত্র কথা বলার জন্য গলার অনেক নিচে নেমে এসেছে। ফলে খাদ্যনালী ও শ্বাসনালী এক জায়গায় মিলে গেছে—যে কারণে আমরা প্রতি বছর হাজার হাজার মানুষ বিষম খেয়ে মারা যাই!";

    console.log('Focusing textarea and replacing text with Shot 50...');
    const textarea = page.locator('textarea.textarea, textarea').first();
    await textarea.fill(s50Text);
    await page.waitForTimeout(400);

    // Get previous audio src to ensure we wait for a NEW one
    const prevSrc = await page.evaluate(() => {
      const a = document.querySelector('audio');
      return a ? a.src : '';
    });

    console.log('Clicking Run for Shot 50...');
    const runBtn = page.locator('button.ctrl-enter-submits, button:has-text("Run")').first();
    await runBtn.click();

    console.log('Waiting for new audio generation...');
    let success = false;
    for (let i = 0; i < 40; i++) {
      await page.waitForTimeout(1000);
      const state = await page.evaluate((oldSrc) => {
        const stop = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Stop'));
        const a = document.querySelector('audio');
        const hasNewAudio = a && a.src && a.src !== oldSrc && a.src.startsWith('data:audio/wav;base64,');
        return { hasStop: !!stop, hasNewAudio };
      }, prevSrc);

      process.stdout.write(`[${i}s: stop=${state.hasStop}, newAudio=${state.hasNewAudio}] `);
      if (!state.hasStop && state.hasNewAudio) {
        success = true;
        break;
      }
    }

    console.log('\nResult for Shot 50:', success);

    if (success) {
      const dataUrl = await page.evaluate(() => document.querySelector('audio').src);
      const b64 = dataUrl.replace(/^data:audio\/wav;base64,/, '');
      const buf = Buffer.from(b64, 'base64');
      const outFile = path.join(__dirname, '..', 'projects', 'simple_itihash_002_first_language', 'audio', 'raw_aistudio', 'bn_shot_0050.wav');
      fs.writeFileSync(outFile, buf);
      console.log(`✓ Shot 50 saved: ${outFile} (${buf.length} bytes)`);
    } else {
      await page.screenshot({ path: 'tools/shot50_fail.png' });
    }
  } catch (err) {
    console.error('Error:', err);
  }
})();
