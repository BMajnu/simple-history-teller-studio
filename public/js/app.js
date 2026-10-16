/* Simple History Teller — Production Studio frontend (vanilla JS) */
const $ = (id) => document.getElementById(id);
const LANGS = { bn: 'বাংলা', en: 'English', hi: 'हिंदी' };
const LANG_FULL = { bn: 'Simple History Teller Bangla', en: 'Simple History Teller', hi: 'Simple History Teller Hindi' };
const PRESET_LABEL = {
  PRESET_STICKY_MEME: '🎭 Sticky-Meme',
  PRESET_SIMPLE_HISTORY: '🏛️ Simple-History',
  PRESET_MYSTERY_NOIR: '🕵️ Mystery-Noir',
  PRESET_ISLAMIC_REVERENT: '🕌 Islamic-Reverent',
};
const MOTION_LABEL = { static: 'Static', zoom_in: 'Zoom in (Ken Burns)', zoom_out: 'Zoom out', pan_left: 'Pan left', pan_right: 'Pan right', ai_video: 'AI video clip' };
const VIDEO_RE = /\.(mp4|mov|webm|mkv)(\?|$)/i;

/* Floating Lower-Third Character & Host Speaker Registry */
const SPEAKER_META = {
  TIME_CHRONICLER: {
    icon: '🎙️',
    cssClass: 'speaker-badge-host',
    bn: { name: 'সময়ের সাক্ষী', role: 'হোস্ট ও গল্পকথক' },
    en: { name: 'The Time Chronicler', role: 'Host & Storyteller' },
    hi: { name: 'समय का साक्षी', role: 'सूत्रधार एवं कहानीकार' }
  },
  HUNTER_CHIEF: {
    icon: '🏹',
    cssClass: 'speaker-badge-hunter',
    bn: { name: 'শিকারি প্রধান', role: 'আদিম কৌম নেতা' },
    en: { name: 'Hunter Chief', role: 'Egalitarian Leader' },
    hi: { name: 'शिकारी सरदार', role: 'शिकारी कबीला' }
  },
  WARLORD: {
    icon: '⚔️',
    cssClass: 'speaker-badge-warlord',
    bn: { name: 'লুগাল (যুদ্ধনেতা)', role: 'মেসোপটেমিয়ার প্রথম শাসক' },
    en: { name: 'Sumerian Warlord (Lugal)', role: 'First Ruler' },
    hi: { name: 'सुमेरियन युद्धनेता (लुगाल)', role: 'पहला शासक' }
  },
  SUMERIAN_ENSI: {
    icon: '⚔️',
    cssClass: 'speaker-badge-warlord',
    bn: { name: 'এনসি (নগরপ্রধান)', role: 'প্রাচীন উরুক নগর' },
    en: { name: 'Ensi (City Governor)', role: 'Ancient Uruk' },
    hi: { name: 'एनसी (नगर प्रमुख)', role: 'प्राचीन उरुक' }
  },
  PHARAOH_NARMER: {
    icon: '👑',
    cssClass: 'speaker-badge-host',
    bn: { name: 'ফারাও নারমার', role: 'মিশরের প্রথম ঐক্যবদ্ধ ফারাও' },
    en: { name: 'Pharaoh Narmer', role: 'First Pharaoh of Egypt' },
    hi: { name: 'फ़राओ नार्मर', role: 'मिस्र का पहला सम्राट' }
  },
  HAMMURABI: {
    icon: '⚖️',
    cssClass: 'speaker-badge-host',
    bn: { name: 'সম্রাট হাম্মুরাবি', role: 'ব্যাবিলনের বিধাতা' },
    en: { name: 'King Hammurabi', role: 'Babylonian Lawgiver' },
    hi: { name: 'सम्राट हम्मुराबी', role: 'बेबीलोन के शासक' }
  },
  SUMERIAN_PRIEST: {
    icon: '🏛️',
    cssClass: 'speaker-badge-priest',
    bn: { name: 'সুমেরীয় পুরোহিত', role: 'প্রধান জিকুরাত' },
    en: { name: 'Sumerian High Priest', role: 'Grand Ziggurat' },
    hi: { name: 'सुमेरियन मुख्य पुरोहित', role: 'मुख्य ज़िगुरात' }
  },
  PRIEST_VOICE: {
    icon: '🏛️',
    cssClass: 'speaker-badge-priest',
    bn: { name: 'সুমেরীয় পুরোহিত', role: 'প্রধান জিকুরাত' },
    en: { name: 'Sumerian Priest', role: 'Grand Ziggurat' },
    hi: { name: 'सुमेरियन पुरोहित', role: 'मुख्य ज़िगुरात' }
  },
  ELDER: {
    icon: '👴',
    cssClass: 'speaker-badge-character',
    bn: { name: 'কৌম প্রবীণ', role: 'অভিজ্ঞ শিকারি' },
    en: { name: 'Tribal Elder', role: 'Elder Forager' },
    hi: { name: 'कबीलाई बुज़ुर्ग', role: 'अनुभवी शिकारी' }
  },
  BABYLON_DEBTOR: {
    icon: '⛓️',
    cssClass: 'speaker-badge-character',
    bn: { name: 'ব্যাবিলনীয় নাগরিক', role: 'ঋণগ্রস্ত প্রজা' },
    en: { name: 'Babylonian Debtor', role: 'Indebted Citizen' },
    hi: { name: 'बेबीलोन का नागरिक', role: 'कर्ज़दार प्रजा' }
  },
  FARMER_VOICE: {
    icon: '🌾',
    cssClass: 'speaker-badge-character',
    bn: { name: 'প্রাচীন কৃষক', role: 'উদ্বৃত্ত শস্য উৎপাদনকারী' },
    en: { name: 'Ancient Farmer', role: 'Grain Producer' },
    hi: { name: 'प्राचीन किसान', role: 'अन्न उत्पादक' }
  },
  CITIZEN: {
    icon: '👥',
    cssClass: 'speaker-badge-character',
    bn: { name: 'প্রাচীন নাগরিক', role: 'সাধারণ প্রজা' },
    en: { name: 'Ancient Citizen', role: 'Common Subject' },
    hi: { name: 'प्राचीन नागरिक', role: 'आम प्रजा' }
  },
  NARRATOR: {
    icon: '📜',
    cssClass: 'speaker-badge-narrator',
    bn: { name: 'ইতিহাস কথক', role: 'মূল ধারাভাষ্য' },
    en: { name: 'Historical Narrator', role: 'Documentary Voice' },
    hi: { name: 'इतिहास वाचक', role: 'मुख्य कथावाचक' }
  }
};

