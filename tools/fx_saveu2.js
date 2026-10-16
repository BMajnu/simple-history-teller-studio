// Payload: save longest audio of u/2 music tab to node (node writes file).
const pg = browser.contexts()[0].pages().find((p) => (p.url() || '').includes('/app/u/2/new_music')) || null;
if (!pg) return { fail: 'no u2 tab' };
const pic = await pg.evaluate(async () => {
  const all = Array.from(document.querySelectorAll('audio')).map((a) => ({ d: a.duration || 0, el: a }));
  all.sort((x, y) => y.d - x.d);
  const t = all.length ? all[0].el : null;
  if (!t || !(t.duration > 10)) return null;
  const r = await fetch(t.src || t.currentSrc); const b = await r.blob();
  return await new Promise((res) => { const fr = new FileReader();
    fr.onloadend = () => res({ data: fr.result.split(',')[1], dur: t.duration }); fr.readAsDataURL(b); });
});
if (!pic) return { fail: 'no audio' };
return { ok: true, dur: Math.round(pic.dur), b64: pic.data };
