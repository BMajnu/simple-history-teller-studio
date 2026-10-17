// Per-language Google AI Studio TTS runner (playwright), modeled on
// tools/generate_all_bn_tts.js (bronze age). Runs ONE language per invocation
// and is resumable (skips wav files that already exist and exceed 15KB).
//
// Usage:
//   node tools/generate_project_tts.js <project_id> <lang>   // lang: bn | en | hi
//
// Example:
//   node tools/generate_project_tts.js simple_itihash_004_first_city bn
//
// Voice/style source: projects/<id>/CHARACTER_VOICE_MAP.json — supports both the
// `cast` object shape (bronze age) and the `characters` array shape (studio default).
const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

const ID = process.argv[2] || 'simple_itihash_004_first_city';
const LANG = (process.argv[3] || 'bn').toLowerCase();
if (!['bn', 'en', 'hi'].includes(LANG)) {
  console.error('lang must be bn, en or hi');
  process.exit(1);
}

const PROFILE_DIR = path.join(process.env.USERPROFILE, '.gemini', 'antigravity', 'scratch', 'chrome_aistudio_profile');
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ROOT = path.resolve(__dirname, '..');
const PROJ = path.join(ROOT, 'projects', ID);
const OUT_DIR = path.join(PROJ, 'audio', LANG);

if (!fs.existsSync(path.join(PROJ, 'project.json'))) {
  console.error(`project.json not found for ${ID}`);
  process.exit(1);
}
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

const project = JSON.parse(fs.readFileSync(path.join(PROJ, 'project.json'), 'utf8'));
const voiceMapJson = JSON.parse(fs.readFileSync(path.join(PROJ, 'CHARACTER_VOICE_MAP.json'), 'utf8'));