function updateSpeakerBadge(speakerKey, lang = S.previewLang) {
  const badge = $('pvSpeakerBadge');
  if (!badge) return;
  const key = speakerKey || 'NARRATOR';
  const meta = SPEAKER_META[key] || {
    icon: '🎙️',
    cssClass: 'speaker-badge-character',
    bn: { name: key, role: 'চরিত্র' },
    en: { name: key, role: 'Character' },
    hi: { name: key, role: 'पात्र' }
  };
  const langMeta = meta[lang] || meta.bn || meta.en;
  badge.className = `speaker-badge-container ${meta.cssClass}`;
  $('pvSpeakerIcon').textContent = meta.icon;
  $('pvSpeakerName').textContent = langMeta.name;
  $('pvSpeakerRole').textContent = langMeta.role;
  badge.classList.remove('hidden');
}

const S = {
  id: null, data: null, project: null, sel: 0,
  previewLang: 'bn', narLang: 'bn', dirty: false,
  playing: false, t: 0, clock0: 0, frameKey: null, es: null,
};

/* ------------------------------------------------------------ utilities */
const fmt = (t) => { t = Math.max(0, t || 0); const m = Math.floor(t / 60); return `${m}:${(t - m * 60).toFixed(1).padStart(4, '0')}`; };
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const dbToLin = (db) => Math.min(1, Math.pow(10, db / 20));
const icons = () => window.lucide && lucide.createIcons();
const sceneDur = (s, lang = S.previewLang) => (s?.language_durations && s.language_durations[lang]) || s?.duration || 4;
const total = () => (S.project?.language_total_durations && S.project.language_total_durations[S.previewLang]) || S.project?.total_duration_seconds || 0;
const getScenes = (lang = S.previewLang) => {
  let t = 0;
  return (S.project?.scenes || []).map((s) => {
    const d = sceneDur(s, lang);
    const st = t;
    t = +(t + d).toFixed(3);
    return { ...s, duration: d, timestamp_start: st, timestamp_end: t };
  });
};
const scene = () => S.project?.scenes[S.sel];

async function api(method, url, body) {
  const opt = { method, headers: {} };
  if (body instanceof FormData) opt.body = body;
  else if (body !== undefined) { opt.headers['Content-Type'] = 'application/json'; opt.body = JSON.stringify(body); }
  const r = await fetch(url, opt);
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j.error || r.statusText);
  return j;
}
let toastT;
function toast(msg, kind = 'ok') {
  const el = $('toast');
  el.textContent = msg;
  el.className = el.className.replace(/ring-\S+/g, '') + (kind === 'err' ? ' ring-red-500/50' : ' ring-amber-500/40');
  el.style.opacity = 1;
  clearTimeout(toastT); toastT = setTimeout(() => (el.style.opacity = 0), 2600);
}
async function copy(text) { await navigator.clipboard.writeText(text || ''); toast('Copied to clipboard'); }

function recompute() {
  let t = 0;
  for (const s of S.project.scenes) {
    s.duration = Math.max(0.5, +Number(s.duration || 4).toFixed(3));
    s.timestamp_start = +t.toFixed(3); t += s.duration; s.timestamp_end = +t.toFixed(3);
  }
  S.project.total_duration_seconds = +t.toFixed(3);
}
function markDirty() { S.dirty = true; $('dirtyDot').classList.remove('hidden'); }
function clearDirty() { S.dirty = false; $('dirtyDot').classList.add('hidden'); }
function assetUrl(s) {
  const a = S.data?.assets?.[s.scene_id];
  return a ? `${a.url}?v=${Math.round(a.mtime)}` : null;
}
function posterUrl(s) {
  const a = S.data?.assets?.[s.scene_id];
  return a?.posterUrl ? `${a.posterUrl}?v=${Math.round(a.mtime)}` : assetUrl(s);
}

/* ------------------------------------------------------------ loading */
async function loadProjects(selectId) {
  const list = await api('GET', '/api/projects');
  const sel = $('projectSelect');
  sel.innerHTML = list.length
    ? list.map((p) => `<option value="${esc(p.id)}">${esc(p.title)} · ${p.scenes} scenes · ${fmt(p.duration)}</option>`).join('')
    : '<option value="">No projects in /projects</option>';
  const id = selectId || localStorage.getItem('si_project') || list[0]?.id;
  if (id && list.some((p) => p.id === id)) { sel.value = id; await loadProject(id); }
}

