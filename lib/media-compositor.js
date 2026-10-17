/**
 * Simple Studio Pro — Media Compositor & Shorts / Thumbnail / Overlay Engine
 * Provides:
 * 1. Gemini Voice Name Sanitizer (strips Charon, Cruz, Fenrir, etc. from on-screen badges)
 * 2. AI Auto-Suggest & Custom Range Shorts Episode Planner (1..N parts with scene ranges)
 * 3. 9:16 Vertical Shorts Branded Overlay Plate Generator (Top Logo/Title + Bottom Main Video/CTA)
 * 4. Project-Based Thumbnail Generator (`thumbnails/master/` & `thumbnails/shorts/`)
 * 5. Scene Overlay Plate Generator (Text Cards, TV News Ticker, Channel Logo, Clean Speaker Badge)
 */

const fs = require('fs');
const fsp = fs.promises;
const path = require('path');
const os = require('os');
const { execFileSync } = require('child_process');
const { chromium } = require('playwright-core');

const GEMINI_VOICE_NAMES = [
  'Cruz', 'Charon', 'Orus', 'Enceladus', 'Rasalgethi', 'Sadaltager', 'Iapetus', 'Achird',
  'Fenrir', 'Algenib', 'Algieba', 'Alnilam', 'Puck', 'Sadachbia', 'Schedar', 'Umbriel',
  'Zubenelgenubi', 'Bodi', 'Koda', 'Kore', 'Aoede', 'Gacrux', 'Erinome', 'Despina',
  'Autonoe', 'Callirrhoe', 'Sulafat', 'Pulcherrima', 'Laomedeia', 'Zephyr', 'Leda',
  'Vindemiatrix', 'Achernar',
  'কারন', 'ক্রুজ', 'ফেনরির', 'পাক', 'ওরাস', 'কোর'
];

/**
 * Strips any Gemini AI Studio voice character name or speaker icon suffix from role/name strings
 * so the on-screen character badge NEVER displays "🔊 Charon" or similar voice IDs.
 */
function stripVoiceNameFromRole(text) {
  if (!text) return '';
  let s = String(text);
  s = s.replace(/[\s·|\-–—]*🔊\s*[A-Za-z\u0980-\u09FF\u0900-\u097F0-9_]+/gi, '');
  const voicePattern = GEMINI_VOICE_NAMES.join('|');
  const rxParen = new RegExp(`\\s*[\\(\\[\\{]\\s*(?:voice\\s*[:\\-]?\\s*)?(?:${voicePattern})\\s*[\\)\\]\\}]`, 'gi');
  const rxSuffix = new RegExp(`[\\s·|\\-–—]+(?:voice\\s*[:\\-]?\\s*)?(?:${voicePattern})\\b`, 'gi');
  s = s.replace(rxParen, '').replace(rxSuffix, '');
  return s.trim();
}

/**
 * AI Auto-Suggest & Custom Prompt Parser for Shorts Parts (Scene Start -> Scene End)
 */
