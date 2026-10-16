/**
 * Builds projects/sample_first_king — a ready-to-render demo project for the Studio.
 *   node tools/build_sample_project.js
 *
 * - Visuals: the 5 style reference images + one simulated "AI motion clip"
 * - English narration: Windows SAPI voice (real speech, per-scene aligned)
 * - Bangla / Hindi narration: soft placeholder tones (replace via Studio → Audio Tracks)
 * - BGM: generated ambient pad
 */
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const FF = fs.existsSync(path.join(ROOT, 'bin', 'ffmpeg.exe')) ? path.join(ROOT, 'bin', 'ffmpeg.exe') : 'ffmpeg';
const P = path.join(ROOT, 'projects', 'sample_first_king');
const REF = path.join(ROOT, 'references');
for (const d of ['audio/sfx', 'visual_assets', 'metadata', 'renders', '_build']) fs.mkdirSync(path.join(P, d), { recursive: true });

const ff = (args) => {
  const r = spawnSync(FF, ['-hide_banner', '-y', '-loglevel', 'error', ...args.map(String)], { stdio: 'inherit' });
  if (r.status !== 0) throw new Error('ffmpeg failed: ' + args.join(' '));
};

const scenes = [
  { img: 'ref_host_chronicler.jpg', d: 4.2, fx: 'zoom_in', who: 'TIME_CHRONICLER',
    bn: 'আমি সময়ের সাক্ষী। আজ তোমাকে নিয়ে যাব পৃথিবীর প্রথম রাজার কাছে।',
    en: 'I am the Time Chronicler. Today, we travel back to meet the very first king.',
    hi: 'मैं समय का गवाह हूँ। आज हम चलेंगे दुनिया के पहले राजा से मिलने।' },
  { img: 'ref_style_1_sticky_meme.jpg', d: 4.0, fx: 'pan_right', who: 'NARRATOR',
    bn: 'হাজার হাজার বছর ধরে মানুষ আগুনের পাশে সমান হয়ে বসত। কোনো রাজা ছিল না।',
    en: 'For thousands of years, humans sat as equals around the fire. There were no kings.',
    hi: 'हज़ारों सालों तक इंसान आग के पास बराबरी से बैठते थे। कोई राजा नहीं था।' },
  { clip: true, d: 4.5, fx: 'ai_video', who: 'HUNTER_CHIEF', type: 'DYNAMIC_AI_VIDEO',
    bn: 'তারপর একদিন এক শিকারি উঠে দাঁড়িয়ে চিৎকার করল: আমিই নেতা!',
    en: 'Then one day, a hunter stood up and shouted: I am the leader!',
    hi: 'फिर एक दिन एक शिकारी खड़ा हुआ और चिल्लाया: मैं ही सरदार हूँ!' },
  { img: 'ref_style_2_simple_history.jpg', d: 4.3, fx: 'zoom_out', who: 'NARRATOR',
    bn: 'সেই চিৎকার থেকেই জন্ম নিল সর্দার, তারপর রাজা, তারপর বিশাল সাম্রাজ্য।',
    en: 'From that shout came chiefs, then kings, and then vast empires.',
    hi: 'उसी चीख से पैदा हुए सरदार, फिर राजा, और फिर विशाल साम्राज्य।' },
  { img: 'ref_style_3_mystery_noir.jpg', d: 4.0, fx: 'zoom_in', who: 'NARRATOR',
    bn: 'কিন্তু কিছু রাজা হারিয়ে গেল ইতিহাসের অন্ধকারে, রেখে গেল শুধু রহস্য।',
    en: 'But some kings vanished into darkness, leaving only mysteries behind.',
    hi: 'लेकिन कुछ राजा इतिहास के अंधेरे में खो गए, पीछे छोड़ गए सिर्फ़ रहस्य।' },
  { img: 'ref_style_4_islamic_reverent.jpg', d: 4.2, fx: 'pan_left', who: 'NARRATOR',
    bn: 'আর জ্ঞানীরা সেই গল্পগুলো লিখে রাখলেন, যাতে আমরা আজ জানতে পারি।',
    en: 'And scholars wrote these stories down, so that we could know them today.',
    hi: 'और विद्वानों ने ये कहानियाँ लिख लीं, ताकि आज हम उन्हें जान सकें।' },
  { img: 'ref_host_chronicler.jpg', d: 4.5, fx: 'zoom_out', who: 'TIME_CHRONICLER',
    bn: 'তোমার কী মনে হয়, আমাদের কি সত্যিই রাজার দরকার ছিল? কমেন্টে জানাও।',
    en: 'So, did we ever really need kings? Tell me in the comments.',
    hi: 'आपको क्या लगता है, क्या हमें सच में राजा की ज़रूरत थी? कमेंट में बताइए।' },
];