async function loadProject(id, keepSel = false) {
  stop();
  S.id = id; localStorage.setItem('si_project', id);
  S.data = await api('GET', `/api/project/${id}`);
  S.project = S.data.project;
  if (!keepSel) { S.sel = 0; S.t = 0; }
  S.sel = Math.min(S.sel, S.project.scenes.length - 1);
  S.frameKey = null;
  clearDirty();
  const pb = $('presetBadge');
  pb.textContent = PRESET_LABEL[S.project.style_preset] || S.project.style_preset || '';
  pb.classList.toggle('hidden', !S.project.style_preset);
  $('fMotion').innerHTML = (S.data.motions || Object.keys(MOTION_LABEL)).map((m) => `<option value="${m}">${MOTION_LABEL[m] || m}</option>`).join('');
  setPreviewAudio();
  renderAll();
  connectRenderStream();
}

async function save() {
  if (!S.project) return;
  try {
    recompute();
    S.project = await api('PUT', `/api/project/${S.id}`, S.project);
    clearDirty(); toast('Project saved');
  } catch (e) { toast(e.message, 'err'); throw e; }
}

/* ------------------------------------------------------------ rendering UI */
function renderAll() {
  renderSceneList(); renderTimeline(); renderInspector(); renderAudioRows(); renderLaunch(); renderOutputs();
  showFrame(S.t); icons();
}

function renderSceneList() {
  const scenes = getScenes();
  $('sceneStats').textContent = `${scenes.length} · ${fmt(total())} (${LANGS[S.previewLang]})`;
  $('sceneList').innerHTML = scenes.map((s, i) => {
    const orig = S.project.scenes[i];
    const url = assetUrl(orig);
    const pUrl = posterUrl(orig);
    const isVid = url && VIDEO_RE.test(url);
    const thumb = !url ? `<div class="scene-thumb grid place-items-center text-slate-600"><i data-lucide="image-off" class="w-4 h-4"></i></div>`
      : isVid ? `<video class="scene-thumb" src="${url}#t=0.5" poster="${pUrl || ''}" muted preload="metadata"></video>`
      : `<img class="scene-thumb" src="${url}" loading="lazy" />`;
    const txt = orig.narration?.[S.previewLang] || orig.narration?.en || '';
    return `<div class="scene-card ${i === S.sel ? 'active' : ''}" data-i="${i}">
      ${thumb}
      <div class="min-w-0 flex-1">
        <div class="flex items-center gap-1.5 text-[11px]">
          <span class="font-mono font-bold text-brand-400">#${i + 1}</span>
          <span class="text-slate-500 font-mono">${s.duration.toFixed(1)}s</span>
          ${isVid ? '<span class="text-purple-400 font-semibold">AI CLIP</span>' : orig.type === 'DYNAMIC_AI_VIDEO' ? '<span class="text-amber-400 font-semibold" title="Showing base image">BASE POSTER</span>' : ''}
          ${!isVid && (s.duration > 15 || s.duration < 3) ? '<span class="text-amber-500" title="Pacing outside 3–15s">●</span>' : ''}
        </div>
        <div class="text-[10px] text-slate-500 truncate">${esc(orig.dialogue_speaker || 'NARRATOR')}</div>
        <div class="text-[12px] text-slate-300 leading-snug line-clamp-2">${esc(txt)}</div>
      </div></div>`;
  }).join('');
}

function renderTimeline() {
  const T = total() || 1;
  const scenes = getScenes();
  $('tTot').textContent = fmt(total());
  $('timeline').innerHTML = scenes.map((s, i) => {
    const orig = S.project.scenes[i];
    const url = assetUrl(orig);
    const pUrl = posterUrl(orig);
    const isVid = url && VIDEO_RE.test(url);
    const bg = pUrl ? `background-image:url('${pUrl}')` : isVid ? 'background:linear-gradient(135deg,#581c87,#1e1b4b)' : 'background:#1e293b';
    return `<div class="tl-seg ${isVid ? 'video' : ''} ${i === S.sel ? 'active' : ''}" data-i="${i}" style="width:${(s.duration / T) * 100}%;${bg}" title="#${i + 1} · ${s.duration}s"><span>${i + 1}</span></div>`;
  }).join('') + '<div class="playhead" id="playhead"></div>';
  // audio lane for preview language
  const a = S.data.audio[S.previewLang];
  const lane = $('audioLane');
  if (!a?.duration) { lane.innerHTML = `<div class="absolute inset-0 text-[9px] leading-3 pl-1 text-slate-600">no ${LANGS[S.previewLang]} narration</div>`; }
  else {
    const over = a.duration > T + 0.05;
    const w = Math.min(100, (a.duration / T) * 100);
    lane.innerHTML = `<div class="h-full ${Math.abs(a.duration - T) > 1.5 ? 'bg-amber-500/50' : 'bg-emerald-500/40'}" style="width:${w}%"></div>
      <div class="absolute right-1 top-0 text-[9px] leading-3 text-slate-400">${LANGS[S.previewLang]} ${fmt(a.duration)}${over ? ' ⚠ longer than timeline' : ''}</div>`;
  }
}