function suggestShortsParts(project, lang = 'bn', requestedParts = 10, customPrompt = '', customRanges = null) {
  const scenes = Array.isArray(project?.scenes) ? project.scenes : [];
  const totalScenes = scenes.length;
  if (totalScenes === 0) return [];

  const getDur = (s, l) => (s?.language_durations && s.language_durations[l]) || s?.duration || 6;

  const sceneTimes = { bn: [], en: [], hi: [] };
  for (const l of ['bn', 'en', 'hi']) {
    let acc = 0;
    for (let i = 0; i < totalScenes; i++) {
      const d = Math.max(0.5, Number(getDur(scenes[i], l) || 6));
      sceneTimes[l].push({ start: +acc.toFixed(2), end: +(acc + d).toFixed(2), duration: +d.toFixed(2) });
      acc += d;
    }
  }

  let ranges = [];

  if (Array.isArray(customRanges) && customRanges.length > 0) {
    ranges = customRanges.map((r, idx) => ({
      partNum: idx + 1,
      sceneStart: Math.max(1, Math.min(totalScenes, parseInt(r.sceneStart || r.scene_start || 1, 10))),
      sceneEnd: Math.max(1, Math.min(totalScenes, parseInt(r.sceneEnd || r.scene_end || totalScenes, 10))),
      customTitleBn: r.title_bn || r.title || '',
      customTitleEn: r.title_en || '',
      customTitleHi: r.title_hi || '',
    }));
  }

  if (ranges.length === 0 && customPrompt && String(customPrompt).trim()) {
    const normPrompt = String(customPrompt)
      .replace(/[০-৯]/g, (d) => '০১২৩৪৫৬৭৮৯'.indexOf(d))
      .replace(/[०-९]/g, (d) => '०१२३४५६७८९'.indexOf(d));

    const rangeMatches = [...normPrompt.matchAll(/(\d{1,3})\s*(?:-|–|to|থেকে|से)\s*(\d{1,3})/gi)];
    if (rangeMatches.length >= 2) {
      ranges = rangeMatches.map((m, idx) => ({
        partNum: idx + 1,
        sceneStart: Math.max(1, Math.min(totalScenes, parseInt(m[1], 10))),
        sceneEnd: Math.max(1, Math.min(totalScenes, parseInt(m[2], 10))),
      }));
    } else {
      const numMatch = normPrompt.match(/(\d{1,2})\s*(?:parts?|shorts?|episodes?|টি|টা|পর্ব|পার্ট|ভাগ)/i);
      if (numMatch) {
        requestedParts = Math.max(1, Math.min(totalScenes, parseInt(numMatch[1], 10)));
      }
      const singleSpan = normPrompt.match(/(?:scene|সিন|পার্ট|ক্লিপ)?\s*(\d{1,3})\s*(?:-|–|to|থেকে)\s*(\d{1,3})/i);
      if (singleSpan) {
        const sStart = Math.max(1, Math.min(totalScenes, parseInt(singleSpan[1], 10)));
        const sEnd = Math.max(sStart, Math.min(totalScenes, parseInt(singleSpan[2], 10)));
        const spanLen = sEnd - sStart + 1;
        const pCount = Math.max(1, Math.min(spanLen, Number(requestedParts) || 5));
        for (let p = 0; p < pCount; p++) {
          const a = sStart + Math.floor((p * spanLen) / pCount);
          const b = p === pCount - 1 ? sEnd : sStart + Math.floor(((p + 1) * spanLen) / pCount) - 1;
          ranges.push({ partNum: p + 1, sceneStart: a, sceneEnd: Math.max(a, b) });
        }
      }
    }
  }

  if (ranges.length === 0) {
    const pCount = Math.max(1, Math.min(totalScenes, parseInt(requestedParts, 10) || 10));
    const totalDur = sceneTimes[lang].reduce((s, x) => s + x.duration, 0);
    const targetDurPerPart = totalDur / pCount;

    let curStartIdx = 0;
    for (let p = 0; p < pCount; p++) {
      if (curStartIdx >= totalScenes) break;
      if (p === pCount - 1) {
        ranges.push({ partNum: p + 1, sceneStart: curStartIdx + 1, sceneEnd: totalScenes });
        break;
      }
      const remainingParts = pCount - p;
      const maxEndIdx = totalScenes - remainingParts;

      let accumDur = 0;
      let bestEndIdx = curStartIdx;
      for (let i = curStartIdx; i <= maxEndIdx; i++) {
        accumDur += sceneTimes[lang][i].duration;
        bestEndIdx = i;
        if (accumDur >= targetDurPerPart * 0.92) {
          if (i + 1 <= maxEndIdx && scenes[i + 1]?.parent_beat !== scenes[i]?.parent_beat) {
            bestEndIdx = i;
          }
          break;
        }
      }
      if (bestEndIdx < curStartIdx) bestEndIdx = curStartIdx;
      ranges.push({ partNum: p + 1, sceneStart: curStartIdx + 1, sceneEnd: bestEndIdx + 1 });
      curStartIdx = bestEndIdx + 1;
    }
  }

  const mainTitleBn = project?.metadata?.title_bn || project?.title || project?.project_id || 'ইতিহাসের রহস্য';
  const mainTitleEn = project?.metadata?.title_en || project?.title || project?.project_id || 'Historical Documentary';
  const mainTitleHi = project?.metadata?.title_hi || mainTitleEn;

  const bnDigits = (n) => String(n).replace(/\d/g, (d) => '০১২৩৪৫৬৭৮৯'[d]);
  const hiDigits = (n) => String(n).replace(/\d/g, (d) => '०१२३४५६७८९'[d]);

  return ranges.map((r, idx) => {
    const partNum = idx + 1;
    const sStart = Math.max(1, Math.min(totalScenes, r.sceneStart));
    const sEnd = Math.max(sStart, Math.min(totalScenes, r.sceneEnd));
    const firstSc = scenes[sStart - 1] || scenes[0];
    const midSc = scenes[Math.floor((sStart - 1 + sEnd - 1) / 2)] || firstSc;

    const extractHook = (sc, l, fallbackTitle) => {
      const raw = (sc?.narration?.[l] || '').replace(/<[^>]+>/g, '').trim();
      if (!raw) return fallbackTitle;
      const firstClause = raw.split(/[।?!.!]/)[0].trim();
      return firstClause.length > 52 ? firstClause.slice(0, 50).trim() + '…' : (firstClause || fallbackTitle);
    };

    const hookBn = r.customTitleBn || `${extractHook(firstSc, 'bn', mainTitleBn)} [পর্ব ${bnDigits(partNum)}]`;
    const hookEn = r.customTitleEn || `${extractHook(firstSc, 'en', mainTitleEn)} [Part ${partNum}]`;
    const hookHi = r.customTitleHi || `${extractHook(firstSc, 'hi', mainTitleHi)} [भाग ${hiDigits(partNum)}]`;

    const calcSpan = (arr) => {
      const st = arr[sStart - 1]?.start || 0;
      const en = arr[sEnd - 1]?.end || st + 10;
      return { start: +st.toFixed(2), end: +en.toFixed(2), duration: +(en - st).toFixed(2) };
    };

    const spanBn = calcSpan(sceneTimes.bn);
    const spanEn = calcSpan(sceneTimes.en);
    const spanHi = calcSpan(sceneTimes.hi);
    const activeSpan = lang === 'en' ? spanEn : (lang === 'hi' ? spanHi : spanBn);

    const padPart = String(partNum).padStart(2, '0');
    return {
      partNum,
      sceneRange: [sStart, sEnd],
      sceneStart: sStart,
      sceneEnd: sEnd,
      sceneCount: sEnd - sStart + 1,
      startTime: activeSpan.start,
      endTime: activeSpan.end,
      duration: activeSpan.duration,
      language_spans: { bn: spanBn, en: spanEn, hi: spanHi },
      title_bn: hookBn,
      title_en: hookEn,
      title_hi: hookHi,
      main_title_bn: mainTitleBn,
      main_title_en: mainTitleEn,
      main_title_hi: mainTitleHi,
      cover_scene_id: midSc?.scene_id || firstSc?.scene_id || 1,
      thumbnail_files: {
        bn: `thumbnails/shorts/short_part_${padPart}_bn.png`,
        en: `thumbnails/shorts/short_part_${padPart}_en.png`,
        hi: `thumbnails/shorts/short_part_${padPart}_hi.png`,
      },
    };
  });
}

