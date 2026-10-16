// Payload: read-only state of worker-0 tab (find by MULTI-1 prompt, no focus steal).
const ctx = browser.contexts()[0];
let found = null;
for (const p of ctx.pages()) {
  try {
    const t = await p.evaluate(() => document.body.innerText.slice(0, 3000));
    if (t.includes('TEST MULTI-1')) { found = p; break; }
  } catch (e) {}
}
if (!found) return { fail: 'multi-0 tab gone' };
return await found.evaluate(() => ({
  url: location.href.slice(0, 70),
  auds: Array.from(document.querySelectorAll('audio')).map((a) => ({ d: Math.round(a.duration || -1), rs: a.readyState, src: (a.src || a.currentSrc || '').slice(0, 60) })),
  spin: /thinking|generating|composing/i.test(document.body.innerText.slice(0, 3000)),
  err: (document.body.innerText.match(/Failed[^.]{0,80}\.|paid API key[^.]{0,80}|quota[^.]{0,60}|rate limit[^.]{0,60}|limit reached[^.]{0,60}|try again[^.]{0,40}/i) || [null])[0],
})).catch((e) => ({ err2: 1 }));