function buildVoiceMap(vm) {
  const map = {};
  if (vm.cast && typeof vm.cast === 'object') {
    for (const [k, v] of Object.entries(vm.cast)) {
      map[k] = { voice_id: v.voice_id || v.aistudio_voice || 'Charon', style_prompt: v.style_prompt || 'An Authoritative Documentary Narrator, Deep Resonant voice' };
    }
    return map;
  }
  for (const c of vm.characters || []) {
    map[c.id] = {
      voice_id: c.aistudio_voice || c.voice_id || 'Charon',
      style_prompt: c.style_prompt || 'An Authoritative Documentary Narrator, Deep Resonant voice'
    };
  }
  return map;
}
const voiceMap = buildVoiceMap(voiceMapJson);

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
  buffer.writeUInt16LE(1, 20);
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
  console.log(`================================================================================`);
  console.log(`GOOGLE AI STUDIO PRO TTS GENERATION`);
  console.log(`Project: ${ID} | Language: ${LANG} | Model: gemini-3.8-flash-tts | Scenes: ${project.scenes.length}`);
  console.log(`Output Directory: ${OUT_DIR}`);
  console.log(`================================================================================\n`);

  const ctx = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: false,
    executablePath: CHROME_PATH,
    args: [
      '--disable-blink-features=AutomationControlled',
      '--no-sandbox',
      '--window-position=50,50',
      '--window-size=1200,800'
    ],
    viewport: { width: 1200, height: 800 }
  });

  const page = ctx.pages()[0] || await ctx.newPage();

  let activeChunks = [];
  let responseFinished = false;

  page.on('response', async res => {
    const url = res.url();
    if (url.includes('GenerateContent') && res.status() === 200) {
      try {
        const text = await res.text();
        const regex = /\["audio\/l16[^"]*",\s*"([^"]+)"\]/g;
        let m;
        let count = 0;
        while ((m = regex.exec(text)) !== null) {
          activeChunks.push(m[1]);
          count++;
        }
        if (count > 0) responseFinished = true;
      } catch (e) {}
    }
  });

  console.log('Navigating to Google AI Studio Speech Playground...');
  await page.goto('https://aistudio.google.com/u/0/generate-speech?model=gemini-3.8-flash-tts', { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(4000);

  const card = page.locator('[data-testid="create-new-dialog-card"]').first();
  if (await card.count() > 0) {
    await card.click();
    await page.waitForTimeout(2000);
  }

  const ta = page.locator('textarea').first();
  await ta.waitFor({ state: 'visible', timeout: 15000 });

  let currentVoice = 'Fola';
  let currentStyle = '';
  let completedCount = 0;
  let skippedCount = 0;
  let failedIds = [];

  const total = project.scenes.length;

  for (let i = 0; i < total; i++) {
    const scene = project.scenes[i];
    const pad = String(scene.scene_id).padStart(4, '0');
    const outFile = path.join(OUT_DIR, `scene_${pad}.wav`);
    const label = `[Scene ${scene.scene_id}/${total}]`;

    if (fs.existsSync(outFile) && fs.statSync(outFile).size > 15000) {
      console.log(`${label} (Skipping, already generated: ${(fs.statSync(outFile).size / 1024).toFixed(1)} KB)`);
      skippedCount++;
      continue;
    }

    const speakerKey = scene.dialogue_speaker || 'NARRATOR';
    const charMeta = voiceMap[speakerKey] || { voice_id: 'Charon', style_prompt: 'An Authoritative Documentary Narrator, Deep Resonant voice' };
    const targetVoice = charMeta.voice_id;
    const targetStyle = charMeta.style_prompt;
    const text = (scene.narration && scene.narration[LANG] || '').trim();
    if (!text) {
      console.warn(`${label} WARN: no ${LANG.toUpperCase()} narration, skipping`);
      continue;
    }

    console.log(`\n--------------------------------------------------------------------------------`);
    console.log(`${label} Speaker: ${speakerKey} | Voice: ${targetVoice} | Style: "${targetStyle}"`);
    console.log(`Narration: "${text}"`);

    if (currentVoice !== targetVoice) {
      console.log(`  -> Switching voice: [${currentVoice}] -> [${targetVoice}]...`);
      const speakerBtn = page.locator('button:has-text("Speaker 1")').first();
      await speakerBtn.click();
      await page.waitForTimeout(800);

      const searchInput = page.locator('input[placeholder*="Search"]').first();
      if (await searchInput.count() > 0) {
        await searchInput.fill(targetVoice);
        await page.waitForTimeout(600);

        const voiceOption = page.locator(`.cdk-overlay-container, mat-drawer, mat-sidenav, [role="region"], div`).getByText(targetVoice, { exact: true }).first();
        if (await voiceOption.count() > 0) {
          await voiceOption.click();
          await page.waitForTimeout(400);
          currentVoice = targetVoice;
          console.log(`  OK Voice set to ${targetVoice}`);
        }
      }

      const closeBtn = page.locator('button[aria-label="Close"], button:has-text("close")').first();
      if (await closeBtn.count() > 0) await closeBtn.click();
      else await page.keyboard.press('Escape');
      await page.waitForTimeout(600);
    }

    if (currentStyle !== targetStyle) {
      console.log(`  -> Setting voice style direction: "${targetStyle}"...`);
      const styleBtn = page.locator('button:has-text("Style"), button:has-text("An Old Story"), button:has-text("An Authoritative"), button:has-text("deep, resonant")').first();
      await styleBtn.click();
      await page.waitForTimeout(800);

      const styleTa = page.locator('textarea[placeholder*="Describe the voice style"], textarea[aria-label="Describe the voice style"]').first();
      if (await styleTa.count() > 0) {
        await styleTa.fill(targetStyle);
        await page.waitForTimeout(400);
        await page.keyboard.press('Enter');
        await page.waitForTimeout(400);
        await page.keyboard.press('Escape');
        await page.waitForTimeout(600);
        currentStyle = targetStyle;
        console.log(`  OK Style prompt applied: "${targetStyle}"`);
      }
    }

    activeChunks = [];
    responseFinished = false;

    await ta.click();
    await ta.fill(text);
    await page.waitForTimeout(300);

    const runBtn = page.locator('button:has-text("Run")').first();
    await runBtn.click();

    const startTime = Date.now();
    let gotAudio = false;
    while (Date.now() - startTime < 35000) {
      if (responseFinished && activeChunks.length > 0) {
        gotAudio = true;
        break;
      }
      await page.waitForTimeout(800);
    }

    if (gotAudio && activeChunks.length > 0) {
      const buffers = activeChunks.map(c => Buffer.from(c, 'base64'));
      const totalPcm = Buffer.concat(buffers);
      const wav = pcmToWav(totalPcm, 24000, 1, 16);
      fs.writeFileSync(outFile, wav);
      const durSec = (totalPcm.length / 2 / 24000).toFixed(2);
      console.log(`OK [SUCCESS] Scene ${scene.scene_id} -> ${path.basename(outFile)} (${durSec}s, ${(wav.length / 1024).toFixed(1)} KB, ${activeChunks.length} chunks)`);
      completedCount++;
    } else {
      console.error(`X [FAILED] Scene ${scene.scene_id} timed out.`);
      failedIds.push(scene.scene_id);
    }

    await page.waitForTimeout(1000);
  }

  console.log(`\n================================================================================`);
  console.log(`ALL DONE! Completed: ${completedCount} | Skipped: ${skippedCount} | Failed: ${failedIds.length} | Total: ${total}`);
  if (failedIds.length) console.log(`Failed scene ids: ${failedIds.join(', ')} (re-run to retry, existing files are skipped)`);
  console.log(`================================================================================\n`);

  await ctx.close();
  process.exit(0);
})().catch(err => {
  console.error('Fatal batch runner error:', err);
  process.exit(1);
});