/**
 * Python Pillow multi-script compositor (auto-switches font per character run: Bengali, Devanagari, Latin)
 */
function runPillowScript(payloadObj) {
  const pyCode = `
import sys, json, os, re
from PIL import Image, ImageDraw, ImageFont

data = json.loads(sys.stdin.read())
mode = data.get("mode")
out_path = data.get("out_path")
lang = data.get("lang", "bn")

os.makedirs(os.path.dirname(os.path.abspath(out_path)), exist_ok=True)

FONT_Candidates = {
    "bn_bold": [
        "/usr/share/fonts/truetype/noto/NotoSansBengali-Bold.ttf",
        "C:\\\\Windows\\\\Fonts\\\\NirmalaB.ttf",
        "C:\\\\Windows\\\\Fonts\\\\Nirmala.ttf",
    ],
    "bn_reg": [
        "/usr/share/fonts/truetype/noto/NotoSansBengali-Regular.ttf",
        "C:\\\\Windows\\\\Fonts\\\\Nirmala.ttf",
    ],
    "hi_bold": [
        "/usr/share/fonts/truetype/noto/NotoSansDevanagari-Bold.ttf",
        "C:\\\\Windows\\\\Fonts\\\\NirmalaB.ttf",
        "C:\\\\Windows\\\\Fonts\\\\mangalb.ttf",
    ],
    "hi_reg": [
        "/usr/share/fonts/truetype/noto/NotoSansDevanagari-Regular.ttf",
        "C:\\\\Windows\\\\Fonts\\\\Nirmala.ttf",
        "C:\\\\Windows\\\\Fonts\\\\mangal.ttf",
    ],
    "en_bold": [
        "/usr/share/fonts/truetype/noto/NotoSans-Bold.ttf",
        "C:\\\\Windows\\\\Fonts\\\\arialbd.ttf",
        "C:\\\\Windows\\\\Fonts\\\\segoeuib.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
    ],
    "en_reg": [
        "/usr/share/fonts/truetype/noto/NotoSans-Regular.ttf",
        "C:\\\\Windows\\\\Fonts\\\\arial.ttf",
        "C:\\\\Windows\\\\Fonts\\\\segoeui.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
    ]
}

_font_cache = {}
def get_font(script_code, bold=True, size=32):
    ck = (script_code, bold, size)
    if ck in _font_cache:
        return _font_cache[ck]
    key = f"{script_code}_{'bold' if bold else 'reg'}"
    cands = FONT_Candidates.get(key, []) + FONT_Candidates["en_bold" if bold else "en_reg"]
    for p in cands:
        if os.path.exists(p):
            try:
                f = ImageFont.truetype(p, size)
                _font_cache[ck] = f
                return f
            except Exception:
                pass
    f = ImageFont.load_default()
    _font_cache[ck] = f
    return f

def sanitize_emojis(text):
    if not text:
        return ""
    s = str(text)
    # Strip emoji variation selectors and astral plane emojis that TTF fonts lack
    s = re.sub(r'[\\U00010000-\\U0010ffff]', '', s)
    s = re.sub(r'[\\u2600-\\u27bf\\ufe0f]', '', s)
    return re.sub(r'\\s+', ' ', s).strip()

def split_script_runs(text):
    text = sanitize_emojis(text)
    if not text:
        return []
    runs = []
    cur_script = None
    cur_chars = []
    for ch in text:
        cp = ord(ch)
        if 0x0980 <= cp <= 0x09FF:
            sc = "bn"
        elif 0x0900 <= cp <= 0x097F:
            sc = "hi"
        elif ch.isspace() or ch in ".,!?:;-–—()[]|/'\\"":
            sc = cur_script or "en"
        else:
            sc = "en"
        if sc != cur_script and cur_chars:
            runs.append((cur_script, "".join(cur_chars)))
            cur_chars = [ch]
            cur_script = sc
        else:
            cur_script = sc
            cur_chars.append(ch)
    if cur_chars:
        runs.append((cur_script or "en", "".join(cur_chars)))
    return runs

def measure_mixed_text(draw, text, size=32, bold=True):
    runs = split_script_runs(text)
    total_w = 0
    max_h = size
    for sc, seg in runs:
        f = get_font(sc, bold, size)
        bb = draw.textbbox((0, 0), seg, font=f)
        total_w += (bb[2] - bb[0])
        max_h = max(max_h, bb[3] - bb[1])
    return total_w, max_h

def draw_mixed_text(draw, xy, text, size=32, bold=True, fill=(255,255,255,255), shadow=False, stroke=0):
    x, y = int(xy[0]), int(xy[1])
    runs = split_script_runs(text)
    cur_x = x
    for sc, seg in runs:
        f = get_font(sc, bold, size)
        if stroke > 0:
            for dx in (-stroke, 0, stroke):
                for dy in (-stroke, 0, stroke):
                    if dx != 0 or dy != 0:
                        draw.text((cur_x + dx, y + dy), seg, font=f, fill=(0, 0, 0, 255))
        elif shadow:
            draw.text((cur_x + 2, y + 3), seg, font=f, fill=(0, 0, 0, 230))
        draw.text((cur_x, y), seg, font=f, fill=fill)
        bb = draw.textbbox((0, 0), seg, font=f)
        cur_x += (bb[2] - bb[0])
    return cur_x - x

def wrap_mixed_text(draw, text, size, bold, max_w, max_lines=2):
    text = sanitize_emojis(text)
    words = text.split()
    if not words:
        return []
    lines = []
    cur = words[0]
    for w in words[1:]:
        test = cur + " " + w
        tw, _ = measure_mixed_text(draw, test, size, bold)
        if tw <= max_w:
            cur = test
        else:
            lines.append(cur)
            cur = w
            if len(lines) >= max_lines - 1:
                break
    used_words = sum(len(x.split()) for x in lines)
    rem = words[used_words:]
    if rem:
        last_ln = " ".join(rem)
        while len(last_ln) > 4:
            tw, _ = measure_mixed_text(draw, last_ln, size, bold)
            if tw <= max_w:
                break
            last_ln = last_ln[:-2].rstrip() + "..."
        lines.append(last_ln)
    return lines[:max_lines]

def paste_circular_logo(canvas, logo_path, x, y, size):
    if logo_path and os.path.exists(logo_path):
        try:
            lg = Image.open(logo_path).convert("RGBA").resize((size, size), Image.Resampling.LANCZOS)
            mask = Image.new("L", (size, size), 0)
            mdraw = ImageDraw.Draw(mask)
            mdraw.ellipse((0, 0, size - 1, size - 1), fill=255)
            ring = ImageDraw.Draw(canvas)
            ring.ellipse((x - 3, y - 3, x + size + 3, y + size + 3), fill=(245, 196, 81, 255))
            canvas.paste(lg, (x, y), mask)
            return True
        except Exception:
            pass
    d = ImageDraw.Draw(canvas)
    d.ellipse((x, y, x + size, y + size), fill=(245, 196, 81, 255), outline=(255, 255, 255, 220), width=2)
    draw_mixed_text(d, (x + size * 0.30, y + size * 0.16), "S", int(size * 0.50), True, (10, 14, 23, 255))
    return True

if mode == "shorts_overlay":
    W, H = 1080, 1920
    img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    vid_y1 = int(data.get("vid_y1", 560))
    vid_h = int(data.get("vid_h", 640))
    vid_y2 = vid_y1 + vid_h

    # Top Header Card (y=36 .. vid_y1 - 24)
    draw.rounded_rectangle((36, 36, W - 36, vid_y1 - 24), radius=28, fill=(9, 13, 22, 228), outline=(245, 196, 81, 180), width=3)
    draw.rounded_rectangle((84, 36, W - 84, 44), radius=4, fill=(245, 196, 81, 255))

    # Channel Logo + Channel Name + Handle
    logo_path = data.get("logo_path", "")
    paste_circular_logo(img, logo_path, 68, 66, 84)

    channel_name = data.get("channel_name", "Simple History Teller Bangla")
    channel_handle = data.get("channel_handle", "@SimpleHistoryTellerBangla")
    draw_mixed_text(draw, (172, 70), channel_name, 30, True, (255, 255, 255, 255))
    draw_mixed_text(draw, (172, 112), channel_handle, 21, False, (148, 163, 184, 240))

    # Part Badge Pill on Top Right
    part_label = data.get("part_label", "পর্ব ১")
    pw, _ = measure_mixed_text(draw, part_label, 28, True)
    pb_w = pw + 48
    draw.rounded_rectangle((W - 68 - pb_w, 72, W - 68, 136), radius=18, fill=(245, 196, 81, 255))
    draw_mixed_text(draw, (W - 68 - pb_w + 24, 84), part_label, 28, True, (9, 13, 22, 255))

    # Highlighted Short Title Box inside Top Header
    short_title = data.get("short_title", "")
    draw.rounded_rectangle((62, 172, W - 62, vid_y1 - 48), radius=22, fill=(18, 26, 44, 240), outline=(255, 230, 0, 200), width=2)
    t_lines = wrap_mixed_text(draw, short_title, 42, True, W - 180, max_lines=3)
    line_y = 200 if len(t_lines) >= 3 else (225 if len(t_lines) == 2 else 255)
    for ln in t_lines:
        lw, _ = measure_mixed_text(draw, ln, 42, True)
        draw_mixed_text(draw, ((W - lw) // 2, line_y), ln, 42, True, (255, 234, 95, 255), shadow=True)
        line_y += 60

    # Gold border lines around active 16:9 / 4:3 video slot
    draw.rectangle((0, vid_y1 - 4, W, vid_y1), fill=(245, 196, 81, 240))
    draw.rectangle((0, vid_y2, W, vid_y2 + 4), fill=(245, 196, 81, 240))

    # Bottom Footer Card (y=vid_y2 + 26 .. H - 42)
    draw.rounded_rectangle((36, vid_y2 + 26, W - 36, H - 42), radius=28, fill=(9, 13, 22, 228), outline=(56, 189, 248, 135), width=2)

    main_label = data.get("main_video_label", "মূল ভিডিও / FULL DOCUMENTARY")
    main_title = data.get("main_title", "")
    ml_w, _ = measure_mixed_text(draw, main_label, 23, True)
    draw.rounded_rectangle((68, vid_y2 + 54, 68 + ml_w + 36, vid_y2 + 98), radius=10, fill=(245, 196, 81, 45), outline=(245, 196, 81, 150), width=1)
    draw_mixed_text(draw, (86, vid_y2 + 61), main_label, 23, True, (245, 196, 81, 255))

    m_lines = wrap_mixed_text(draw, main_title, 33, True, W - 150, max_lines=2)
    my = vid_y2 + 116
    for mln in m_lines:
        draw_mixed_text(draw, (72, my), mln, 33, True, (241, 245, 249, 255), shadow=True)
        my += 48

    # Bottom CTA Subscribe Pill
    cta_text = data.get("cta_text", "সম্পূর্ণ ভিডিও দেখুন চ্যানেলে • SUBSCRIBE")
    draw.rounded_rectangle((68, H - 158, W - 68, H - 72), radius=22, fill=(220, 38, 38, 245), outline=(255, 255, 255, 190), width=2)
    # Draw white play triangle inside CTA pill
    cw, _ = measure_mixed_text(draw, cta_text, 29, True)
    start_x = (W - (cw + 36)) // 2
    py_mid = H - 115
    draw.polygon([(start_x, py_mid - 12), (start_x, py_mid + 12), (start_x + 20, py_mid)], fill=(255, 255, 255, 255))
    draw_mixed_text(draw, (start_x + 32, H - 134), cta_text, 29, True, (255, 255, 255, 255))

    img.save(out_path, "PNG")
    print("OK")

elif mode == "thumbnail":
    is_short = bool(data.get("is_short", False))
    W, H = (1080, 1920) if is_short else (1920, 1080)
    bg_path = data.get("bg_path", "")
    if bg_path and os.path.exists(bg_path):
        try:
            bg = Image.open(bg_path).convert("RGBA")
            bw, bh = bg.size
            scale = max(W / bw, H / bh)
            nw, nh = int(bw * scale), int(bh * scale)
            bg = bg.resize((nw, nh), Image.Resampling.LANCZOS)
            left = (nw - W) // 2
            top = (nh - H) // 2
            img = bg.crop((left, top, left + W, top + H))
        except Exception:
            img = Image.new("RGBA", (W, H), (15, 23, 42, 255))
    else:
        img = Image.new("RGBA", (W, H), (15, 23, 42, 255))

    overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    odraw = ImageDraw.Draw(overlay)
    odraw.rectangle((0, 0, W, int(H * 0.25)), fill=(6, 9, 15, 175))
    odraw.rectangle((0, int(H * 0.58), W, H), fill=(6, 9, 15, 225))
    img = Image.alpha_composite(img, overlay)
    draw = ImageDraw.Draw(img)

    draw.rectangle((10, 10, W - 10, H - 10), outline=(245, 196, 81, 245), width=8)

    logo_path = data.get("logo_path", "")
    channel_name = data.get("channel_name", "Simple History Teller Bangla")
    badge_text = data.get("badge_text", "পর্ব ১")
    title_text = data.get("title_text", "Historical Documentary")

    if is_short:
        paste_circular_logo(img, logo_path, 56, 56, 90)
        draw_mixed_text(draw, (166, 78), channel_name, 32, True, (255, 255, 255, 255), shadow=True)

        bw, _ = measure_mixed_text(draw, badge_text, 36, True)
        pill_w = bw + 64
        draw.rounded_rectangle(((W - pill_w) // 2, 195, (W + pill_w) // 2, 275), radius=22, fill=(220, 38, 38, 255), outline=(255, 255, 255, 230), width=3)
        draw_mixed_text(draw, ((W - bw) // 2, 211), badge_text, 36, True, (255, 255, 255, 255))

        lines = wrap_mixed_text(draw, title_text, 62, True, W - 120, max_lines=3)
        ty = H - 520
        for ln in lines:
            lw, _ = measure_mixed_text(draw, ln, 62, True)
            draw_mixed_text(draw, ((W - lw) // 2, ty), ln, 62, True, (255, 230, 0, 255), stroke=4)
            ty += 88
    else:
        paste_circular_logo(img, logo_path, 56, 48, 86)
        draw_mixed_text(draw, (160, 68), channel_name, 33, True, (255, 255, 255, 255), shadow=True)

        bw, _ = measure_mixed_text(draw, badge_text, 32, True)
        pill_w = bw + 56
        draw.rounded_rectangle((W - pill_w - 56, 52, W - 56, 122), radius=18, fill=(220, 38, 38, 255), outline=(255, 255, 255, 230), width=3)
        draw_mixed_text(draw, (W - pill_w - 28, 66), badge_text, 32, True, (255, 255, 255, 255))

        lines = wrap_mixed_text(draw, title_text, 70, True, W - 160, max_lines=2)
        ty = H - 300 if len(lines) == 2 else H - 210
        for ln in lines:
            lw, _ = measure_mixed_text(draw, ln, 70, True)
            draw_mixed_text(draw, ((W - lw) // 2, ty), ln, 70, True, (255, 230, 0, 255), stroke=5)
            ty += 96

    img.convert("RGB").save(out_path, "PNG")
    print("OK")

elif mode == "scene_overlay":
    W, H = 1920, 1080
    img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # 1. Channel Logo Watermark
    logo_cfg = data.get("logo_config") or {}
    if logo_cfg.get("enabled", True):
        lpath = logo_cfg.get("logo_path", "")
        pos = logo_cfg.get("position", "top-right")
        lsize = int(logo_cfg.get("size", 68))
        lx = W - lsize - 42 if "right" in pos else 42
        ly = 38 if "top" in pos else H - lsize - 96
        paste_circular_logo(img, lpath, lx, ly, lsize)
        cname = logo_cfg.get("channel_name", "")
        if cname and logo_cfg.get("show_name", True):
            cw, _ = measure_mixed_text(draw, cname, 22, True)
            if "right" in pos:
                draw.rounded_rectangle((lx - cw - 34, ly + 12, lx - 10, ly + lsize - 12), radius=12, fill=(9, 13, 22, 205), outline=(245, 196, 81, 145), width=1)
                draw_mixed_text(draw, (lx - cw - 22, ly + 19), cname, 22, True, (245, 196, 81, 255))
            else:
                draw.rounded_rectangle((lx + lsize + 10, ly + 12, lx + lsize + cw + 34, ly + lsize - 12), radius=12, fill=(9, 13, 22, 205), outline=(245, 196, 81, 145), width=1)
                draw_mixed_text(draw, (lx + lsize + 22, ly + 19), cname, 22, True, (245, 196, 81, 255))

    # 2. Clean Speaker Badge (WITHOUT any Gemini voice name!)
    spk = data.get("speaker_badge") or {}
    if spk.get("enabled", True) and spk.get("name"):
        s_name = spk.get("name", "")
        s_role = spk.get("role", "")
        nw, _ = measure_mixed_text(draw, s_name, 25, True)
        rw, _ = measure_mixed_text(draw, s_role, 21, False) if s_role else (0, 0)
        bw = nw + (rw + 28 if s_role else 0) + 52
        by = H - 132 if (data.get("ticker") or {}).get("position") == "bottom" else H - 92
        draw.rounded_rectangle((48, by, 48 + bw, by + 54), radius=12, fill=(15, 20, 32, 218), outline=(245, 196, 81, 165), width=2)
        draw_mixed_text(draw, (68, by + 11), s_name, 25, True, (254, 240, 138, 255))
        if s_role:
            draw.line((68 + nw + 14, by + 12, 68 + nw + 14, by + 42), fill=(255, 255, 255, 90), width=2)
            draw_mixed_text(draw, (68 + nw + 26, by + 14), s_role, 21, False, (226, 232, 240, 235))

    # 3. Motion Text Card / Kinetic Typography Overlay
    tc = data.get("text_card") or {}
    tc_text = str(tc.get("text", "")).strip()
    if tc_text:
        tc_style = tc.get("style", "voice_of_dhaka_quote")
        lines = wrap_mixed_text(draw, tc_text, 36, True, 1100, max_lines=2)
        if tc_style == "vox_yellow_highlighter":
            draw.rounded_rectangle((120, 140, 1320, 140 + len(lines)*56 + 34), radius=14, fill=(255, 230, 0, 244), outline=(0, 0, 0, 255), width=3)
            y0 = 154
            for ln in lines:
                draw_mixed_text(draw, (148, y0), ln, 36, True, (10, 14, 23, 255))
                y0 += 52
        elif tc_style == "vox_crimson_stamp":
            draw.rounded_rectangle((120, 140, 1320, 140 + len(lines)*56 + 34), radius=14, fill=(185, 28, 28, 240), outline=(255, 255, 255, 220), width=3)
            y0 = 154
            for ln in lines:
                draw_mixed_text(draw, (148, y0), ln, 36, True, (255, 255, 255, 255))
                y0 += 52
        else:
            draw.rounded_rectangle((120, 140, 1340, 140 + len(lines)*56 + 40), radius=16, fill=(9, 13, 22, 230), outline=(245, 196, 81, 200), width=2)
            draw.rectangle((120, 140, 130, 140 + len(lines)*56 + 40), fill=(245, 196, 81, 255))
            y0 = 156
            for ln in lines:
                draw_mixed_text(draw, (152, y0), ln, 36, True, (248, 250, 252, 255))
                y0 += 52

    # 4. TV Channel News Ticker Bar (Top or Bottom)
    tk = data.get("ticker") or {}
    tk_text = str(tk.get("text", "")).strip()
    tk_pos = tk.get("position", "none")
    if tk_text and tk_pos in ("bottom", "top"):
        ty = H - 48 if tk_pos == "bottom" else 0
        draw.rectangle((0, ty, W, ty + 48), fill=(15, 23, 42, 240))
        draw.line((0, ty if tk_pos == "bottom" else ty + 48, W, ty if tk_pos == "bottom" else ty + 48), fill=(245, 196, 81, 220), width=2)
        draw.rectangle((0, ty, 210, ty + 48), fill=(220, 38, 38, 255))
        draw_mixed_text(draw, (22, ty + 10), tk.get("label", "UPDATE"), 22, True, (255, 255, 255, 255))
        draw_mixed_text(draw, (230, ty + 10), tk_text[:115], 23, False, (241, 245, 249, 255))

    img.save(out_path, "PNG")
    print("OK")
`;

  try {
    const pyBin = process.platform === 'win32' ? 'python' : 'python3';
    execFileSync(pyBin, ['-c', pyCode], {
      input: JSON.stringify(payloadObj),
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout: 15000,
    });
    return fs.existsSync(payloadObj.out_path);
  } catch (err) {
    return false;
  }
}