function renderInspector() {
  const s = scene();
  if (!s) return;
  const scenes = getScenes();
  const ls = scenes[S.sel] || s;
  $('inspId').textContent = `#${S.sel + 1} · id ${s.scene_id} · ${fmt(ls.timestamp_start)}–${fmt(ls.timestamp_end)} (${LANGS[S.previewLang]})`;
  $('fDuration').value = ls.duration;
  $('fSpeaker').value = s.dialogue_speaker || '';
  $('fType').value = s.type || 'STATIC_IMAGE';
  $('fMotion').value = s.motion_effect || 'static';
  $('fSfx').value = s.sfx || '';
  $('fPrompt').value = s.visual_prompt || '';
  $('durWarn').classList.toggle('hidden', s.type === 'DYNAMIC_AI_VIDEO' || (ls.duration >= 3 && ls.duration <= 15));
  document.querySelectorAll('#narTabs .lang-pill').forEach((b) => b.classList.toggle('active', b.dataset.lang === S.narLang));
  $('fNarration').value = s.narration?.[S.narLang] || '';
  updateNarStats();
  const url = assetUrl(s);
  const isVid = url && VIDEO_RE.test(url);
  $('dzThumb').classList.toggle('hidden', !url || isVid);
  $('dzVid').classList.toggle('hidden', !isVid);
  if (url && !isVid) $('dzThumb').src = url;
  if (isVid && $('dzVid').getAttribute('src') !== url) $('dzVid').src = url;
  if (!isVid) $('dzVid').removeAttribute('src');
  const assetObj = S.data?.assets?.[s.scene_id];
  $('dzPath').textContent = assetObj?.isFallback ? `${s.asset_file} (fallback: base image)` : (s.asset_file || '(no asset)');
}
function updateNarStats() {
  const s = scene(); if (!s) return;
  const words = ($('fNarration').value.trim().match(/\S+/g) || []).length;
  $('narWords').textContent = `${words} words`;
  $('narPace').textContent = s.duration ? `${Math.round((words / s.duration) * 60)} wpm at ${s.duration}s` : '';
}

function renderAudioRows() {
  const row = (key, label, a, extra = '') => {
    const d = a?.duration;
    const targetT = key === 'bgm' ? total() : (S.project?.language_total_durations?.[key] || total());
    const diff = d ? d - targetT : 0;
    const status = !a ? '<span class="text-red-400">Missing</span>'
      : `<span class="font-mono">${fmt(d)}</span> <span class="${Math.abs(diff) > 1.0 ? 'text-amber-400' : 'text-emerald-400'} text-xs">(${diff >= 0 ? '+' : ''}${diff.toFixed(1)}s vs ${key} timeline: ${fmt(targetT)})</span>`;
    return `<div class="card p-3 flex items-center gap-4">
      <div class="w-56"><div class="font-semibold text-sm">${label}</div><div class="text-[11px] text-slate-500 font-mono">${key === 'bgm' ? 'audio/bgm.*' : `audio/${key}_narration.*`}</div></div>
      <div class="flex-1 text-sm">${status}</div>
      ${a ? `<audio controls preload="none" src="${a.url}?v=${Math.round(a.mtime)}" class="h-8 w-64"></audio>` : ''}
      ${extra}
      <label class="btn-ghost border border-white/10 cursor-pointer"><i data-lucide="upload" class="w-4 h-4"></i>Upload
        <input type="file" accept="audio/*" class="hidden" data-upload="${key}" /></label>
    </div>`;
  };
  $('audioRows').innerHTML =
    Object.keys(LANGS).map((l) => row(l, `🎙️ ${LANG_FULL[l]}`, S.data.audio[l],
      S.data.audio[l]?.duration ? `<button class="btn-ghost border border-white/10" data-fit="${l}" title="Sync timeline to narration"><i data-lucide="move-horizontal" class="w-4 h-4"></i>Fit timeline</button>` : '')).join('') +
    row('bgm', '🎵 Background music (shared)', S.data.bgm) +
    `<div class="text-[11px] text-slate-500 px-1 pt-1">Visuals and cut points are tailored dynamically per language (${fmt(total())} for ${LANGS[S.previewLang]}). Zero empty pauses between scenes.</div>`;
  icons();
}

function renderLaunch() {
  const seo = S.data.seo || {};
  const md = S.project.metadata || {};
  $('launchCards').innerHTML = Object.keys(LANGS).map((l) => {
    const e = seo[l] || {};
    const th = S.data.thumbnails[l];
    const title = e.title ?? md[`title_${l}`] ?? '';
    return `<div class="card p-3 space-y-2" data-seo="${l}">
      <div class="flex items-center justify-between"><div class="font-semibold text-sm">${LANG_FULL[l]}</div><span class="text-[10px] text-slate-500 font-mono">${l.toUpperCase()}</span></div>
      <label class="block relative aspect-video rounded-lg overflow-hidden bg-white/5 cursor-pointer group">
        ${th ? `<img src="${th.url}?v=${Math.round(th.mtime)}" class="w-full h-full object-cover" />`
             : `<div class="absolute inset-0 grid place-items-center text-xs text-slate-500"><div class="text-center"><i data-lucide="image-plus" class="w-6 h-6 mx-auto mb-1"></i>Upload ${l}_thumbnail</div></div>`}
        <div class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 grid place-items-center text-xs transition">Replace thumbnail</div>
        <input type="file" accept="image/*" class="hidden" data-thumb="${l}" />
      </label>
      ${field('Title', `<input class="glass-input w-full" data-k="title" value="${esc(title)}" maxlength="100" />`, 'title', title.length + '/100')}
      ${field('Description', `<textarea rows="5" class="glass-input w-full text-xs" data-k="description">${esc(e.description || '')}</textarea>`, 'description')}
      ${field('Tags (comma separated)', `<input class="glass-input w-full text-xs" data-k="tags" value="${esc((e.tags || []).join(', '))}" />`, 'tags')}
    </div>`;
  }).join('');
  icons();
  function field(label, input, key, hint = '') {
    return `<div><div class="flex items-center justify-between"><div class="label">${label} <span class="normal-case tracking-normal text-slate-600">${hint}</span></div>
      <button class="text-[11px] text-slate-400 hover:text-brand-400 flex items-center gap-1" data-copy="${key}"><i data-lucide="copy" class="w-3 h-3"></i>Copy</button></div>${input}</div>`;
  }
}
function collectSeo() {
  const out = { ...(S.data.seo || {}) };
  document.querySelectorAll('[data-seo]').forEach((card) => {
    const l = card.dataset.seo;
    const v = (k) => card.querySelector(`[data-k="${k}"]`).value;
    out[l] = { ...(out[l] || {}), title: v('title'), description: v('description'), tags: v('tags').split(',').map((t) => t.trim()).filter(Boolean) };
  });
  return out;
}

