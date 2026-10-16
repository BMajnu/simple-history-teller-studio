// Phase 1: Open AI Studio Music with full 16-min BGM prompt for episode 002
// Dispatches the Lyria 3.5 prompt to an open music tab via the Chrome daemon.
// After generation completes in AI Studio, run save_generated_bgm.js to extract the file.
const http = require('http');
const path = require('path');

const BGM_PROMPT = `
[0:00 - 2:00] Intro: Intensity 2/10. Ancient prehistoric mystery — primal hollow log drum heartbeat, distant bamboo flute melody, subtle desert cave wind ambiance, dark resonant bass drone. Sparse, mysterious, earthy. No vocals. Instrumental only.

[2:00 - 5:30] Rising Mystery: Intensity 5/10. Ancient Egyptian palace intrigue — Egyptian Ney reed flute leading melody over Oud string picking, sistrum rattle rhythm, warm reverb of stone chamber acoustics, tension building with low cello drone. Mysterious, regal, forbidden. No vocals. Instrumental only.

[5:30 - 9:00] Dramatic Climax: Intensity 8/10. Forbidden experiment revealed — full dramatic orchestral swell, driving bass ostinato, urgent strings, deep kettledrum rolls, powerful cinematic brass. Shocking revelation, high historical drama. No vocals. Instrumental only.

[9:00 - 12:30] Mughal Court Interlude: Intensity 6/10. Royal Indian court atmosphere — Sitar melodic phrase, Tabla rhythmic pattern, warm tanpura drone, regal tabla-driven groove. Exotic, cultured, ancient wisdom. No vocals. Instrumental only.

[12:30 - 15:00] Philosophical Reflection: Intensity 4/10. Scholarly contemplation — soft Oud arpeggios, gentle cello sustained notes, quiet Arabic string ensemble, warm golden tones of Islamic scholarly library. Dignified, reflective, serene. No vocals. Instrumental only.

[15:00 - 17:00] Outro: Intensity 2/10. Peaceful resolution — decaying Ney flute echoes, single guitar pluck, fading ambient drone, soft reverb fade into silence. Ancient wisdom, hopeful closure. No vocals. Instrumental only.

Target: 17 minutes total duration. Multi-era historical documentary score. 48kHz stereo. No percussion drops between sections — smooth organic transitions only. No lyrics, no vocals, purely instrumental.
`.trim();

function post(body, ms) {
  return new Promise((resolve, reject) => {
    const data = Buffer.from(JSON.stringify(body), 'utf8');
    const req = http.request(
      { host: '127.0.0.1', port: 9333, path: '/run-script', method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Length': data.length }, timeout: ms },
      (res) => {
        let raw = '';
        res.on('data', c => raw += c);
        res.on('end', () => { try { resolve(JSON.parse(raw)); } catch(e) { resolve({ raw }); } });
      }
    );
    req.on('error', reject);
    req.write(data); req.end();
  });
}

const escapedPrompt = BGM_PROMPT.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$/g, '\\$');

const code = `
return (async () => {
  const ctx = browser.contexts()[0];
  // Find or open a Lyria music tab
  let pg = ctx.pages().find(p => p.url().includes('new_music'));
  if (!pg || pg.isClosed()) {
    pg = await ctx.newPage();
    await pg.goto('https://aistudio.google.com/app/new_music?model=lyria-3.5', { waitUntil: 'domcontentloaded' });
    await pg.waitForTimeout(8000);
  }
  await pg.bringToFront();
  await pg.keyboard.press('Escape');
  await pg.waitForTimeout(1000);

  // Select "Cinematic Score" style card if visible
  const styleCard = pg.locator('text=Cinematic Score').first();
  if (await styleCard.count() > 0) {
    await styleCard.scrollIntoViewIfNeeded({ timeout: 5000 }).catch(() => {});
    await styleCard.click({ force: true, timeout: 5000 }).catch(() => {});
    await pg.waitForTimeout(4000);
  }

  // Find the prompt textarea
  const box = pg.locator('textarea, div[contenteditable="true"], [role="textbox"]').first();
  await box.waitFor({ state: 'visible', timeout: 30000 });
  await box.click({ force: true });
  await box.fill(\`${escapedPrompt}\`);
  await pg.waitForTimeout(500);

  // Submit
  await pg.keyboard.press('Enter');
  await pg.waitForTimeout(3000);

  const body = await pg.evaluate(() => document.body.innerText.slice(0, 500));
  return { sent: true, preview: body.slice(0, 200) };
})();
`;

(async () => {
  console.log('=== Phase 1: BGM Generation ===');
  console.log('Dispatching 17-minute cinematic BGM prompt to AI Studio Music (Lyria 3.5)...');
  try {
    const r = await post({ code }, 60000);
    if (r.result && r.result.sent) {
      console.log('✓ BGM prompt dispatched successfully!');
      console.log('  AI Studio is now composing a 17-minute multi-era historical documentary score.');
      console.log('  Preview:', r.result.preview);
      console.log('');
      console.log('⏳ Wait for AI Studio Music to finish generating (~2-5 min).');
      console.log('   Then run: node tools/save_generated_bgm.js');
      console.log('   This will extract the audio blob and save it to audio/bgm.mp3');
    } else {
      console.log('Response:', JSON.stringify(r, null, 2));
    }
  } catch(e) {
    console.error('Error:', e.message);
  }
})();
