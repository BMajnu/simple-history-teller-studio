// Payload: dump Google session cookies via CDP — definitive login-state check.
const ctx = browser.contexts()[0];
const pages = ctx.pages();
const pg = pages.find((p) => (p.url() || '').includes('accounts.google.com')) || pages[0];
await pg.bringToFront();
const sess = await ctx.newCDPSession(pg);
const data = await sess.send('Storage.getCookies');
const g = data.cookies.filter((c) => c.domain.includes('google.com') || c.domain.includes('youtube.com'));
const names = {};
g.forEach((c) => { names[c.name] = (names[c.name] || 0) + 1; });
return { total: data.cookies.length, google: g.length, names, urls: pages.map((p) => p.url()) };
