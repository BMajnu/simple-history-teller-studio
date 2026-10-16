const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = __dirname;
const FFMPEG = path.join(ROOT, 'bin', 'ffmpeg.exe');
const AUDIO_DIR = path.join(ROOT, 'projects', 'sample_first_king', 'audio');
const RAW_DIR = path.join(AUDIO_DIR, 'raw');
fs.mkdirSync(RAW_DIR, { recursive: true });

// Strict Character Persona to Voice Mapping
// Enforces gender, age, and emotional matching (Zero female voices on male characters)
const SCENE_VOICE_MAP = {
  1: 'Puck',    // The Time Chronicler (Male Host) - Energetic, witty, engaging
  2: 'Charon',  // Male Narrator - Deep, authoritative historical solemnity
  3: 'Puck',    // Male Narrator - Humorous mocking beat (tribe teasing hunter)
  4: 'Fenrir',  // Fierce Hunter Chief (Male Chieftain) - Booming, aggressive shout
  5: 'Charon',  // Male Narrator - Historic coronation of first chieftain
  6: 'Charon',  // Male Narrator - Grand empires and colossal pyramids
  7: 'Puck'     // The Time Chronicler (Male Host) - Warm outro call to action
};

const SCRIPTS = {
  bn: {
    1: "<gasp> আমি সময়ের সাক্ষী! আজ তোমাকে নিয়ে যাব মানব ইতিহাসের সেই মুহূর্তে, যখন তৈরি হয়েছিল পৃথিবীর প্রথম রাজা।",
    2: "হাজার হাজার বছর ধরে মানুষ কালাহারি মরুভূমির আগুনের পাশে সমান হয়ে বসত। সেখানে কোনো রাজা ছিল না, কোনো প্রজা ছিল না।",
    3: "<laugh> কেউ যদি বড় শিকার নিয়ে আসত, তবে তার অহংকার ভাঙতে সবাই মিলে তাকে নিয়ে হাসাহাসি করত—যাতে কেউ নিজেকে দলনেতা না ভাবে!",
    4: "<screaming> কিন্তু একদিন এক শক্তিশালী শিকারি গর্জে উঠল: আমিই এই কৌম সমাজের একমাত্র অধিপতি!",
    5: "সেই বাহুবল আর ভয় থেকেই জন্ম নিল প্রথম সর্দার। মানুষের মাথায় উঠল পাথরের তৈরি প্রথম মুকুট।",
    6: "ধীরে ধীরে সেই গ্রামীণ সর্দার রূপান্তরিত হলো মহাপ্রতাপশালী রাজায়। তৈরি হলো পিরামিড, গড়ে উঠল রাজপ্রাসাদ আর সেনাবাহিনী।",
    7: "আজ তুমি নিজেকে প্রশ্ন করো: আমাদের কি সত্যিই কোনো রাজার প্রয়োজন ছিল? তোমার মতামত কমেন্টে লিখে জানাও। সাবস্ক্রাইব করে সঙ্গে থাকো!"
  },
  en: {
    1: "<gasp> I am the Time Chronicler! Today, I will take you back to the exact moment in human history when the first king was born.",
    2: "For thousands of years, humans sat as equals around desert campfires. There were no kings, and there were no subjects.",
    3: "<laugh> Whenever a hunter brought back a giant beast, the tribe playfully mocked him, making sure nobody ever felt like a leader!",
    4: "<screaming> Until one fateful day, a powerful hunter stood up and shouted: I am the sole ruler of this tribe!",
    5: "From raw brute force and fear, the first chieftain emerged, and a crude stone crown was placed upon human heads.",
    6: "Gradually, that village chief transformed into an absolute emperor, erecting colossal pyramids, fortresses, and mighty armies.",
    7: "So ask yourself today: did human society truly need a king? Share your thoughts below, and subscribe to journey through time with me!"
  },
  hi: {
    1: "<gasp> मैं समय का गवाह हूँ! आज मैं आपको मानव इतिहास के उस मोड़ पर ले जाऊँगा, जब दुनिया का पहला राजा बना था।",
    2: "हज़ारों सालों तक इंसान रेगिस्तान की आग के पास बराबरी से बैठते थे। वहाँ कोई राजा नहीं था, और कोई प्रजा नहीं थी।",
    3: "<laugh> अगर कोई शिकारी बड़ा शिकार लेकर आता, तो उसका घमंड तोड़ने के लिए सब उसका मज़ाक उड़ाते थे, ताकि कोई खुद को सरदार न समझे!",
    4: "<screaming> लेकिन एक दिन एक ताकतवर शिकारी गरज उठा: मैं ही इस कबीले का इकलौता सरदार हूँ!",
    5: "उसी बाहुबल और डर से पहले सरदार का जन्म हुआ, और इंसानी सिर पर पत्थर का पहला मुकुट सजाया गया।",
    6: "धीरे-धीरे वह छोटा सरदार सर्वशक्तिमान सम्राट बन गया। विशाल पिरामिड बने, राजमहल खड़े हुए और फौजों का जन्म हुआ।",
    7: "आज खुद से पूछिए: क्या इंसानों को वाकई राजा की ज़रूरत थी? अपनी राय कमेंट में बताइए, और इतिहास के सफ़र के लिए सब्सक्राइब कीजिए!"
  }
};

