// Payload: inspect a dispatched music tab state (read-only, no focus steal).
const ctx = browser.contexts()[0];
const pgs = ctx.pages().filter((p) => (p.url() || '').includes('new_music'));
const pg = pgs[0];
if (!pg) return { fail: 'no music tab' };
return await pg.evaluate(() => ({
  url: location.href,
  box: document.querySelectorAll('textarea, div[contenteditable="true"], [role="textbox"]').length,
  cards: (document.body.innerText.match(/Cinematic Score|Big Room EDM|90s Alt-Rock/g) || []).length,
  genBtns: Array.from(document.querySelectorAll('button')).filter((b) => (b.innerText || '').trim() === 'Generate').length,
  body: document.body.innerText.slice(0, 300),
})).catch((e) => ({ err: 1 }));
