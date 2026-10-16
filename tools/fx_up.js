// Payload: diagnose Studio upload entry (no focus steal). Reports + screenshots each stage.
const ctx = browser.contexts()[0];
const pg = ctx.pages().find((p) => (p.url() || '').includes('w=up')) || ctx.pages().find((p) => (p.url() || '').includes('studio.youtube.com')) || null;
if (!pg) return { fail: 'no studio tab' };
const out = { url: pg.url() };
try {
  await pg.goto('https://studio.youtube.com/channel/UCOzERwa3GJqO00B8LMTPtDg/videos/upload?d=pt', { waitUntil: 'domcontentloaded', timeout: 45000 });
} catch (e) { out.nav = String(e.message).slice(0, 60); }
await pg.waitForTimeout(5000);
out.createBtns = await pg.locator('#create-icon, button:has-text("Create")').count().catch(() => -1);
out.fileInputs = await pg.evaluate(() => document.querySelectorAll('input[type="file"]').length).catch(() => -1);
out.body = await pg.evaluate(() => document.body.innerText.slice(0, 300)).catch(() => '');
await pg.screenshot({ path: 'tools/fx_up.png', timeout: 15000 }).catch(() => {});
return out;
