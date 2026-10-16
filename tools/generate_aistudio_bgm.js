const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const PROJECT_DIR = path.join(ROOT, 'projects', 'simple_itihash_002_first_language');
const OUT_BGM = path.join(PROJECT_DIR, 'audio', 'bgm.mp3');

async function generateAIStudioBGM() {
  console.log('Connecting to Chrome CDP on port 9224...');
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const context = browser.contexts()[0];
  const pages = context.pages();
  
  let musicPage = pages.find(p => p.url().includes('new_music'));
  if (!musicPage) {
    console.log('Creating new AI Studio Music page...');
    musicPage = await context.newPage();
    await musicPage.goto('https://aistudio.google.com/app/new_music?model=lyria-3.5', { waitUntil: 'domcontentloaded' });
    await musicPage.waitForTimeout(3000);
  } else {
    console.log('Found existing AI Studio Music tab:', musicPage.url());
  }

  await musicPage.bringToFront();

  // If cards are shown, click Cinematic Score to open prompt editor
  const cinematicCard = musicPage.locator('text="Cinematic Score"').first();
  if (await cinematicCard.isVisible().catch(() => false)) {
    console.log('Clicking Cinematic Score preset...');
    await cinematicCard.click();
    await musicPage.waitForTimeout(1500);
  }

  // Find prompt textarea
  const textarea = musicPage.locator('textarea, div[contenteditable="true"]').first();
  await textarea.waitFor({ timeout: 10000 });
  console.log('Found music prompt input.');

  const bgmPrompt = `[0:00 - 0:45] Intro: Intensity: 3/10. Mysterious and ancient prehistoric desert atmosphere. Solitary Egyptian ney (reed flute) echoes drifting over deep, resonant low drone and ambient desert wind. A haunting sense of forbidden antiquity and the dawn of human curiosity. No vocals. Instrumental.
[0:45 - 1:30] Build: Intensity: 6/10. Deep acoustic hand percussion and hollow frame drums enter with a subtle, driving rhythm. An acoustic oud plays an enigmatic melody in Phrygian dominant mode. Rising tension and suspense as mad kings lock newborn infants away in total silence. No vocals. Instrumental.
[1:30 - 2:20] Climax: Intensity: 8/10. Full dramatic cinematic swell. Driving historical percussion, regal Mughal bells, poignant cello ostinato, and soaring acoustic orchestration portraying the tragic silence of Akbar's Gung Mahal and the divine miracle of human speech. No vocals. Instrumental.
[2:20 - 3:00] Outro: Intensity: 3/10. Resolving, contemplative ancient acoustic outro. Slow decaying ney flute notes and gentle ambient desert wind, leaving a profound sense of awe and philosophical reverence for human intellect. Long reverberant fade. No vocals. Instrumental.`;

  await textarea.focus();
  await textarea.fill(bgmPrompt);
  console.log('Entered custom story-matched soundtrack prompt.');
  await musicPage.waitForTimeout(500);

  // Click Generate button
  const genBtn = musicPage.locator('button:has-text("Generate")').first();
  console.log('Clicking Generate button...');
  await genBtn.click();

  console.log('Waiting for Lyria 3.5 to compose and generate music track...');
  let completed = false;
  for (let i = 0; i < 90; i++) {
    await musicPage.waitForTimeout(2000);
    const isGenerating = await musicPage.locator('button:has-text("Stop"), mat-spinner, .spinner').count() > 0;
    const audioSrc = await musicPage.evaluate(() => {
      const a = document.querySelector('audio');
      return a ? a.src : null;
    });
    const audioDur = await musicPage.evaluate(() => {
      const a = document.querySelector('audio');
      return a ? a.duration : 0;
    });

    console.log(`[${i + 1}/90] Status: isGenerating=${isGenerating}, audioDuration=${audioDur}`);

    if (!isGenerating && audioSrc && audioDur > 10) {
      completed = true;
      console.log(`✓ Music generation finished! Duration: ${audioDur}s, Src: ${audioSrc.substring(0, 50)}...`);
      break;
    }
  }

  // Extract audio base64 or download
  const b64 = await musicPage.evaluate(async () => {
    const audio = document.querySelector('audio');
    if (!audio || !audio.src) return null;
    const resp = await fetch(audio.src);
    const buf = await resp.arrayBuffer();
    const bytes = new Uint8Array(buf);
    let bin = '';
    for (let i = 0; i < bytes.byteLength; i++) bin += String.fromCharCode(bytes[i]);
    return btoa(bin);
  });

  if (b64) {
    fs.writeFileSync(OUT_BGM, Buffer.from(b64, 'base64'));
    console.log(`✓ Custom Google AI Studio BGM successfully saved to: ${OUT_BGM} (${fs.statSync(OUT_BGM).size} bytes)`);
  } else {
    console.log('No direct blob found in audio tag, capturing screenshot for inspection...');
    const shot = await musicPage.screenshot({ type: 'png' });
    fs.writeFileSync(path.join(__dirname, 'bgm_generation_state.png'), shot);
  }
}

generateAIStudioBGM().catch(console.error);
