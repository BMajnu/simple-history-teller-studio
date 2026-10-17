const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

const PROFILE_DIR = path.join(process.env.USERPROFILE, '.gemini', 'antigravity', 'scratch', 'chrome_aistudio_profile');
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

function pcmToWav(pcmBuffer, sampleRate = 24000, numChannels = 1, bitDepth = 16) {
  const byteRate = sampleRate * numChannels * (bitDepth / 8);
  const blockAlign = numChannels * (bitDepth / 8);
  const dataSize = pcmBuffer.length;
  const buffer = Buffer.alloc(44 + dataSize);

  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20); // PCM
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(bitDepth, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);
  pcmBuffer.copy(buffer, 44);

  return buffer;
}

(async () => {
  console.log('Testing Scene 1 TTS generation with Cruz voice...');
  const ctx = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: false,
    executablePath: CHROME_PATH,
    args: ['--disable-blink-features=AutomationControlled', '--no-sandbox'],
    viewport: { width: 1280, height: 800 }
  });

  const page = ctx.pages()[0] || await ctx.newPage();

  let capturedPcmBase64 = null;
  let capturedMime = null;

  page.on('response', async res => {
    const url = res.url();
    if (url.includes('GenerateContent') && res.status() === 200) {
      try {
        const text = await res.text();
        // Extract base64 audio data from JSON structure
        const match = text.match(/\["audio\/l16[^"]*",\s*"([^"]+)"\]/);
        if (match && match[1]) {
          capturedPcmBase64 = match[1];
          capturedMime = 'audio/l16';
          console.log(`✓ Intercepted audio payload! Base64 length: ${capturedPcmBase64.length}`);
        }
      } catch (e) {
        console.error('Error parsing response:', e.message);
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

  // Set speaker to Cruz
  const speakerBtn = page.locator('button:has-text("Speaker 1")').first();
  if (await speakerBtn.count() > 0) {
    const cur = await speakerBtn.innerText();
    if (!cur.includes('Cruz')) {
      console.log('Opening voice selector for Cruz...');
      await speakerBtn.click();
      await page.waitForTimeout(1000);
      const search = page.locator('input[placeholder*="Search"]').first();
      if (await search.count() > 0) {
        await search.fill('Cruz');
        await page.waitForTimeout(800);
        // Click Cruz in the list
        const cruzItem = page.locator('text=Cruz').first();
        if (await cruzItem.count() > 0) {
          await cruzItem.click();
          await page.waitForTimeout(600);
          console.log('Selected Cruz!');
        }
      }
      // Close side panel
      const closeBtn = page.locator('button[aria-label="Close"], button:has-text("close")').first();
      if (await closeBtn.count() > 0) await closeBtn.click();
      else await page.keyboard.press('Escape');
      await page.waitForTimeout(800);
    }
  }

  // Fill text
  const scene1Text = 'আজ থেকে ৩২০০ বছর আগে, ভূমধ্যসাগরীয় পৃথিবী ছিল এক উন্নত ও সমৃদ্ধ সভ্যতা।';
  console.log(`Injecting Scene 1 text: "${scene1Text}"`);
  const ta = page.locator('textarea').first();
  await ta.click();
  await ta.fill(scene1Text);
  await page.waitForTimeout(1000);

  // Click Run
  console.log('Clicking Run button...');
  const runBtn = page.locator('button:has-text("Run")').first();
  await runBtn.click();

  // Wait for intercepted audio payload
  for (let i = 0; i < 20; i++) {
    if (capturedPcmBase64) break;
    await page.waitForTimeout(1000);
    process.stdout.write('.');
  }

  if (capturedPcmBase64) {
    const pcmBuf = Buffer.from(capturedPcmBase64, 'base64');
    const wavBuf = pcmToWav(pcmBuf, 24000, 1, 16);
    const outPath = path.join(__dirname, 'scene_0001_cruz_test.wav');
    fs.writeFileSync(outPath, wavBuf);
    const durSec = (pcmBuf.length / 2 / 24000).toFixed(2);
    console.log(`\n🎉 SUCCESS! Generated Scene 1: ${outPath} (${durSec}s, ${wavBuf.length} bytes)`);
  } else {
    console.log('\nFailed to capture audio payload within timeout.');
  }

  await ctx.close();
  console.log('Done test.');
})().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
