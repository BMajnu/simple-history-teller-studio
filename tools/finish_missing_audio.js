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

async function prepareWorkerTab(ctx, userSlot = '') {
  const page = await ctx.newPage();
  const url = `https://aistudio.google.com/${userSlot ? userSlot + '/' : ''}generate-speech?model=gemini-3.8-flash-tts`;
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(3000);
  await page.keyboard.press('Escape');

  // Dismiss any consent or upgrade dialogs
  for (let c = 0; c < 3; c++) {
    const dlg = page.locator('[role=dialog], mat-dialog-container').first();
    if (await dlg.isVisible().catch(() => false)) {
      const btn = dlg.locator('button:has-text("Continue"), button:has-text("Accept"), button:has-text("I agree"), button:has-text("close")').first();
      if (await btn.isVisible().catch(() => false)) {
        await btn.click().catch(() => {});
        await page.waitForTimeout(1000);
      }
    }
  }

  const createCard = page.locator('text="Create new dialog"').first();
  if (await createCard.isVisible().catch(() => false)) {
    await createCard.click();
    await page.waitForTimeout(2000);
  }

  const textarea = page.locator('textarea[aria-label="Speech block text"], textarea').first();
  await textarea.waitFor({ timeout: 20000 });
  return page;
}

async function ensureVoice(page, targetVoice) {
  try {
    const speakerBtn = page.locator('button').filter({ hasText: 'Speaker' }).first();
    if (await speakerBtn.count() > 0) {
      const txt = (await speakerBtn.innerText()).trim();
      if (txt.toLowerCase().includes(targetVoice.toLowerCase())) return;

      await speakerBtn.click();
      await page.waitForTimeout(1000);

      const searchInput = page.locator('.cdk-overlay-container input, input[placeholder*="Search"]').first();
      if (await searchInput.count() > 0) {
        await searchInput.fill(targetVoice);
        await page.waitForTimeout(800);
        const row = page.locator('.cdk-overlay-container').getByText(targetVoice, { exact: true }).first();
        if (await row.count() > 0) await row.click();
        await page.waitForTimeout(600);
      }
      await page.keyboard.press('Escape');
    }
  } catch (e) {}
}

async function synthesizeLine(page, text, voice, outPath) {
  await ensureVoice(page, voice);

  const textarea = page.locator('textarea[aria-label="Speech block text"], textarea').first();
  await textarea.fill(text);
  await page.waitForTimeout(400);

  const runBtn = page.locator('button.ctrl-enter-submits, button:has-text("Run")').first();
  await runBtn.click();

  let completed = false;
  let audioSrc = null;

  for (let i = 0; i < 40; i++) {
    await page.waitForTimeout(1200);
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
    throw new Error('Timeout waiting for AI Studio audio');
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
  console.log('Connecting to Chrome over CDP on port 9224...');
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const page = await prepareWorkerTab(ctx, 'u/0');
  console.log('Worker tab ready!');

  const pj = JSON.parse(fs.readFileSync(PJ_PATH, 'utf8'));

  // 1. Synthesize missing EN scene 80
  const en80 = path.join(RAW_DIR, 'en_scene_0080.wav');
  if (!fs.existsSync(en80) || fs.statSync(en80).size < 15000) {
    const s80 = pj.scenes.find(s => s.scene_id === 80);
    const text = s80.narration.en;
    const voice = voiceFor(s80.dialogue_speaker);
    console.log(`[EN] Synthesizing Scene 80 [${voice}]...`);
    await synthesizeLine(page, text, voice, en80);
    console.log(`✓ EN Scene 80 synthesized successfully (${(fs.statSync(en80).size/1024).toFixed(1)} KB)`);
  } else {
    console.log(`✓ EN Scene 80 already exists.`);
  }

  // 2. Synthesize missing HI scenes
  console.log('\nChecking Hindi scenes...');
  for (let i = 1; i <= 80; i++) {
    const pad = String(i).padStart(4, '0');
    const outPath = path.join(RAW_DIR, `hi_scene_${pad}.wav`);
    if (fs.existsSync(outPath) && fs.statSync(outPath).size > 15000) continue;

    const s = pj.scenes.find(sc => sc.scene_id === i);
    if (!s) continue;
    const text = s.narration.hi || s.narration.en;
    const voice = voiceFor(s.dialogue_speaker);
    const preview = text.length > 40 ? text.slice(0, 40) + '...' : text;
    process.stdout.write(`[HI] Scene ${i}/80 [${voice}]: "${preview}" ... `);
    const t0 = Date.now();
    try {
      await synthesizeLine(page, text, voice, outPath);
      const sz = (fs.statSync(outPath).size / 1024).toFixed(1);
      console.log(`✓ (${sz} KB in ${((Date.now() - t0)/1000).toFixed(1)}s)`);
    } catch (err) {
      console.log(`❌ ${err.message}`);
      await page.waitForTimeout(2000);
      await page.keyboard.press('Escape');
    }
    await page.waitForTimeout(600);
  }

  await page.close().catch(() => {});
  console.log('\n🎉 Finished missing audio tracks synthesis!');
}

main().catch(console.error);
