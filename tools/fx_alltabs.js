// Payload: dump ALL tabs state (read-only, no focus steal) to see structural differences.
const ctx = browser.contexts()[0];
const out = [];
for (const p of ctx.pages()) {
  try {
    const st = await p.evaluate(() => ({
      url: location.href.slice(0, 90), title: document.title.slice(0, 50),
      box: document.querySelectorAll('textarea, div[contenteditable="true"], [role="textbox"]').length,
      card: (document.body.innerText.match(/Cinematic Score/g) || []).length,
      gen: (document.body.innerText.match(/Generate/g) || []).length,
      body: document.body.innerText.slice(0, 200),
    }));
    out.push(st);
  } catch (e) { out.push({ err: 1 }); }
}
return out;
