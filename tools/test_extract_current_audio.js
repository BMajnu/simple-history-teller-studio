const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

(async () => {
  try {
    const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
    const page = browser.contexts()[0].pages()[0];

    const audioDataUrl = await page.evaluate(() => {
      const audio = document.querySelector('audio');
      return audio ? audio.src : null;
    });

    if (!audioDataUrl || !audioDataUrl.startsWith('data:audio/wav;base64,')) {
      console.error('Audio data URL not found or invalid format');
      return;
    }

    const base64Data = audioDataUrl.replace(/^data:audio\/wav;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    const outPath = path.join(__dirname, '..', 'projects', 'simple_itihash_002_first_language', 'audio', 'raw_aistudio', 'bn_shot_0049.wav');
    fs.writeFileSync(outPath, buffer);
    console.log(`✓ SUCCESS! Extracted full AI Studio WAV to ${outPath} (${buffer.length} bytes, ${(buffer.length / 1024).toFixed(1)} KB)`);
  } catch (err) {
    console.error('Error:', err.message);
  }
})();
