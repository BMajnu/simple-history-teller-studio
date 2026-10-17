/* Through – content action runner (ISOLATED world, universal).
 * No hard-coded site. Every op takes explicit selectors/params from the job.
 * Ops: waitFor | click | fill | selectOption | uploadDataUrl | extract |
 *       sleep | runJS | pageRpc (relay to MAIN world pageBridge) |
 *       askHuman (pause w/ reason) | download (ask background)
 */
(() => {
  if (window.__THROUGH_LOADED__) return;
  window.__THROUGH_LOADED__ = true;
  window.__THROUGH_BUSY__ = false;
  console.log('[Through] content ready');

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const visible = (el) => {
    if (!el) return false;
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  };

  async function waitFor(selectors, timeout = 15000) {
    const list = Array.isArray(selectors) ? selectors : [selectors];
    const t0 = Date.now();
    return new Promise((resolve, reject) => {
      const check = () => {
        for (const sel of list) {
          try {
            const els = document.querySelectorAll(sel);
            for (const el of els) if (visible(el) && !el.disabled) { resolve(el); return; }
          } catch {}
        }
        if (Date.now() - t0 > timeout) reject(new Error('waitFor-timeout: ' + list.join(' | ')));
        else requestAnimationFrame(check);
      };
      check();
    });
  }

  function findByText(text, tags = ['button', 'a', 'span', 'div']) {
    const needle = String(text).toLowerCase();
    for (const tag of tags) {
      for (const el of document.querySelectorAll(tag)) {
        const t = ((el.textContent || '') + ' ' + (el.getAttribute('aria-label') || '')).toLowerCase();
        if (t.includes(needle) && visible(el)) return el;
      }
    }
    return null;
  }

  async function clickEl(el) {
    if (!el) throw new Error('click-null');
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    await sleep(200);
    el.click(); // single native click — safest for React apps
    await sleep(300);
  }

  async function fillEl(el, text, clearFirst = true) {
    el.focus();
    await sleep(80);
    if (clearFirst) {
      if (el.tagName === 'TEXTAREA' || el.tagName === 'INPUT') el.select();
      else {
        const s = window.getSelection(); const r = document.createRange();
        r.selectNodeContents(el); s.removeAllRanges(); s.addRange(r);
      }
      await sleep(40);
      document.execCommand('delete', false, null);
      await sleep(60);
    }
    if (el.tagName === 'TEXTAREA' || el.tagName === 'INPUT') {
      const setter = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(el), 'value')?.set
        || Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')?.set;
      const proto = el.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
      const d = Object.getOwnPropertyDescriptor(proto, 'value');
      if (d && d.set) d.set.call(el, text); else el.value = text;
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    } else {
      // contenteditable / ProseMirror / rich editors
      document.execCommand('insertText', false, text);
      el.dispatchEvent(new InputEvent('input', { bubbles: true, data: text }));
    }
    await sleep(150);
  }

  function dataUrlToFile(dataUrl, name) {
    const [head, b64] = dataUrl.split(',');
    const mime = (head.match(/data:(.*?);/) || [])[1] || 'application/octet-stream';
    const bin = atob(b64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return new File([bytes], name || 'upload.bin', { type: mime });
  }

  async function pageRpc(payload, timeout = 60000) {
    // Relay to MAIN-world bridge (injected/pageBridge.js) for authenticated fetch.
    const id = 'rpc-' + Date.now() + '-' + Math.floor(Math.random() * 1e6);
    return new Promise((resolve, reject) => {
      const handler = (e) => {
        if (e.detail && e.detail.id === id) {
          window.removeEventListener('THROUGH_PAGE_RPC_RESULT', handler);
          clearTimeout(timer);
          if (e.detail.ok) resolve(e.detail.data);
          else reject(new Error(e.detail.error || 'pageRpc-failed'));
        }
      };
      const timer = setTimeout(() => {
        window.removeEventListener('THROUGH_PAGE_RPC_RESULT', handler);
        reject(new Error('pageRpc-timeout (pageBridge missing? inject src/injected/pageBridge.js)'));
      }, timeout);
      window.addEventListener('THROUGH_PAGE_RPC_RESULT', handler);
      window.dispatchEvent(new CustomEvent('THROUGH_PAGE_RPC', { detail: { id, ...payload } }));
    });
  }

  async function runOp(op) {
    const a = op.args || {};
    switch (op.op) {
      case 'sleep': await sleep(a.ms || 1000); return null;
      case 'navigate':
        if (!a.url) throw new Error('navigate-no-url');
        location.href = a.url; await sleep(2500); return { navigated: a.url };
      case 'waitFor': await waitFor(a.selectors, a.timeout || 15000); return { found: true };
      case 'click': {
        let el = null;
        if (a.selector) el = await waitFor(a.selector, a.timeout || 10000);
        else if (a.text) { el = findByText(a.text, a.tags); if (!el) throw new Error('click-text-not-found: ' + a.text); }
        else throw new Error('click-needs-selector-or-text');
        await clickEl(el); return { clicked: true };
      }
      case 'fill': {
        const el = await waitFor(a.selector, a.timeout || 10000);
        await fillEl(el, a.text || '', a.clearFirst !== false);
        if (a.submitKey === 'Enter') { el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })); await sleep(300); }
        return { filled: true };
      }
      case 'selectOption': {
        // Generic combobox: click trigger, then click option by text.
        const trigger = await waitFor(a.trigger, a.timeout || 10000);
        await clickEl(trigger); await sleep(500);
        const opt = findByText(a.option, ['div', 'span', 'li']);
        if (!opt) throw new Error('option-not-found: ' + a.option);
        await clickEl(opt); return { selected: a.option };
      }
      case 'uploadDataUrl': {
        const input = await waitFor(a.selector || 'input[type="file"]', a.timeout || 10000);
        const file = dataUrlToFile(a.dataUrl, a.filename);
        const dt = new DataTransfer(); dt.items.add(file);
        input.files = dt.files;
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
        await sleep(500); return { uploaded: a.filename || true };
      }
      case 'extract': {
        const out = {};
        for (const [key, sel] of Object.entries(a.fields || {})) {
          const el = document.querySelector(sel);
          if (!el) { out[key] = null; continue; }
          const tag = el.tagName;
          const type = (el.type || '').toLowerCase();
          if (tag === 'TEXTAREA' || tag === 'SELECT'
            || (tag === 'INPUT' && !/^(checkbox|radio|file|submit|button)$/.test(type))) {
            out[key] = el.value; // live form value, not markup
          } else if (tag === 'INPUT' && /^(checkbox|radio)$/.test(type)) {
            out[key] = el.checked;
          } else if (/^(IMG|VIDEO|SOURCE|AUDIO)$/.test(tag)) {
            out[key] = el.currentSrc || el.src || el.href || null;
          } else {
            out[key] = ((el.innerText || el.textContent) || '').slice(0, 8000) || el.outerHTML.slice(0, 8000);
          }
        }
        return out;
      }
      case 'runJS': {
        // Isolated-world eval only. For page-context JS use pageRpc {kind:'eval', code}.
        const fn = new Function('document', 'window', a.code || 'return null;');
        return await fn(document, window);
      }
      case 'pageRpc': return await pageRpc(a, a.timeout || 60000);
      case 'askHuman': return { __askHuman: a.reason || 'human input needed' };
      case 'download': {
        const resp = await chrome.runtime.sendMessage({ type: 'THROUGH_DOWNLOAD_URL', url: a.url, filename: a.filename });
        if (!resp || !resp.ok) throw new Error('download-failed: ' + ((resp && resp.error) || 'unknown'));
        return { downloadId: resp.downloadId };
      }
      default: throw new Error('unknown-op: ' + op.op);
    }
  }

  chrome.runtime.onMessage.addListener((msg, _sender, reply) => {
    (async () => {
      if (msg.type === 'THROUGH_PING') { reply({ ok: true, url: location.href }); return; }
      if (msg.type === 'THROUGH_JOB_STATUS') { reply({ ok: true, busy: !!window.__THROUGH_BUSY__ }); return; }
      if (msg.type === 'THROUGH_EXECUTE_ACTIONS') {
        if (window.__THROUGH_BUSY__) { reply({ ok: false, error: 'busy' }); return; }
        window.__THROUGH_BUSY__ = true;
        const data = {};
        try {
          for (const op of (msg.job.actions || [])) {
            const r = await runOp(op);
            if (r && r.__askHuman) {
              window.__THROUGH_BUSY__ = false;
              reply({ ok: true, needHuman: r.__askHuman, data });
              return;
            }
            if (op.id) data[op.id] = r;
          }
          window.__THROUGH_BUSY__ = false;
          reply({ ok: true, data });
        } catch (e) {
          window.__THROUGH_BUSY__ = false;
          reply({ ok: false, error: String((e && e.message) || e) });
        }
        return;
      }
      reply({ ok: false, error: 'unknown-type' });
    })();
    return true;
  });
})();
