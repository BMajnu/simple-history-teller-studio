// Payload: read-only state of both dispatched music tabs (no focus steal).
const ctx = browser.contexts()[0];
const out = [];
for (const p of ctx.pages()) {
  const u = p.url() || '';
  if (!u.includes('/app/u/')) continue;
  try {
    const st = await p.evaluate(() => ({
      url: location.href.slice(0, 80),
      auds: Array.from(document.querySelectorAll('audio')).map((a) => Math.round(a.duration || 0)),
      spin: /thinking|generating|composing|queued/i.test(document.body.innerText.slice(0, 3000)),
      err: (document.body.innerText.match(/Failed[^.]{0,80}\.|permission denied[^.]{0,80}|paid API key[^.]{0,80}|quota[^.]{0,60}|rate limit[^.]{0,60}|limit reached[^.]{0,60}|try again[^.]{0,40}/i) || [null])[0],
    }));
    out.push(st);
  } catch (e) { out.push({ url: u.slice(0, 60), err2: 1 }); }
}
return out;
