// Payload: harvest longest audio per music tab (numbers, not .dur — bugfix).
const ctx = browser.contexts()[0];
const out = [];
for (const p of ctx.pages()) {
  const u = p.url() || '';
  if (!u.includes('/app/u/')) continue;
  try {
    const pic = await p.evaluate(async () => {
      const all = Array.from(document.querySelectorAll('audio')).map((a) => ({ d: a.duration || 0, el: a }));
      all.sort((x, y) => y.d - x.d);
      const t = all.length ? all[0].el : null;
      if (!t || !(t.duration > 10)) return null;
      const r = await fetch(t.src || t.currentSrc); const b = await r.blob();
      return await new Promise((res) => { const fr = new FileReader();
        fr.onloadend = () => res({ data: fr.result.split(',')[1], dur: t.duration }); fr.readAsDataURL(b); });
    });
    out.push({ url: u.slice(0, 60), ok: !!pic, dur: pic ? Math.round(pic.dur) : 0, b64: pic ? pic.data : null });
  } catch (e) { out.push({ url: u.slice(0, 60), fail: 1 }); }
}
return out;