async function sendScriptToDaemon(code) {
  const resp = await fetch('http://127.0.0.1:9333/run-script', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code })
  });
  if (!resp.ok) {
    const errText = await resp.text();
    throw new Error(`Daemon error: ${errText}`);
  }
  return await resp.json();
}

async function synthesizeScene(text, outPath, voiceName = 'Puck') {
  console.log(`  Synthesizing [Voice: ${voiceName}]: "${text.slice(0, 45)}..."`);
  const escapedText = text.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/'/g, "\\'");
  const escapedOutPath = outPath.replace(/\\/g, '\\\\');

  const code = `
    const pages = browser.contexts()[0].pages();
    const ttsPage = pages.find(p => p.url().includes('generate-speech'));
    if (!ttsPage) throw new Error('TTS page not found');
    await ttsPage.bringToFront();

    // 1. Ensure desired voice is selected
    const voiceChip = ttsPage.locator('.voice-chip, button.voice-playground-chip').first();
    const currentVoiceText = (await voiceChip.innerText()).trim();
    if (!currentVoiceText.toLowerCase().includes("${voiceName.toLowerCase()}")) {
      await voiceChip.click();
      await ttsPage.waitForTimeout(400);

      const searchInput = ttsPage.locator('input[placeholder*="Search"][placeholder*="voices"], input[aria-label="Search voices"]').first();
      await searchInput.fill("${voiceName}");
      await ttsPage.waitForTimeout(400);

      const voiceBtn = ttsPage.locator(\`button[aria-label="${voiceName}"], button.voice-card-content:has-text("${voiceName}")\`).first();
      if (await voiceBtn.count() > 0) {
        await voiceBtn.click();
        await ttsPage.waitForTimeout(300);
      }
      const closeBtn = ttsPage.locator('button[aria-label="Close panel"]').first();
      if (await closeBtn.count() > 0) {
        await closeBtn.click();
        await ttsPage.waitForTimeout(300);
      }
    }

    // 2. Fill text
    const textarea = ttsPage.locator('textarea[aria-label="Speech block text"]').first();
    await textarea.focus();
    await textarea.fill('');
    await textarea.fill("${escapedText}");
    await ttsPage.waitForTimeout(400);

    // 3. Click Run
    const runBtn = ttsPage.locator('button.ctrl-enter-submits').first();
    for (let w = 0; w < 10; w++) {
      if (await runBtn.getAttribute('aria-disabled') === 'false') break;
      await ttsPage.waitForTimeout(200);
    }
    await runBtn.click();

    // 4. Wait until generation is done and download button is ready
    let dlBtn = null;
    for (let i = 0; i < 35; i++) {
      await ttsPage.waitForTimeout(1000);
      const isGenerating = await ttsPage.evaluate(() => {
        const spinner = document.querySelector('mat-spinner, mat-progress-spinner, mat-progress-bar');
        const runBtn = document.querySelector('button.ctrl-enter-submits');
        return !!spinner || (runBtn && runBtn.getAttribute('aria-disabled') === 'true');
      });
      if (!isGenerating) {
        dlBtn = ttsPage.locator('button[aria-label="Download"]').first();
        if (await dlBtn.count() > 0) break;
      }
    }

    if (!dlBtn || await dlBtn.count() === 0) {
      dlBtn = ttsPage.locator('button[aria-label="Download"]').first();
    }
    
    // 5. Download audio
    const downloadPromise = ttsPage.waitForEvent('download', { timeout: 15000 });
    await dlBtn.click();

    const download = await downloadPromise;
    await download.saveAs("${escapedOutPath}");
    return { ok: true, file: "${escapedOutPath}", voice: "${voiceName}" };
  `;

  const res = await sendScriptToDaemon(code);
  if (!res.ok) throw new Error(JSON.stringify(res));
  return res.result;
}

function getAudioDuration(file) {
  const FFPROBE = path.join(ROOT, 'bin', 'ffprobe.exe');
  const res = spawnSync(FFPROBE, ['-v', 'error', '-show_entries', 'format=duration', '-of', 'json', file], { encoding: 'utf8' });
  return parseFloat(JSON.parse(res.stdout).format.duration);
}