/* ------------------------------------------------------------------
 * Chrome-based plate renderer (replaces missing Python/Pillow).
 * Reproduces `shorts_overlay` & `thumbnail` modes 1:1 from the Pillow
 * reference design (colors, coords, sizes). Async; call with `await`.
 */
let _plateBrowser = null;

async function getPlateBrowser() {
  if (_plateBrowser && _plateBrowser.isConnected()) return _plateBrowser;
  const cands = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  ];
  const exe = cands.find((p) => fs.existsSync(p)) || '';
  _plateBrowser = await chromium.launch({
    executablePath: exe || undefined,
    headless: true,
    args: ['--no-sandbox', '--disable-gpu', '--force-color-profile=srgb'],
  });
  return _plateBrowser;
}

async function closePlateRenderer() {
  if (_plateBrowser) {
    try { await _plateBrowser.close(); } catch { /* ignore */ }
    _plateBrowser = null;
  }
}

function escPlate(s) {
  return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function plateShadow(stroke) {
  const o = [];
  for (const dx of [-stroke, 0, stroke]) for (const dy of [-stroke, 0, stroke]) {
    if (dx || dy) o.push(`${dx}px ${dy}px 0 #000`);
  }
  return o.join(',');
}

/** Shorts branded 9:16 overlay plate (1080x1920, transparent bg) — mirrors Pillow `shorts_overlay`. */
function htmlShortsOverlay(d) {
  const gold = '#F5C451';
  const logoInner = d.logo_path
    ? `<img src="${d.logo_url}" alt="">`
    : `<div style="position:absolute;left:0;top:0;width:84px;height:84px;border-radius:50%;background:${gold};color:rgb(9,13,22);font-size:42px;font-weight:700;display:flex;align-items:center;justify-content:center;">S</div>`;
  return `<!doctype html><html><head><meta charset="utf-8"><style>
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:1080px;height:1920px;background:rgba(0,0,0,0);font-family:'Nirmala UI','Noto Sans Bengali','Noto Sans Devanagari',sans-serif;overflow:hidden}
.abs{position:absolute}
#topcard{left:36px;top:36px;width:1008px;height:500px;background:rgba(9,13,22,0.894);border:3px solid rgba(245,196,81,0.706);border-radius:28px}
#accent{left:84px;top:36px;width:912px;height:8px;background:${gold};border-radius:4px}
#lring{left:65px;top:63px;width:90px;height:90px;background:${gold};border-radius:50%}
#lring img{position:absolute;left:3px;top:3px;width:84px;height:84px;border-radius:50%;object-fit:cover}
#cname{left:172px;top:70px;font-size:30px;font-weight:700;color:#fff;text-shadow:2px 3px 0 rgba(0,0,0,0.85)}
#chandle{left:172px;top:116px;font-size:21px;color:rgba(148,163,184,0.94)}
#pill{top:72px;height:64px;right:68px;background:${gold};border-radius:18px;display:flex;align-items:center;padding:0 24px;font-size:28px;font-weight:700;color:rgb(9,13,22)}
#titlebox{left:62px;top:172px;width:956px;height:340px;background:rgba(18,26,44,0.941);border:2px solid rgba(255,230,0,0.784);border-radius:22px;display:flex;align-items:center;justify-content:center}
#titlebox .t{font-size:42px;font-weight:700;color:rgb(255,234,95);line-height:60px;text-align:center;max-width:900px;text-shadow:2px 3px 0 rgba(0,0,0,0.9);display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
#sep1{left:0;top:556px;width:1080px;height:4px;background:rgba(245,196,81,0.941)}
#sep2{left:0;top:1200px;width:1080px;height:4px;background:rgba(245,196,81,0.941)}
#botcard{left:36px;top:1226px;width:1008px;height:652px;background:rgba(9,13,22,0.894);border:2px solid rgba(56,189,248,0.529);border-radius:28px}
#mlchip{left:68px;top:1254px;height:44px;background:rgba(245,196,81,0.176);border:1px solid rgba(245,196,81,0.588);border-radius:10px;display:flex;align-items:center;padding:0 18px;font-size:23px;font-weight:700;color:${gold}}
#mtitle{left:72px;top:1316px;width:936px;font-size:33px;font-weight:700;color:rgb(241,245,249);line-height:48px;text-shadow:2px 3px 0 rgba(0,0,0,0.9);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
#cta{left:68px;top:1762px;width:944px;height:86px;background:rgba(220,38,38,0.961);border:2px solid rgba(255,255,255,0.745);border-radius:22px;display:flex;align-items:center;justify-content:center;gap:14px}
#cta .tri{width:0;height:0;border-top:12px solid transparent;border-bottom:12px solid transparent;border-left:20px solid #fff}
#cta .txt{font-size:29px;font-weight:700;color:#fff}
</style></head><body>
<div id="topcard" class="abs"></div>
<div id="accent" class="abs"></div>
<div id="lring" class="abs">${logoInner}</div>
<div id="cname" class="abs">${escPlate(d.channel_name)}</div>
<div id="chandle" class="abs">${escPlate(d.channel_handle)}</div>
<div id="pill" class="abs">${escPlate(d.part_label)}</div>
<div id="titlebox" class="abs"><div class="t">${escPlate(d.short_title)}</div></div>
<div id="sep1" class="abs"></div>
<div id="sep2" class="abs"></div>
<div id="botcard" class="abs"></div>
<div id="mlchip" class="abs">${escPlate(d.main_video_label)}</div>
<div id="mtitle" class="abs">${escPlate(d.main_title)}</div>
<div id="cta" class="abs"><div class="tri"></div><div class="txt">${escPlate(d.cta_text)}</div></div>
</body></html>`;
}

/** Thumbnail plate (master 1920x1080 / short 1080x1920) — mirrors Pillow `thumbnail`. */
function htmlThumbnail(d) {
  const isShort = !!d.is_short;
  const W = isShort ? 1080 : 1920;
  const H = isShort ? 1920 : 1080;
  const gold = '#F5C451';
  const red = 'rgb(220,38,38)';
  const logoSize = isShort ? 90 : 86;
  const stroke = isShort ? 4 : 5;
  const fs = isShort ? 62 : 70;
  const lh = isShort ? 88 : 96;
  const cnameFs = isShort ? 32 : 33;
  const badgeFs = isShort ? 36 : 32;
  return `<!doctype html><html><head><meta charset="utf-8"><style>
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:${W}px;height:${H}px;overflow:hidden;font-family:'Nirmala UI','Noto Sans Bengali','Noto Sans Devanagari',sans-serif;background:rgb(15,23,42)}
#bg{position:absolute;left:0;top:0;width:${W}px;height:${H}px;object-fit:cover}
.band{position:absolute;left:0;width:${W}px}
#bandTop{top:0;height:${Math.round(H * 0.25)}px;background:rgba(6,9,15,0.686)}
#bandBot{top:${Math.round(H * 0.58)}px;bottom:0;background:rgba(6,9,15,0.882)}
#frame{position:absolute;left:10px;top:10px;width:${W - 20}px;height:${H - 20}px;border:8px solid rgba(245,196,81,0.961)}
.lring{position:absolute;width:${logoSize + 6}px;height:${logoSize + 6}px;background:${gold};border-radius:50%}
.lring img{position:absolute;left:3px;top:3px;width:${logoSize}px;height:${logoSize}px;border-radius:50%;object-fit:cover}
#cname{position:absolute;font-size:${cnameFs}px;font-weight:700;color:#fff;text-shadow:2px 3px 0 rgba(0,0,0,0.9)}
#badge{position:absolute;height:${isShort ? 80 : 70}px;background:${red};border:3px solid rgba(255,255,255,0.9);border-radius:22px;display:flex;align-items:center;font-size:${badgeFs}px;font-weight:700;color:#fff;padding:0 ${isShort ? 32 : 28}px;white-space:nowrap}
#title{position:absolute;font-size:${fs}px;font-weight:700;color:#FFE600;line-height:${lh}px;text-shadow:${plateShadow(stroke)};text-align:center;left:60px;width:${W - 120}px;display:-webkit-box;-webkit-line-clamp:${isShort ? 3 : 2};-webkit-box-orient:vertical;overflow:hidden}
</style></head><body>
${d.bg_url ? `<img id="bg" src="${d.bg_url}" alt="">` : ''}
<div id="bandTop" class="band"></div>
<div id="bandBot" class="band"></div>
<div id="frame"></div>
<div class="lring" style="left:56px;top:${isShort ? 56 : 48}px">${d.logo_url ? `<img src="${d.logo_url}">` : `<div style="position:absolute;left:0;top:0;width:${logoSize}px;height:${logoSize}px;border-radius:50%;background:${gold};color:rgb(9,13,22);font-size:${Math.round(logoSize * 0.5)}px;font-weight:700;display:flex;align-items:center;justify-content:center;">S</div>`}</div>
<div id="cname" style="left:${isShort ? 166 : 160}px;top:${isShort ? 78 : 68}px">${escPlate(d.channel_name)}</div>
<div id="badge" style="${isShort ? 'left:50%;transform:translateX(-50%);top:195px;' : 'right:56px;top:52px;border-radius:18px;'}">${escPlate(d.badge_text)}</div>
<div id="title" style="${isShort ? 'top:1400px;' : 'bottom:110px;'}">${escPlate(d.title_text)}</div>
</body></html>`;
}

/** Async plate renderer: shorts_overlay + thumbnail via headless Chrome (fallback: Pillow scene_overlay untouched). */
async function runPlateScript(payloadObj) {
  const outPath = payloadObj.out_path;
  try {
    if (payloadObj.mode === 'scene_overlay') return runPillowScript(payloadObj);
    let html;
    let W = 1080;
    let H = 1920;
    if (payloadObj.mode === 'shorts_overlay') {
      W = 1080; H = 1920;
      html = htmlShortsOverlay({ ...payloadObj, logo_url: payloadObj.logo_path ? require('url').pathToFileURL(payloadObj.logo_path).href : '' });
    } else if (payloadObj.mode === 'thumbnail') {
      W = payloadObj.is_short ? 1080 : 1920;
      H = payloadObj.is_short ? 1920 : 1080;
      html = htmlThumbnail({ ...payloadObj, bg_url: payloadObj.bg_path ? require('url').pathToFileURL(payloadObj.bg_path).href : '', logo_url: payloadObj.logo_path ? require('url').pathToFileURL(payloadObj.logo_path).href : '' });
    } else {
      return false;
    }
    const htmlFile = `${outPath}.html`;
    await fsp.mkdir(path.dirname(htmlFile), { recursive: true });
    await fsp.writeFile(htmlFile, html, 'utf8');
    const browser = await getPlateBrowser();
    const page = await browser.newPage();
    await page.setViewportSize({ width: W, height: H });
    await page.goto(require('url').pathToFileURL(htmlFile).href, { waitUntil: 'load', timeout: 30000 });
    await page.evaluate(() => document.fonts.ready.then(() => new Promise((r) => requestAnimationFrame(r))));
    await page.screenshot({ path: outPath, type: 'png', omitBackground: true });
    await page.close();
    await fsp.unlink(htmlFile).catch(() => {});
    return fs.existsSync(outPath);
  } catch (err) {
    return false;
  }
}

module.exports = {
  GEMINI_VOICE_NAMES,
  stripVoiceNameFromRole,
  suggestShortsParts,
  runPillowScript,
  runPlateScript,
  closePlateRenderer,
};