/* ------------------------------------------------------------ preview player */
function setPreviewAudio() {
  const a = S.data?.audio?.[S.previewLang];
  const nar = $('narAudio');
  if (a) nar.src = `${a.url}?v=${Math.round(a.mtime)}`; else nar.removeAttribute('src');
  const b = S.data?.bgm;
  const bgm = $('bgmAudio');
  if (b) { if (!bgm.src.includes(b.url)) bgm.src = `${b.url}?v=${Math.round(b.mtime)}`; } else bgm.removeAttribute('src');
  bgm.volume = dbToLin(+$('bgmDb').value);
  document.querySelectorAll('#previewLangSwitch .lang-pill').forEach((btn) => btn.classList.toggle('active', btn.dataset.lang === S.previewLang));
}

function sceneIndexAt(t) {
  const sc = getScenes();
  const i = sc.findIndex((s) => t >= s.timestamp_start && t < s.timestamp_end);
  return i < 0 ? sc.length - 1 : i;
}

function showFrame(t) {
  if (!S.project?.scenes.length) return;
  const scenes = getScenes();
  const i = sceneIndexAt(t);
  const s = scenes[i];
  const orig = S.project.scenes[i];
  const local = t - s.timestamp_start;
  const p = Math.min(1, Math.max(0, local / s.duration));
  const url = assetUrl(orig);
  const isVid = url && VIDEO_RE.test(url);
  const img = $('pvImg'), vid = $('pvVid');
  const key = `${i}|${url}|${S.previewLang}`;
  if (S.frameKey !== key) {
    S.frameKey = key;
    $('pvEmpty').classList.toggle('hidden', !!url);
    img.classList.toggle('hidden', !url || isVid);
    vid.classList.toggle('hidden', !isVid);
    if (url && !isVid) img.src = url;
    if (isVid) { vid.src = url; vid.currentTime = local; } else { vid.pause(); vid.removeAttribute('src'); }
    $('pvSceneTag').textContent = `#${i + 1} · ${orig.dialogue_speaker || 'NARRATOR'}`;
    $('pvTypeTag').textContent = isVid ? 'AI CLIP' : MOTION_LABEL[orig.motion_effect] || '';
    $('pvSubtitle').textContent = orig.narration?.[S.previewLang] || '';
    updateSpeakerBadge(orig.dialogue_speaker || 'NARRATOR', S.previewLang);
    document.querySelectorAll('.scene-card').forEach((c) => c.classList.toggle('playing', +c.dataset.i === i && S.playing));
  }
  if (isVid) {
    // Slow-Match mirror (server segmentArgs): clip shorter than scene audio -> auto
    // slow-motion (rate = clipDur/sceneDur, min 0.5x), else loop-fill. Never freeze.
    const vdur = vid.duration || 0;
    let rate = 1, target = Math.min(local, (vdur || 999) - 0.05);
    if (vdur > 0.5 && vdur < s.duration - 0.05) {
      const want = vdur / s.duration;
      if (want >= 0.5) { rate = want; target = Math.min(local * rate, vdur - 0.05); }
      else { rate = 1; target = local % vdur; }
    }
    if (vid.playbackRate !== rate) vid.playbackRate = rate;
    $('pvTypeTag').textContent = rate < 1 ? `AI CLIP · slow ${rate.toFixed(2)}x` : 'AI CLIP';
    if (S.playing) { if (Math.abs(vid.currentTime - target) > 0.3) vid.currentTime = target; if (vid.paused && target < vdur - 0.02) vid.play().catch(() => {}); }
    else { vid.pause(); if (Math.abs(vid.currentTime - target) > 0.05) vid.currentTime = target; }
  } else {
    const Z = 0.12, pan = (Z / 2 / (1 + Z)) * 100 * 2;
    img.style.transform = {
      zoom_in: `scale(${1 + Z * p})`,
      zoom_out: `scale(${1 + Z - Z * p})`,
      pan_right: `scale(${1 + Z}) translateX(${(0.5 - p) * pan}%)`,
      pan_left: `scale(${1 + Z}) translateX(${(p - 0.5) * pan}%)`,
    }[s.motion_effect] || 'none';
  }
  $('tCur').textContent = fmt(t);
  const ph = $('playhead');
  if (ph) ph.style.left = `${(t / (total() || 1)) * 100}%`;
}

