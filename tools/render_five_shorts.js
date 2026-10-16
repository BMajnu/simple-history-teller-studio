// Render 5 full-coverage vertical Shorts from the complete BN master (767s).
// Reuses the dual-export filter/encoder (tools/dual_render_exporter.js).
// Run: node tools/render_five_shorts.js
// Out: projects/sample_first_king/renders/shorts_full/short_bn_full{P}.mp4 + shorts_full_meta.json
const { execFile, execFileSync } = require('child_process');
const fs = require('fs');
const fsp = fs.promises;
const path = require('path');
const { getHardwareEncoder } = require('./dual_render_exporter');

const ROOT = path.resolve(__dirname, '..');
const FFMPEG_BIN = path.join(ROOT, 'bin', 'ffmpeg.exe');
const PLAN = require('../projects/sample_first_king/metadata/shorts_plan.json');
const RDIR = path.join(ROOT, 'projects', 'sample_first_king', 'renders');
const MASTER = path.join(RDIR, 'video_bn.mp4');
const OUTDIR = path.join(RDIR, 'shorts_full');
const FULL_URL = 'https://youtu.be/ibG0M13m7I0';
const TAGS = '#shorts #bangla #ইতিহাস #প্রথম_রাজা #simplehistorytellerbangla #banglaanimation';

const META = [
  { hook: 'মানুষ কীভাবে প্রথম রাজা বানাল?', pill: 'শিকারিকে উপহাস ও সাম্য!', title: 'মানুষ কীভাবে প্রথম রাজা বানাল? শিকারিকে উপহাস! [পর্ব ১ • ০:০০ - ২:৩৭] #Shorts #ইতিহাস', desc: '৩ লক্ষ বছর রাজা ছাড়াই মানুষ বাঁচত কীভাবে? কালাহারির শিকারিরা অহংকারীকে হাসিয়ে থামিয়ে দিত!\n\n👑 সম্পূর্ণ ভিডিও দেখুন: ' + FULL_URL + '\n\n' + TAGS },
  { hook: 'কৃষিকাজের মারণফাঁদ!', pill: 'শস্যভাণ্ডার ও প্রথম চুক্তি', title: 'কৃষিকাজের মারণফাঁদ ও প্রথম চুক্তি! [পর্ব ২ • ২:৩৭ - ৫:১০] #Shorts #ইতিহাস', desc: 'শস্যভাণ্ডার ভরতেই এলো লোভ আর ভয়! কৃষিকাজের ফাঁদে আটকে যাওয়া মানুষ নিরাপত্তার জন্য যোদ্ধার কাছে হাত পাতল।\n\n🌾 সম্পূর্ণ ভিডিও দেখুন: ' + FULL_URL + '\n\n' + TAGS },
  { hook: 'প্রথম চাঁদাবাজি!', pill: 'ইতিহাসের প্রথম ডন!', title: 'প্রথম চাঁদাবাজি ও ইতিহাসের প্রথম ডন! [পর্ব ৩ • ৫:১০ - ৭:৪৩] #Shorts #ইতিহাস', desc: 'ফসলের ২০% দাও, নইলে...! মানব ইতিহাসের প্রথম চাঁদাবাজি আর প্রথম ডনের আসল গল্প!\n\n⚔️ সম্পূর্ণ ভিডিও দেখুন: ' + FULL_URL + '\n\n' + TAGS },
  { hook: 'সুমেরীয় রাজা ও পিরামিড!', pill: 'মুকুট ও স্থায়ী সেনাবাহিনী', title: 'সুমেরীয় রাজা ও পিরামিডের ভয়! [পর্ব ৪ • ৭:৪৩ - ১০:১৬] #Shorts #ইতিহাস', desc: 'আকাশ থেকে নামল রাজতন্ত্র! সুমেরীয় রাজাতালিকা, সোনার মুকুট আর পিরামিডের ভয় দেখিয়ে শাসন!\n\n🏛️ সম্পূর্ণ ভিডিও দেখুন: ' + FULL_URL + '\n\n' + TAGS },
  { hook: 'রাজার পতন!', pill: 'আধুনিক রাষ্ট্রের জন্ম', title: 'রাজার পতন ও আধুনিক রাষ্ট্র! [পর্ব ৫ • ১০:১৬ - ১২:৪৭] #Shorts #ইতিহাস', desc: 'সব রাজারই পতন হয়! জাদুঘরের শবাধার থেকে আধুনিক রাষ্ট্র — ক্ষমতার চিরন্তন সত্য!\n\n⏳ সম্পূর্ণ ভিডিও দেখুন: ' + FULL_URL + '\n\n' + TAGS },
];

