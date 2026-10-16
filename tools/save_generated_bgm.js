const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const PROJECT_DIR = path.join(ROOT, 'projects', 'simple_itihash_002_first_language');
const OUT_BGM = path.join(PROJECT_DIR, 'audio', 'bgm.mp3');
const FFMPEG = path.join(ROOT, 'bin', 'ffmpeg.exe');

async function saveBGM() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const pages = browser.contexts()[0].pages();
  const musicPage = pages.find(p => p.url().includes('new_music'));
  if (!musicPage) {
    throw new Error('Music page not found!');
  }

  console.log('Extracting audio from music page...');
  const audioInfo = await musicPage.evaluate(() => {
    const a = document.querySelector('audio');
    return {
      src: a ? a.src : null,
      duration: a ? a.duration : 0
    };
  });
  console.log('Audio info:', audioInfo);

  // Method 1: direct fetch blob
  if (audioInfo.src) {
    const b64 = await musicPage.evaluate(async (url) => {
      const resp = await fetch(url);
      const buf = await resp.arrayBuffer();
      const bytes = new Uint8Array(buf);
      let bin = '';
      for (let i = 0; i < bytes.byteLength; i++) bin += String.fromCharCode(bytes[i]);
      return btoa(bin);
    }, audioInfo.src);

    if (b64 && b64.length > 1000) {
      const tempWav = path.join(PROJECT_DIR, 'audio', 'raw_bgm_lyria.wav');
      fs.writeFileSync(tempWav, Buffer.from(b64, 'base64'));
      console.log(`Saved raw Lyria music: ${tempWav} (${fs.statSync(tempWav).size} bytes)`);

      // Convert or normalize to 192k MP3 bgm.mp3
      console.log('Encoding to broadcast-grade MP3 bgm.mp3...');
      const r = spawnSync(FFMPEG, [
        '-hide_banner', '-y',
        '-i', tempWav,
        '-af', 'volume=1.0',
        '-c:a', 'libmp3lame',
        '-b:a', '192k',
        OUT_BGM
      ], { encoding: 'utf8' });

      if (fs.existsSync(OUT_BGM) && fs.statSync(OUT_BGM).size > 10000) {
        console.log(`✓ Master BGM successfully saved: ${OUT_BGM} (${fs.statSync(OUT_BGM).size} bytes)`);
        return;
      }
    }
  }

  // Method 2: Click download button
  console.log('Attempting download button click...');
  const [ download ] = await Promise.all([
    musicPage.waitForEvent('download', { timeout: 10000 }).catch(() => null),
    musicPage.locator('button:has-text("download"), button[aria-label*="download"], button:has(mat-icon:has-text("download"))').first().click().catch(() => null)
  ]);

  if (download) {
    const dlPath = await download.path();
    fs.copyFileSync(dlPath, OUT_BGM);
    console.log(`✓ Master BGM downloaded and saved to: ${OUT_BGM}`);
  }
}

saveBGM().catch(console.error);