function play() {
  if (!S.project) return;
  if (S.t >= total() - 0.05) S.t = 0;
  S.playing = true; S.frameKey = null;
  S.clock0 = performance.now() - S.t * 1000;
  const nar = $('narAudio'), bgm = $('bgmAudio');
  if (nar.getAttribute('src')) { nar.currentTime = S.t; nar.play().catch(() => {}); }
  if (bgm.getAttribute('src') && $('optBgm').checked) { bgm.volume = dbToLin(+$('bgmDb').value); bgm.currentTime = bgm.duration ? S.t % bgm.duration : 0; bgm.play().catch(() => {}); }
  $('playIcon').setAttribute('data-lucide', 'pause'); icons();
  requestAnimationFrame(tick);
}
function stop() {
  S.playing = false;
  $('narAudio').pause(); $('bgmAudio').pause(); $('pvVid').pause();
  $('playIcon')?.setAttribute('data-lucide', 'play'); icons();
  document.querySelectorAll('.scene-card.playing').forEach((c) => c.classList.remove('playing'));
}
function tick() {
  if (!S.playing) return;
  S.t = (performance.now() - S.clock0) / 1000;
  const nar = $('narAudio');
  if (nar.getAttribute('src') && !nar.paused && Math.abs(nar.currentTime - S.t) > 0.3 && S.t < (nar.duration || 0)) nar.currentTime = S.t;
  if (S.t >= total()) { S.t = total(); showFrame(S.t - 0.001); stop(); return; }
  const i = sceneIndexAt(S.t);
  if (i !== S.sel) { S.sel = i; highlightSel(); }
  showFrame(S.t);
  requestAnimationFrame(tick);
}
function seek(t, select = true) {
  S.t = Math.max(0, Math.min(total(), t));
  S.clock0 = performance.now() - S.t * 1000;
  const nar = $('narAudio');
  if (nar.getAttribute('src')) nar.currentTime = Math.min(S.t, nar.duration || S.t);
  S.frameKey = null;
  if (select) { const i = sceneIndexAt(S.t); if (i !== S.sel) { S.sel = i; highlightSel(); } }
  showFrame(S.t);
}
function selectScene(i, doSeek = true) {
  S.sel = Math.max(0, Math.min(S.project.scenes.length - 1, i));
  highlightSel();
  if (doSeek) seek(S.project.scenes[S.sel].timestamp_start + 0.001, false);
}
function highlightSel() {
  document.querySelectorAll('.scene-card').forEach((c) => c.classList.toggle('active', +c.dataset.i === S.sel));
  document.querySelectorAll('.tl-seg').forEach((c) => c.classList.toggle('active', +c.dataset.i === S.sel));
  document.querySelector('.scene-card.active')?.scrollIntoView({ block: 'nearest' });
  renderInspector();
}

/* ------------------------------------------------------------ uploads */
async function uploadFile(file, fields) {
  if (S.dirty) await save();
  const fd = new FormData();
  Object.entries(fields).forEach(([k, v]) => fd.append(k, v));
  fd.append('file', file);
  toast(`Uploading ${file.name}…`);
  await api('POST', `/api/project/${S.id}/upload`, fd);
  await loadProject(S.id, true);
  toast(`${file.name} uploaded`);
}

/* ------------------------------------------------------------ render stream */
function connectRenderStream() {
  S.es?.close();
  $('renderLog').textContent = '';
  const es = new EventSource(`/api/project/${S.id}/render-status`);
  S.es = es;
  es.addEventListener('reset', () => { $('renderLog').textContent = ''; });
  es.addEventListener('log', (e) => {
    const el = $('renderLog');
    const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 20;
    el.textContent += JSON.parse(e.data) + '\n';
    if (atBottom) el.scrollTop = el.scrollHeight;
  });
  es.addEventListener('state', (e) => {
    const j = JSON.parse(e.data);
    if (!j) return;
    const running = j.status === 'running';
    $('renderStage').textContent = j.status === 'error' ? `✗ ${j.stage}` : j.stage || 'Idle';
    $('renderStage').className = j.status === 'error' ? 'text-red-400' : j.status === 'done' ? 'text-emerald-400' : 'text-slate-300';
    $('renderPct').textContent = `${Math.round(j.progress || 0)}%`;
    $('renderBar').style.width = `${j.progress || 0}%`;
    $('btnRender').disabled = running;
    $('btnCancel').classList.toggle('hidden', !running);
    if (S.lastStatus === 'running' && j.status === 'done') { toast('Render finished 🎉'); refreshRenders(); }
    S.lastStatus = j.status;
  });
}
async function refreshRenders() {
  const d = await api('GET', `/api/project/${S.id}`);
  S.data.renders = d.renders; renderOutputs();
}
function renderOutputs() {
  const r = S.data?.renders || [];
  $('renderOutputs').innerHTML = r.map((o) => `<a href="${o.url}?v=${Math.round(o.mtime)}" target="_blank" class="btn-ghost border border-emerald-500/30 text-emerald-300 text-xs"><i data-lucide="film" class="w-3.5 h-3.5"></i>${o.name} <span class="text-slate-500">${(o.size / 1048576).toFixed(1)} MB</span></a>`).join('') +
    (r.length ? `<button class="btn-ghost border border-white/10 text-xs" id="btnOpenRenders"><i data-lucide="folder-open" class="w-3.5 h-3.5"></i>Open renders folder</button>` : '');
  $('btnOpenRenders')?.addEventListener('click', () => api('POST', `/api/project/${S.id}/open-folder`, { sub: 'renders' }));
  icons();
}

