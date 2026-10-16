const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PROJ_DIR = path.join(ROOT, 'projects', 'sample_first_king');
const PJ_PATH = path.join(PROJ_DIR, 'project.json');
const RAW_DIR = path.join(PROJ_DIR, 'audio', 'raw');
fs.mkdirSync(RAW_DIR, { recursive: true });

const VOICE_MAP = {
  TIME_CHRONICLER: 'Puck',
  NARRATOR: 'Charon',
  HUNTER_CHIEF: 'Fenrir',
  WARLORD: 'Fenrir',
  PRIEST_VOICE: 'Fenrir',
  FARMER_VOICE: 'Puck',
  SUMERIAN_ENSI: 'Fenrir',
  HAMMURABI: 'Fenrir',
  BABYLON_DEBTOR: 'Puck',
  CITIZEN: 'Puck'
};

function voiceFor(speaker) {
  return VOICE_MAP[speaker] || 'Charon';
}

async function ensureVoice(page, targetVoice) {
  try {
    const curVoice = await page.evaluate(() => {
      const el = document.querySelector('.voice-select, [aria-label*="voice" i], mat-select, .voice-picker');
      return el ? (el.innerText || el.textContent || '').trim() : '';
    });
    if (curVoice.includes(targetVoice)) return;

    // Remove any stale backdrops first
    await page.evaluate(() => {
      document.querySelectorAll('.cdk-overlay-backdrop').forEach(el => el.remove());
    });

    const selectorBtn = page.locator('button:has-text("Voice"), .voice-select, [aria-label*="voice" i]').first();
    if (await selectorBtn.count() > 0) {
      await selectorBtn.click({ force: true });
      await page.waitForTimeout(600);
      const searchInput = page.locator('input[placeholder*="Search" i], input[type="search"]').first();
      if (await searchInput.count() > 0) {
        await searchInput.fill(targetVoice);
        await page.waitForTimeout(600);
        const row = page.locator('.cdk-overlay-container').getByText(targetVoice, { exact: true }).first();
        if (await row.count() > 0) await row.click({ force: true });
        await page.waitForTimeout(500);
      }
      await page.keyboard.press('Escape');
    }
  } catch (e) {}
}

async function synthesizeLine(page, text, voice, outPath) {
  // Clear any stray overlays
  await page.evaluate(() => {
    document.querySelectorAll('.cdk-overlay-backdrop').forEach(el => el.remove());
  });

  await ensureVoice(page, voice);

  const textarea = page.locator('textarea[aria-label="Speech block text"], textarea').first();
  await textarea.fill('');
  await textarea.fill(text);
  await page.waitForTimeout(400);

  // Trigger synthesis via Ctrl+Enter directly from textarea
  await textarea.focus();
  await page.keyboard.press('Control+Enter');

  let completed = false;
  let audioSrc = null;

  for (let i = 0; i < 45; i++) {
    await page.waitForTimeout(1000);
    const state = await page.evaluate(() => {
      const aud = document.querySelector('audio');
      const stop = Array.from(document.querySelectorAll('button')).some(b => (b.innerText || '').includes('Stop'));
      const err = document.querySelector('.error-message, mat-error, [role="alert"]');
      return {
        hasAudio: !!aud && aud.duration > 0.5,
        dur: aud ? aud.duration : 0,
        src: aud ? aud.src : null,
        stop,
        err: err ? err.innerText : null
      };
    });

    if (state.err && /quota|exceeded|try again/i.test(state.err)) {
      throw new Error('QUOTA_EXCEEDED: ' + state.err);
    }

    if (state.hasAudio && !state.stop) {
      audioSrc = state.src;
      completed = true;
      break;
    }
  }

  if (!completed || !audioSrc) {
    throw new Error('Timeout waiting for AI Studio audio generation');
  }

  const b64 = await page.evaluate(async (src) => {
    const res = await fetch(src);
    const ab = await res.arrayBuffer();
    const bytes = new Uint8Array(ab);
    let bin = '';
    for (let j = 0; j < bytes.length; j++) bin += String.fromCharCode(bytes[j]);
    return btoa(bin);
  }, audioSrc);

  fs.writeFileSync(outPath, Buffer.from(b64, 'base64'));
}

async function main() {
  console.log('Connecting to Chrome on port 9224...');
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  let page = ctx.pages().find(p => p.url().includes('generate-speech'));
  if (!page) {
    page = await ctx.newPage();
    await page.goto('https://aistudio.google.com/generate-speech?model=gemini-3.8-flash-tts');
    await page.waitForLoadState('networkidle');
  }

  const pj = JSON.parse(fs.readFileSync(PJ_PATH, 'utf8'));

  // 1. Synthesize EN Scene 80 if missing
  const en80Path = path.join(RAW_DIR, 'en_scene_0080.wav');
  if (!fs.existsSync(en80Path) || fs.statSync(en80Path).size < 15000) {
    const s80 = pj.scenes.find(s => s.scene_id === 80);
    const text = s80.narration.en;
    const voice = voiceFor(s80.dialogue_speaker);
    console.log(`[EN] Synthesizing Scene 80 [${voice}]: "${text.slice(0, 50)}..."`);
    await synthesizeLine(page, text, voice, en80Path);
    console.log(`✓ EN Scene 80 synthesized successfully (${(fs.statSync(en80Path).size / 1024).toFixed(1)} KB)`);
  } else {
    console.log(`✓ EN Scene 80 already exists.`);
  }

  // 2. Synthesize missing HI scenes
  console.log('\nChecking Hindi scenes 1 to 80...');
  for (let i = 1; i <= 80; i++) {
    const pad = String(i).padStart(4, '0');
    const outPath = path.join(RAW_DIR, `hi_scene_${pad}.wav`);
    if (fs.existsSync(outPath) && fs.statSync(outPath).size > 15000) {
      continue;
    }
    const scene = pj.scenes.find(s => s.scene_id === i);
    if (!scene) continue;
    const text = scene.narration.hi || scene.narration.en;
    const voice = voiceFor(scene.dialogue_speaker);
    const preview = text.length > 50 ? text.slice(0, 50) + '...' : text;
    process.stdout.write(`[HI] Scene ${i}/${80} [${voice}]: "${preview}" ... `);
    const t0 = Date.now();
    try {
      await synthesizeLine(page, text, voice, outPath);
      const sz = (fs.statSync(outPath).size / 1024).toFixed(1);
      console.log(`✓ (${sz} KB in ${((Date.now() - t0)/1000).toFixed(1)}s)`);
    } catch (err) {
      console.log(`❌ ${err.message}`);
      // Retry once after 2s
      await page.waitForTimeout(2000);
      try {
        await synthesizeLine(page, text, voice, outPath);
        const sz = (fs.statSync(outPath).size / 1024).toFixed(1);
        console.log(`  ✓ Retry succeeded (${sz} KB)`);
      } catch (err2) {
        console.error(`  ❌ Retry failed: ${err2.message}`);
      }
    }
    await page.waitForTimeout(600);
  }

  console.log('\n🎉 ALL MISSING AUDIO SCENES COMPLETED!');
}

main().catch(console.error);
