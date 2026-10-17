/* Through – MAIN-world page bridge (universal).
 * Runs INSIDE the page so it can use the site's own session (cookies, CSRF tokens,
 * captcha widgets). Some providers only accept session-bound RPCs issued from the
 * page itself — replaying captured bearer headers from outside stopped working
 * when they migrated hosts, so in-page execution is the durable pattern.
 * Generic: { kind:'fetch' } does credentials:include fetch; { kind:'captcha' }
 * mints a captcha token if the site exposes it; { kind:'eval' } runs page-context JS.
 * No site-specific code here.
 */
(() => {
  if (window.__THROUGH_BRIDGE__) return;
  window.__THROUGH_BRIDGE__ = true;

  async function doFetch(p) {
    const res = await fetch(p.url, {
      method: p.method || 'POST',
      headers: p.headers || { 'Content-Type': 'application/json' },
      body: p.body !== undefined ? (typeof p.body === 'string' ? p.body : JSON.stringify(p.body)) : undefined,
      credentials: 'include',
    });
    const text = await res.text();
    return { status: res.status, ok: res.ok, body: text.slice(0, 200000) };
  }

  async function doCaptcha(p) {
    try {
      const sitekey = p.sitekey;
      const action = p.action || 'submit';
      const ent = window.grecaptcha && window.grecaptcha.enterprise;
      const std = window.grecaptcha;
      if (ent && ent.execute) {
        const token = sitekey ? await ent.execute(sitekey, { action }) : await ent.execute({ action });
        return { token };
      }
      if (std && std.execute) {
        const token = sitekey ? await std.execute(sitekey, { action }) : await std.execute({ action });
        return { token };
      }
      return { token: null, note: 'grecaptcha not exposed on this page' };
    } catch (e) { throw new Error('captcha-failed: ' + (e.message || e)); }
  }

  window.addEventListener('THROUGH_PAGE_RPC', async (e) => {
    const { id, kind, ...p } = e.detail || {};
    if (!id) return;
    try {
      let data = null;
      if (kind === 'fetch') data = await doFetch(p);
      else if (kind === 'captcha') data = await doCaptcha(p);
      else if (kind === 'eval') data = { value: String(await (new Function(p.code || 'return null;'))()) };
      else throw new Error('unknown-kind: ' + kind);
      window.dispatchEvent(new CustomEvent('THROUGH_PAGE_RPC_RESULT', { detail: { id, ok: true, data } }));
    } catch (err) {
      window.dispatchEvent(new CustomEvent('THROUGH_PAGE_RPC_RESULT', { detail: { id, ok: false, error: String((err && err.message) || err) } }));
    }
  });
})();