/* ------------------------------------------------------------ events */
function bindField(id, key, transform = (v) => v, after) {
  const el = $(id);
  if (!el) return;
  el.addEventListener('input', (e) => {
    const s = scene(); if (!s) return;
    s[key] = transform(e.target.value);
    markDirty(); after?.();
  });
}
function wire() {
  $('projectSelect').addEventListener('change', async (e) => {
    if (S.dirty && !confirm('Discard unsaved changes?')) { e.target.value = S.id; return; }
    await loadProject(e.target.value);
  });
  $('btnSave').addEventListener('click', save);
  $('btnReload').addEventListener('click', () => { if (!S.dirty || confirm('Discard unsaved changes?')) loadProject(S.id, true); });
  $('btnOpenFolder').addEventListener('click', () => api('POST', `/api/project/${S.id}/open-folder`, {}));

  $('btnPlay').addEventListener('click', () => (S.playing ? stop() : play()));
  $('btnPrev').addEventListener('click', () => selectScene(S.sel - 1));
  $('btnNext').addEventListener('click', () => selectScene(S.sel + 1));
  $('sceneList').addEventListener('click', (e) => { const c = e.target.closest('.scene-card'); if (c) selectScene(+c.dataset.i); });
  $('timeline').addEventListener('click', (e) => {
    const r = $('timeline').getBoundingClientRect();
    seek(((e.clientX - r.left) / r.width) * total());
  });
  document.querySelectorAll('#previewLangSwitch .lang-pill').forEach((b) => b.addEventListener('click', () => {
    const wasPlaying = S.playing; stop();
    S.previewLang = b.dataset.lang; S.frameKey = null;
    setPreviewAudio(); renderSceneList(); renderTimeline(); seek(S.t, false); icons();
    if (wasPlaying) play();
  }));
  $('bgmDb').addEventListener('input', (e) => {
    $('bgmDbLabel').textContent = `${e.target.value} dB`;
    $('bgmAudio').volume = dbToLin(+e.target.value);
  });

  // inspector
  const relayout = () => { recompute(); renderSceneList(); renderTimeline(); highlightSel(); seek(S.t, false); icons(); };
  bindField('fDuration', 'duration', (v) => Math.max(0.5, parseFloat(v) || 0.5), () => { recompute(); renderSceneList(); renderTimeline(); updateNarStats(); icons();
    const s = scene(); $('durWarn').classList.toggle('hidden', s.type === 'DYNAMIC_AI_VIDEO' || (s.duration >= 3 && s.duration <= 5)); });
  bindField('fSpeaker', 'dialogue_speaker', (v) => v, () => { S.frameKey = null; showFrame(S.t); });
  bindField('fType', 'type');
  bindField('fMotion', 'motion_effect', (v) => v, () => { S.frameKey = null; showFrame(S.t); });
  bindField('fSfx', 'sfx');
  bindField('fPrompt', 'visual_prompt');
  $('fNarration').addEventListener('input', (e) => {
    const s = scene(); s.narration = s.narration || {}; s.narration[S.narLang] = e.target.value;
    markDirty(); updateNarStats();
    if (S.narLang === S.previewLang) $('pvSubtitle').textContent = e.target.value;
  });
  document.querySelectorAll('#narTabs .lang-pill').forEach((b) => b.addEventListener('click', () => { S.narLang = b.dataset.lang; renderInspector(); }));
  $('btnCopyPrompt').addEventListener('click', () => copy($('fPrompt').value));

  const newScene = (base = {}) => ({
    scene_id: Math.max(0, ...S.project.scenes.map((s) => +s.scene_id || 0)) + 1,
    duration: 4, type: 'STATIC_IMAGE', dialogue_speaker: 'NARRATOR', narration: { bn: '', en: '', hi: '' },
    visual_prompt: '', asset_file: '', sfx: '', motion_effect: 'static',
    ...JSON.parse(JSON.stringify(base)),
  });
  $('btnAddScene').addEventListener('click', () => { S.project.scenes.splice(S.sel + 1, 0, newScene()); S.sel++; markDirty(); relayout(); });
  $('btnDupScene').addEventListener('click', () => {
    const copyS = newScene({ ...scene(), scene_id: undefined });
    copyS.scene_id = Math.max(...S.project.scenes.map((s) => +s.scene_id || 0)) + 1;
    S.project.scenes.splice(S.sel + 1, 0, copyS); S.sel++; markDirty(); relayout();
  });
  $('btnDelScene').addEventListener('click', () => {
    if (S.project.scenes.length <= 1) return toast('A project needs at least one scene', 'err');
    if (!confirm(`Delete scene #${S.sel + 1}? (asset file stays on disk)`)) return;
    S.project.scenes.splice(S.sel, 1); S.sel = Math.min(S.sel, S.project.scenes.length - 1); markDirty(); relayout();
  });

  // dropzone
  const dz = $('dropzone');
  dz.addEventListener('click', () => $('fileInput').click());
  $('fileInput').addEventListener('change', (e) => { const f = e.target.files[0]; e.target.value = ''; if (f) uploadFile(f, { kind: 'scene', sceneId: scene().scene_id }).catch((er) => toast(er.message, 'err')); });
  dz.addEventListener('dragover', (e) => { e.preventDefault(); dz.classList.add('over'); });
  dz.addEventListener('dragleave', () => dz.classList.remove('over'));
  dz.addEventListener('drop', (e) => {
    e.preventDefault(); dz.classList.remove('over');
    const f = e.dataTransfer.files[0];
    if (f) uploadFile(f, { kind: 'scene', sceneId: scene().scene_id }).catch((er) => toast(er.message, 'err'));
  });

  // tabs
  document.querySelectorAll('#tabs .tab').forEach((t) => t.addEventListener('click', () => {
    document.querySelectorAll('#tabs .tab').forEach((x) => x.classList.toggle('active', x === t));
    document.querySelectorAll('.panel').forEach((p) => p.classList.toggle('hidden', p.dataset.panel !== t.dataset.tab));
  }));

  // audio tab (delegated)
  $('audioRows').addEventListener('change', (e) => {
    const k = e.target.dataset.upload; const f = e.target.files?.[0];
    if (!k || !f) return;
    uploadFile(f, k === 'bgm' ? { kind: 'bgm' } : { kind: 'narration', lang: k }).catch((er) => toast(er.message, 'err'));
  });
  $('audioRows').addEventListener('click', (e) => {
    const b = e.target.closest('[data-fit]'); if (!b) return;
    const d = S.data.audio[b.dataset.fit]?.duration; const T = total();
    if (!d || !T) return;
    if (!confirm(`Scale all ${S.project.scenes.length} scene durations by ×${(d / T).toFixed(3)} so the timeline = ${fmt(d)}?`)) return;
    const f = d / T; let acc = 0;
    S.project.scenes.forEach((s, i, arr) => {
      if (i === arr.length - 1) s.duration = +(d - acc).toFixed(3);
      else { s.duration = +(s.duration * f).toFixed(2); acc += s.duration; }
    });
    markDirty(); recompute(); renderAll(); toast('Timeline fitted — remember to Save');
  });

  // launchpad (delegated)
  $('launchCards').addEventListener('change', (e) => {
    const l = e.target.dataset.thumb; const f = e.target.files?.[0];
    if (l && f) uploadFile(f, { kind: 'thumbnail', lang: l }).catch((er) => toast(er.message, 'err'));
  });
  $('launchCards').addEventListener('click', (e) => {
    const b = e.target.closest('[data-copy]'); if (!b) return;
    copy(b.closest('[data-seo]').querySelector(`[data-k="${b.dataset.copy}"]`).value);
  });
  $('launchCards').addEventListener('input', (e) => {
    if (e.target.dataset.k === 'title') e.target.closest('div').querySelector('.label span').textContent = `${e.target.value.length}/100`;
  });
  $('btnSaveSeo').addEventListener('click', async () => {
    try { S.data.seo = collectSeo(); await api('PUT', `/api/project/${S.id}/seo`, S.data.seo); toast('SEO saved'); } catch (er) { toast(er.message, 'err'); }
  });

  // render
  $('btnRender').addEventListener('click', async () => {
    try {
      if (S.dirty) await save();
      const langs = [...document.querySelectorAll('.rlang:checked')].map((c) => c.value);
      const exportShorts = $('optDualShorts') ? $('optDualShorts').checked : true;
      await api('POST', `/api/project/${S.id}/render`, { langs, bgmDb: +$('bgmDb').value, duck: $('optDuck').checked, useBgm: $('optBgm').checked, exportShorts });
    } catch (er) { toast(er.message, 'err'); }
  });
  $('btnCancel').addEventListener('click', () => api('POST', `/api/project/${S.id}/render/cancel`).catch((er) => toast(er.message, 'err')));

  // keyboard
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') { e.preventDefault(); save(); return; }
    if (/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) return;
    if (e.code === 'Space') { e.preventDefault(); S.playing ? stop() : play(); }
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') { e.preventDefault(); selectScene(S.sel + 1); }
    if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') { e.preventDefault(); selectScene(S.sel - 1); }
  });
  window.addEventListener('beforeunload', (e) => { if (S.dirty) { e.preventDefault(); e.returnValue = ''; } });
}