console.log('• Visual assets');
const projectScenes = scenes.map((s, i) => {
  const id = i + 1;
  const pad = String(id).padStart(4, '0');
  let asset;
  if (s.clip) {
    asset = `visual_assets/clip_scene_${pad}.mp4`;
    // Simulated AI motion clip: punch-in + shake on the Sticky-Meme reference.
    const frames = Math.round(s.d * 30);
    ff(['-i', path.join(REF, 'ref_style_1_sticky_meme.jpg'), '-vf',
      `scale=3840:2160:force_original_aspect_ratio=increase,crop=3840:2160,` +
      `zoompan=z='1.05+0.35*on/${frames}':x='iw/2-(iw/zoom/2)+18*sin(on*1.7)':y='ih/2-(ih/zoom/2)+12*cos(on*2.3)':d=${frames}:s=1920x1080:fps=30,` +
      `eq=saturation=1.25:contrast=1.08,format=yuv420p`,
      '-frames:v', frames, '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20', path.join(P, asset)]);
  } else {
    asset = `visual_assets/scene_${pad}${path.extname(s.img)}`;
    fs.copyFileSync(path.join(REF, s.img), path.join(P, asset));
  }
  return {
    scene_id: id, duration: s.d,
    type: s.type || 'STATIC_IMAGE',
    dialogue_speaker: s.who,
    narration: { bn: s.bn, en: s.en, hi: s.hi },
    visual_prompt: s.clip
      ? 'Dynamic cartoon 2D animation, primitive stickman hunter suddenly standing up furiously, fiery eyes, shouting with mouth wide open, brandishing a bone club, dramatic comic impact lines, cinematic dust swirling, 24fps motion.'
      : `Reference benchmark: references/${s.img}`,
    asset_file: asset,
    sfx: s.clip ? 'dramatic_whoosh_thud' : '',
    motion_effect: s.fx,
  };
});

const project = {
  project_id: 'simple_itihash_000_sample_first_king',
  brand: 'Simple Itihash',
  style_preset: 'PRESET_STICKY_MEME',
  target_duration_seconds: 30,
  metadata: {
    title_bn: 'মানুষ কীভাবে প্রথম রাজা বানাল? (ডেমো)',
    title_en: 'How Humans Made the First King (Demo)',
    title_hi: 'इंसानों ने पहला राजा कैसे बनाया? (डेमो)',
  },
  scenes: projectScenes,
};
let t = 0;
for (const s of project.scenes) { s.timestamp_start = +t.toFixed(3); t += s.duration; s.timestamp_end = +t.toFixed(3); }
project.total_duration_seconds = +t.toFixed(3);
fs.writeFileSync(path.join(P, 'project.json'), JSON.stringify(project, null, 2));

console.log('• SEO metadata');
fs.writeFileSync(path.join(P, 'metadata', 'youtube_seo.json'), JSON.stringify({
  bn: { title: project.metadata.title_bn, description: 'হাজার বছর ধরে মানুষের কোনো রাজা ছিল না। তাহলে প্রথম রাজা এল কোথা থেকে?\n\n#সিম্পলইতিহাস #ইতিহাস', tags: ['সিম্পল ইতিহাস', 'ইতিহাস', 'প্রথম রাজা', 'বাংলা ইতিহাস'] },
  en: { title: project.metadata.title_en, description: 'For thousands of years humans had no kings. So where did the first one come from?\n\n#SimpleItihash #History', tags: ['simple itihash', 'history', 'first king', 'animated history'] },
  hi: { title: project.metadata.title_hi, description: 'हज़ारों साल तक इंसानों का कोई राजा नहीं था। तो पहला राजा आया कहाँ से?\n\n#SimpleItihash #इतिहास', tags: ['सिंपल इतिहास', 'इतिहास', 'पहला राजा', 'hindi history'] },
}, null, 2));

