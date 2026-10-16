// Payload: dump music tab state (read-only).
const pg = browser.contexts()[0].pages().find((p) => (p.url() || '').includes('new_music')) || null;
if (!pg) return { fail: 'no music tab' };
return await pg.evaluate(() => ({ url: location.href, title: document.title, body: document.body.innerText.slice(0, 400) })).catch((e) => ({ err: 1 }));
