// Payload: test ?authuser=N routing on music surface (read-only nav + read).
const pg = browser.contexts()[0].pages().find((p) => (p.url() || '').includes('new_music')) || null;
if (!pg) return { fail: 'no music tab' };
const R = {};
try {
  try { await pg.goto('https://aistudio.google.com/app/new_music?model=lyria-3.5&authuser=2', { waitUntil: 'commit', timeout: 45000 }); } catch (e) { R.fail = 'nav'; return R; }
  await pg.waitForTimeout(12000);
  R.state = await pg.evaluate(() => ({
    url: location.href,
    acct: (document.body.innerText.match(/[\w.]+@gmail\.com/) || ['?'])[0],
    box: document.querySelectorAll('textarea, div[contenteditable="true"], [role="textbox"]').length,
  })).catch(() => ({}));
} catch (e) { R.fail = String(e.message || e).slice(0, 80); }
return R;