function mixLanguageNarration(lang) {
  const inputs = [];
  const delays = [];
  let currentOffset = 0;
  const PAD = 0.4;
  const sceneDurs = {};

  for (let s = 1; s <= 7; s++) {
    const rawFile = path.join(RAW_DIR, `${lang}_scene_${s}.wav`);
    if (!fs.existsSync(rawFile)) {
      throw new Error(`Missing raw audio file: ${rawFile}`);
    }
    const rawDur = getAudioDuration(rawFile);
    const sceneDur = Math.round((rawDur + PAD) * 10) / 10;
    sceneDurs[s] = sceneDur;

    const delayMs = Math.round(currentOffset * 1000);
    inputs.push('-i', rawFile);
    delays.push(`[${s - 1}:a]adelay=${delayMs}|${delayMs},aresample=48000,aformat=sample_fmts=fltp:channel_layouts=stereo[a${s}]`);
    currentOffset += sceneDur;
  }

  const totalDur = Math.round(currentOffset * 10) / 10;
  console.log(`\n▶ Assembling ${lang.toUpperCase()} dynamic master narration track (${totalDur}s, 0 dead gaps)...`);

  const amixInputs = Array.from({ length: 7 }, (_, i) => `[a${i + 1}]`).join('');
  const filterComplex = delays.join(';') + ';' +
    `${amixInputs}amix=inputs=7:duration=longest:dropout_transition=0,apad=whole_dur=${totalDur},loudnorm=I=-14:TP=-1.5:LRA=11[out]`;

  const outFile = path.join(AUDIO_DIR, `${lang}_narration.wav`);
  const tmpOut = outFile + '.tmp.wav';

  const args = [
    '-y',
    ...inputs,
    '-filter_complex', filterComplex,
    '-map', '[out]',
    '-t', String(totalDur),
    '-c:a', 'pcm_s16le',
    tmpOut
  ];

  console.log(`  Running dynamic FFmpeg mix for ${lang}...`);
  const proc = spawnSync(FFMPEG, args, { stdio: 'inherit' });
  if (proc.status !== 0) {
    throw new Error(`FFmpeg failed for ${lang} with exit code ${proc.status}`);
  }

  fs.renameSync(tmpOut, outFile);
  const st = fs.statSync(outFile);
  console.log(`  ✓ ${lang}_narration.wav created successfully (${(st.size / 1024 / 1024).toFixed(2)} MB, ${totalDur}s)\n`);
  return { totalDur, sceneDurs };
}

async function main() {
  const forceRegen = process.argv.includes('--force');

  console.log('========================================================');
  console.log('  Google AI Studio Gemini 3.8 Flash TTS Batch Synthesis');
  console.log('  Strict Voice Gender & Character Persona Matrix:');
  console.log('  - Host (Scenes 1, 3, 7): Puck (Upbeat Male)');
  console.log('  - Narrator (Scenes 2, 5, 6): Charon (Resonant Male)');
  console.log('  - Hunter Chief (Scene 4): Fenrir (Fierce Male)');
  console.log(`  Mode: ${forceRegen ? 'FORCE REGENERATE ALL' : 'Incremental'}`);
  console.log('========================================================\n');

  const allLangTotals = {};
  const allLangDurs = {};

  for (const lang of ['bn', 'en', 'hi']) {
    console.log(`=== Processing Language: ${lang.toUpperCase()} ===`);
    for (let s = 1; s <= 7; s++) {
      const rawFile = path.join(RAW_DIR, `${lang}_scene_${s}.wav`);
      const assignedVoice = SCENE_VOICE_MAP[s] || 'Puck';

      if (!forceRegen && fs.existsSync(rawFile) && fs.statSync(rawFile).size > 50000) {
        console.log(`  Scene ${s} already exists (${(fs.statSync(rawFile).size / 1024).toFixed(1)} KB), skipping.`);
        continue;
      }

      const text = SCRIPTS[lang][s];
      let success = false;
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          console.log(`  [Scene ${s}/7] Attempt ${attempt}...`);
          await synthesizeScene(text, rawFile, assignedVoice);
          if (fs.existsSync(rawFile) && fs.statSync(rawFile).size > 20000) {
            console.log(`  ✓ Scene ${s} synthesized: ${(fs.statSync(rawFile).size / 1024).toFixed(1)} KB`);
            success = true;
            break;
          }
        } catch (err) {
          console.error(`  ⚠ Attempt ${attempt} failed: ${err.message}`);
          await new Promise(r => setTimeout(r, 2000));
        }
      }
      if (!success) {
        throw new Error(`Failed to synthesize ${lang} scene ${s} after 3 attempts.`);
      }
      // Small pause between generations to respect rate limits
      await new Promise(r => setTimeout(r, 1200));
    }

    const { totalDur, sceneDurs } = mixLanguageNarration(lang);
    allLangTotals[lang] = totalDur;
    allLangDurs[lang] = sceneDurs;
  }

  // Update project.json with dynamic language durations
  const projectJsonPath = path.join(ROOT, 'projects', 'sample_first_king', 'project.json');
  if (fs.existsSync(projectJsonPath)) {
    const pj = JSON.parse(fs.readFileSync(projectJsonPath, 'utf8'));
    pj.language_total_durations = allLangTotals;
    for (const sc of pj.scenes) {
      sc.language_durations = sc.language_durations || {};
      for (const l of ['bn', 'en', 'hi']) {
        sc.language_durations[l] = allLangDurs[l][sc.scene_id];
      }
    }
    fs.writeFileSync(projectJsonPath, JSON.stringify(pj, null, 2), 'utf8');
    console.log('✓ Updated project.json with dynamic language_durations and language_total_durations');
  }

  console.log('🎉 ALL 3 LANGUAGE NARRATION TRACKS GENERATED & MIXED SUCCESSFULLY!');
}

main().catch(err => {
  console.error('\n❌ FATAL ERROR:', err);
  process.exit(1);
});
