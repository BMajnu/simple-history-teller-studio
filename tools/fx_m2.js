// Payload: read-only state of the MULTI-2 tab (no focus steal).
const ctx = browser.contexts()[0];
let found = null;
for (const p of ctx.pages()) {
  try {
    const t = await p.evaluate(() => document.body.innerText.slice(0, 3000));
    if (t.includes('TEST MULTI-2')) { found = p; break; }
  } catch (e) {}
}
if (!found) return { fail: 'multi-2 tab gone' };
const st = await found.evaluate(() => ({
  url: location.href,
  auds: Array.from(document.querySelectorAll('audio')).map((a) => Math.round(a.duration || 0)),
  spin: /thinking|generating|queued|in progress/i.test(document.body.innerText.slice(0, 3000)),
  err: (document.body.innerText.match(/Failed[^.]{0,80}\.|permission denied[^.]{0,80}|paid API key[^.]{0,80}|quota[^.]{0,60}|rate limit[^.]{0,60}|limit[^.]{0,60}/i) || [null])[0],
})).catch((e) => ({ err2: 1 }));
return st;