/** Per-scene clips -> each padded/trimmed to its scene duration -> one aligned track. */
function alignedTrack(files, out) {
  const inputs = files.flatMap((f) => ['-i', f]);
  const fc = files.map((_, i) => `[${i}:a]aresample=48000,aformat=channel_layouts=stereo,apad,atrim=0:${project.scenes[i].duration}[a${i}]`).join(';') +
    ';' + files.map((_, i) => `[a${i}]`).join('') + `concat=n=${files.length}:v=0:a=1[out]`;
  ff([...inputs, '-filter_complex', fc, '-map', '[out]', '-c:a', 'pcm_s16le', out]);
}

console.log('• English narration (Windows SAPI)');
const build = path.join(P, '_build');
const jobs = project.scenes.map((s, i) => ({ text: s.narration.en, file: path.join(build, `en_${i}.wav`) }));
fs.writeFileSync(path.join(build, 'en_jobs.json'), JSON.stringify(jobs));
const ps = `
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Speech
$jobs = Get-Content -Raw -Encoding UTF8 '${path.join(build, 'en_jobs.json')}' | ConvertFrom-Json
$s = New-Object System.Speech.Synthesis.SpeechSynthesizer
$s.Rate = 1
foreach ($j in $jobs) { $s.SetOutputToWaveFile($j.file); $s.Speak($j.text) }
$s.Dispose()`;
const r = spawnSync('powershell.exe', ['-NoProfile', '-Command', ps], { stdio: 'inherit' });
let enFiles = jobs.map((j) => j.file);
if (r.status !== 0 || !enFiles.every((f) => fs.existsSync(f))) {
  console.warn('  SAPI unavailable — using placeholder tones for English too');
  enFiles = null;
}

function toneFiles(lang, freq) {
  return project.scenes.map((s, i) => {
    const f = path.join(build, `${lang}_${i}.wav`);
    // gentle "voice-like" placeholder: soft tone with tremolo, fading, 75% of scene length
    ff(['-f', 'lavfi', '-i', `sine=frequency=${freq + i * 12}:duration=${(s.duration * 0.75).toFixed(2)}`,
      '-af', `volume=0.08,tremolo=f=5:d=0.6,afade=t=in:d=0.15,afade=t=out:st=${(s.duration * 0.75 - 0.3).toFixed(2)}:d=0.3`, f]);
    return f;
  });
}
alignedTrack(enFiles || toneFiles('en', 300), path.join(P, 'audio', 'en_narration.wav'));
console.log('• Bangla / Hindi placeholder narration');
alignedTrack(toneFiles('bn', 220), path.join(P, 'audio', 'bn_narration.wav'));
alignedTrack(toneFiles('hi', 260), path.join(P, 'audio', 'hi_narration.wav'));

console.log('• Ambient BGM');
ff(['-f', 'lavfi', '-i', 'sine=frequency=110:duration=40', '-f', 'lavfi', '-i', 'sine=frequency=164.81:duration=40',
  '-f', 'lavfi', '-i', 'sine=frequency=220:duration=40', '-f', 'lavfi', '-i', 'anoisesrc=color=pink:amplitude=0.02:duration=40',
  '-filter_complex', '[0][1][2][3]amix=inputs=4:normalize=0,tremolo=f=0.2:d=0.4,lowpass=f=1800,volume=0.5,afade=t=in:d=2,afade=t=out:st=37:d=3,aformat=channel_layouts=stereo[a]',
  '-map', '[a]', '-c:a', 'libmp3lame', '-b:a', '160k', path.join(P, 'audio', 'bgm.mp3')]);

fs.rmSync(build, { recursive: true, force: true });
console.log(`\n✓ Sample project ready: ${P}  (${project.total_duration_seconds}s, ${project.scenes.length} scenes)`);