async function checkGpuHealth() {
  try {
    const data = await api('GET', '/api/health');
    if (data.gpu) {
      const isApu = data.gpu.isApu || /radeon|vega|intel|uhd|iris/i.test(data.gpu.name || '');
      if ($('gpuStatusText')) {
        $('gpuStatusText').textContent = data.gpu.isGpu
          ? (isApu ? 'APU Acceleration: ACTIVE' : 'GPU Acceleration: ACTIVE')
          : 'CPU Software Mode: ACTIVE';
      }
      if ($('gpuDeviceText')) $('gpuDeviceText').textContent = data.gpu.name;
      if ($('gpuSubText')) {
        $('gpuSubText').textContent = data.gpu.isGpu
          ? '⚡ ~2.5x–3.8x real-time hardware render (auto CPU fallback)'
          : '🛡️ Universal CPU mode (Zero Errors on any PC)';
      }
      if ($('gpuStatusDot')) {
        $('gpuStatusDot').className = data.gpu.isGpu
          ? 'w-2 h-2 rounded-full bg-emerald-400 animate-pulse'
          : 'w-2 h-2 rounded-full bg-sky-400';
      }
    }
  } catch (err) {
    console.warn('Hardware health check error:', err);
  }
}

wire();
icons();
checkGpuHealth();
loadProjects().catch((e) => toast(e.message, 'err'));