function runFFmpeg(args) {
  return new Promise((resolve, reject) => {
    execFile(FFMPEG_BIN, args, { maxBuffer: 64 * 1024 * 1024 }, (err, stdout, stderr) => {
      if (err) return reject(new Error('FFmpeg error: ' + err.message + '\n' + String(stderr).slice(-500)));
      resolve(stdout);
    });
  });
}

async function main() {
  if (!fs.existsSync(MASTER)) throw new Error('Master missing: ' + MASTER);
  fs.mkdirSync(OUTDIR, { recursive: true });
  const enc = getHardwareEncoder();
  console.log('Encoder: ' + enc.name);
  const out = [];
  for (const p of PLAN.parts) {
    const m = META[p.part - 1];
    const outName = 'short_bn_full' + p.part + '.mp4';
    const outPath = path.join(OUTDIR, outName);
    if (fs.existsSync(outPath) && fs.statSync(outPath).size > 1024 * 1024) {
      console.log('SKIP part ' + p.part + ' (exists)');
    } else {
      const fadeStart = Math.max(1, p.duration - 1.5);
      const fc = [
        '[0:v]scale=1920:1080,format=yuv420p,setpts=PTS-STARTPTS,split=2[v_bg][v_fg]',
        '[v_bg]scale=270:480:force_original_aspect_ratio=increase,crop=270:480,boxblur=4:2,scale=1080:1920,setsar=1[bg]',
        '[v_fg]scale=1080:608:force_original_aspect_ratio=decrease,setsar=1[fg]',
        '[bg][fg]overlay=0:656,setsar=1[v_out]',
        '[0:a]aresample=async=1000,asetpts=PTS-STARTPTS,afade=t=out:st=' + fadeStart + ':d=1.5[a_out]',
      ].join(';');
      const base = ['-y', '-ss', String(p.start), '-reinit_filter', '0', '-i', MASTER, '-filter_complex', fc, '-map', '[v_out]', '-map', '[a_out]', '-t', String(p.duration)];
      const t0 = Date.now();
      try {
        await runFFmpeg(base.concat(enc.args, ['-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', outPath]));
      } catch (e) {
        console.log('  GPU fail, CPU fallback for part ' + p.part);
        await runFFmpeg(base.concat(['-c:v', 'libx264', '-preset', 'veryfast', '-crf', '22', '-pix_fmt', 'yuv420p', '-r', '60', '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', outPath]));
      }
      console.log('PART' + p.part + ' rendered in ' + ((Date.now() - t0) / 1000).toFixed(0) + 's');
    }
    const st = fs.statSync(outPath);
    out.push({ part: p.part, file: outName, start: p.start, duration: p.duration, label: p.label, sizeMb: +(st.size / 1048576).toFixed(1), badge: 'পর্ব ' + p.part + ' • ' + p.label, hook: m.hook, pill: m.pill, title: m.title, desc: m.desc });
    console.log('PART' + p.part + ' OK ' + outName + ' ' + p.duration + 's ' + (st.size / 1048576).toFixed(1) + 'MB');
  }
  const metaPath = path.join(OUTDIR, 'shorts_full_meta.json');
  fs.writeFileSync(metaPath, JSON.stringify({ project: 'sample_first_king', fullVideo: FULL_URL, parts: out }, null, 2), 'utf8');
  console.log('Wrote ' + metaPath);
}

main().then(() => process.exit(0)).catch((e) => { console.error('FATAL:', e.message); process.exit(1); });
