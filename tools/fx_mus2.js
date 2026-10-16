// Payload: dump music-tab UI state (read-only, no focus steal).
const ctx = browser.contexts()[0];
const out = [];
for (const p of ctx.pages()) {
  const u = p.url() || '';
  if (!u.includes('new_music')) continue;
  try {
    const st = await p.evaluate(() => ({
      url: location.href.slice(0, 70),
      box: document.querySelectorAll('textarea, div[contenteditable="true"], [role="textbox"]').length,
      cards: (document.body.innerText.match(/Cinematic Score|Big Room EDM|90s Alt-Rock/g) || []).length,
      gen: Array.from(document.querySelectorAll('button')).filter((b) => (b.innerText || '').trim() === 'Generate').length,
      body: document.body.innerText.slice(0, 220),
    }));
    out.push(st);
  } catch (e) { out.push({ url: u.slice(0, 50), err: 1 }); }
}
return out;
