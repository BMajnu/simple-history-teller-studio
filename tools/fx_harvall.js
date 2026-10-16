// Payload: harvest EVERY completed track from ALL music tabs (fresh handles only).
const ctx = browser.contexts()[0];
const out = [];
const pages = ctx.pages().filter((p) => (p.url() || '').includes('new_music'));
for (const pg of pages) {
  try {
    const info = await pg.evaluate(() => {
      const t = document.body.innerText;
      const title = (t.match(/(Epic Ancient Battle Theme|Tribal Celebration Dance Music|Lonely Desert Flute[^\n]{0,40})/) || [null])[0];
      const auds = Array.from(document.querySelectorAll('audio')).map((a) => Math.round(a.duration || 0));
      return { url: location.href.slice(0, 60), title, auds };
    });
    let b64 = null, dur = 0;
    if (info && (info.auds || []).some((d) => d > 10)) {
      const pic = await pg.evaluate(async () => {
        const all = Array.from(document.querySelectorAll('audio'));
        all.sort((a, b) => (b.duration || 0) - (a.duration || 0));
        const a = all[0];
        const r = await fetch(a.src || a.currentSrc); const blob = await r.blob();
        if (!blob.size) return null;
        return await new Promise((res) => { const fr = new FileReader();
          fr.onloadend = () => res({ data: fr.result.split(',')[1], dur: Math.round(a.duration || 0) }); fr.readAsDataURL(blob); });
      }).catch(() => null);
      if (pic) { b64 = pic.data; dur = pic.dur; }
    }
    out.push({ ...info, ok: !!b64, dur, b64 });
  } catch (e) { out.push({ fail: 1 }); }
}
return out;
