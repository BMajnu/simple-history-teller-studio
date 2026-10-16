// Payload: inspect upload tab state (no focus steal).
const ctx = browser.contexts()[0];
const pg = ctx.pages().find((p) => (p.url() || '').includes('videos/upload')) || ctx.pages().find((p) => (p.url() || '').includes('studio.youtube.com')) || page;
await pg.waitForTimeout(1000);
const dom = await pg.evaluate(() => ({
  url: location.href, title: document.title,
  create: (() => { const el = document.querySelector('#create-icon'); if (!el) return 'missing'; const r = el.getBoundingClientRect(); return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), vis: r.width > 0 }; })(),
  fileInputs: document.querySelectorAll('input[type="file"]').length,
  dialogs: Array.from(document.querySelectorAll('ytcp-uploads-dialog, ytcp-uploads-details, [role="dialog"]')).map((el) => el.tagName).slice(0, 5),
  body: document.body.innerText.slice(0, 350),
})).catch((e) => ({ err: 1 }));
await pg.screenshot({ path: 'tools/fx_up2.png', timeout: 15000 }).catch(() => {});
return dom;
