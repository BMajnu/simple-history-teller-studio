const fs = require('fs');
const path = require('path');
const projDir = path.resolve(__dirname, '..', 'projects', 'simple_itihash_002_first_language');
const project = JSON.parse(fs.readFileSync(path.join(projDir, 'project.json'), 'utf8'));
const seoPath = path.join(projDir, 'metadata', 'youtube_seo.json');
const seo = JSON.parse(fs.readFileSync(seoPath, 'utf8'));

const INTRO = project.shorts_config?.intro_thumbnail_sec ?? 0.8;
const HANDLES = { bn: '@SimpleHistoryTellerBangla', en: '@SimpleHistoryTellerOfficial', hi: '@SimpleHistoryTellerHindi' };
const CTA = {
  bn: '🔔 নতুন ইতিহাসের গল্প মিস করতে চান না? সাবস্ক্রাইব করুন এখানে:',
  en: "🔔 Never miss a new history story. Subscribe here:",
  hi: '🔔 नई इतिहास कहानियों को न मिस करें। सब्सक्राइब करें:',
};
const SHORTS_LINE = {
  bn: '🎬 এই গল্পের ছোট পর্বগুলো চ্যানেলের Shorts সেকশনে পাবেন:',
  en: '🎬 Short parts of this story are on our Shorts section:',
  hi: '🎬 इस कहानी के छोटे पर्व हमारे Shorts सेक्शन में हैं:',
};
const INTRO_CHAPTER = { bn: 'সূচনা', en: 'Intro', hi: 'सूचना' };

function fmt(t) {
  t = Math.round(t);
  const h = Math.floor(t / 3600), m = Math.floor((t % 3600) / 60), s = t % 60;
  return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}` : `${m}:${String(s).padStart(2, '0')}`;
}

for (const lang of ['bn', 'en', 'hi']) {
  const scenes = project.scenes;
  const cum = [];
  let acc = 0;
  for (const sc of scenes) { cum.push(acc); acc += (sc.language_durations?.[lang] ?? sc.duration ?? 0); }
  const total = INTRO + acc;

  const chapters = [['0:00', INTRO_CHAPTER[lang]]];
  let prevSec = 0;
  for (const p of project.shorts_config.parts) {
    const sec = Math.round(INTRO + (cum[p.sceneStart - 1] ?? 0));
    if (sec - prevSec < 10) continue;
    prevSec = sec;
    chapters.push([fmt(sec), p['title_' + lang]]);
  }

  const base = (seo[lang].description || '').trim();
  const hashtags = [...new Set((base.match(/#\S+/g) || []))];
  const cleanBase = base.replace(/#\S+/g, '').trim();
  const lines = [
    cleanBase,
    '',
    ...chapters.map(([t, title]) => `${t} ${title}`),
    '',
    `${CTA[lang]} https://www.youtube.com/${HANDLES[lang]}`.trim(),
    `${SHORTS_LINE[lang]} https://www.youtube.com/${HANDLES[lang]}/shorts`,
    '',
    hashtags.slice(0, 10).join(' '),
  ];
  const description = lines.join('\n');

  seo[lang].master_upload = {
    video_file: `exports/video_${lang}.mp4`,
    title: seo[lang].title.trim(),
    description,
    tags: [...new Set(seo[lang].tags.map(t => t.trim()))],
    chapters,
    duration_seconds: Math.round(total),
    language: { bn: 'bn', en: 'en-US', hi: 'hi-IN' }[lang],
    made_for_kids: false,
    handle: HANDLES[lang],
    prepared_at: new Date().toISOString(),
  };
  console.log(lang, '=> chapters:', chapters.length, '| desc len:', description.length, '| tags chars:', seo[lang].master_upload.tags.join(',').length, '| title len:', seo[lang].title.length, '| total:', Math.round(total) + 's');
}
fs.writeFileSync(seoPath, JSON.stringify(seo, null, 2));
console.log('master_upload blocks written to youtube_seo.json');
