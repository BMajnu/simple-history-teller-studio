/* Through — Flow site contract (page-facing EXACT port).
 * Source logic: MuazAshraf/flow_automation_tool/src/content/content.js
 * (message names, op order, selector priorities, maps, sleeps, filename
 * pattern and dedupe TTL are kept identical so page behavior matches).
 * Namespaced to __THROUGH_FLOW_* so it coexists with any other extension.
 * Runs ONLY on flow.google.com / labs.google (see manifest matches).
 * The generic engine (src/content/content.js) never imports this file.
 */
(() => {
  if (window.__THROUGH_FLOW_LOADED__) return;
  window.__THROUGH_FLOW_LOADED__ = true;
  window.__THROUGH_FLOW_PROCESSED__ = window.__THROUGH_FLOW_PROCESSED__ || new Set();
  window.__THROUGH_FLOW_AUTOMATING__ = false;
  window.__THROUGH_FLOW_SETTINGS__ = false;
  window.__THROUGH_FLOW_TUNE__ = false;
  window.__THROUGH_FLOW_DL_INDEX__ = 0;
  console.log('[ThroughFlow] site contract ready');

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const visible = (el) => {
    if (!el) return false;
    const style = window.getComputedStyle ? getComputedStyle(el) : null;
    if (style && (style.visibility === 'hidden' || style.display === 'none' || style.opacity === '0')) return false;
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  };

  async function waitForElement(selectors, timeout = 15000) {
    const list = Array.isArray(selectors) ? selectors : [selectors];
    const t0 = Date.now();
    return new Promise((resolve, reject) => {
      const check = () => {
        for (const sel of list) {
          let els = [];
          try { els = document.querySelectorAll(sel); } catch {}
          for (const el of els) {
            if (el && visible(el) && !el.disabled) { resolve(el); return; }
          }
        }
        if (Date.now() - t0 > timeout) reject(new Error('waitFor-timeout: ' + list.join(' | ')));
        else requestAnimationFrame(check);
      };
      check();
    });
  }

  function findElementByText(text, tagNames = ['button', 'a', 'span', 'div']) {
    const needle = String(text).toLowerCase();
    for (const tag of tagNames) {
      for (const el of document.querySelectorAll(tag)) {
        const t = ((el.textContent || '') + ' ' + (el.getAttribute('aria-label') || '')).toLowerCase();
        if (t.includes(needle) && visible(el)) return el;
      }
    }
    return null;
  }

  async function clickElement(el) {
    if (!el) throw new Error('click-null');
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    await sleep(200);
    const r = el.getBoundingClientRect();
    el.dispatchEvent(new MouseEvent('mouseover', { bubbles: true, clientX: r.left + r.width / 2, clientY: r.top + r.height / 2 }));
    await sleep(50);
    el.click(); // single native click — safest for React apps
    await sleep(300);
  }

  async function typeText(el, text, delay = 20, clearFirst = false) {
    void delay;
    el.focus();
    await sleep(100);
    if (clearFirst) {
      if (el.tagName === 'TEXTAREA' || el.tagName === 'INPUT') { try { el.select(); } catch {} }
      else {
        const s = window.getSelection(); const range = document.createRange();
        range.selectNodeContents(el); s.removeAllRanges(); s.addRange(range);
      }
      await sleep(50);
      try { document.execCommand('delete', false, null); } catch {}
      await sleep(100);
    }
    if (el.tagName === 'TEXTAREA' || el.tagName === 'INPUT') {
      const proto = el.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
      const d = Object.getOwnPropertyDescriptor(proto, 'value');
      if (d && d.set) d.set.call(el, text); else el.value = text;
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    } else {
      try { document.execCommand('insertText', false, text); } catch {}
      el.dispatchEvent(new InputEvent('input', { bubbles: true, data: text }));
    }
    await sleep(150);
  }

  function isVisible(el) { return visible(el); }

  // --- New project (priorities P0..P5, identical order) ---
  async function clickStartProject() {
    await sleep(1000);
    const avoid = ['edit', 'save', 'settings', 'delete', 'cancel', 'close', 'menu', 'more',
      'expand', 'sign', 'log', 'account', 'profile', 'help', 'feedback', 'share', 'tune'];
    const buttons = Array.from(document.querySelectorAll('button')).filter(visible);
    // P0: icon button + project text (e.g. add_2 + New project)
    for (const btn of buttons) {
      const t = (btn.textContent || '').toLowerCase();
      if (avoid.some((a) => t.includes(a))) continue;
      const icon = btn.querySelector('i.google-symbols, i, span.google-symbols, span.material-icons');
      if (icon && /project/.test(t)) {
        await clickElement(btn); await sleep(5000); return true;
      }
    }
    // P1: keywords
    const p1 = ['new project', 'start project', 'create project', 'new video', 'create video'];
    for (const kw of p1) {
      const el = findElementByText(kw, ['button']);
      if (el) { await clickElement(el); await sleep(5000); return true; }
    }
    // P2: add/plus with project/new/create
    for (const btn of buttons) {
      const t = (btn.textContent || '').toLowerCase();
      if (avoid.some((a) => t.includes(a))) continue;
      if (/(\+|add|plus)/.test(t) && /(project|new|create)/.test(t)) {
        await clickElement(btn); await sleep(5000); return true;
      }
    }
    // P3: short action text
    for (const btn of buttons) {
      const t = (btn.textContent || '').trim().toLowerCase();
      if (t.length < 20 && /^(create|new|start|begin|make)$/.test(t)) {
        await clickElement(btn); await sleep(5000); return true;
      }
    }
    // P4: FAB
    for (const btn of buttons) {
      const c = (btn.className || '').toString().toLowerCase();
      if (/fab|floating|primary|action/.test(c)) {
        await clickElement(btn); await sleep(5000); return true;
      }
    }
    // P5: already inside create mode
    try {
      const ta = document.querySelector('textarea:not([hidden])');
      if (ta && visible(ta)) return true;
    } catch {}
    return false;
  }

  // --- Settings panel ---
  async function openSettingsIfNeeded() {
    if (window.__THROUGH_FLOW_TUNE__) return true;
    for (const btn of document.querySelectorAll('button')) {
      if (!isVisible(btn)) continue;
      const text = (btn.textContent || '').toLowerCase();
      const iconText = (btn.querySelector('i, span.material-icons, span.google-symbols') || {}).textContent || '';
      const aria = (btn.getAttribute('aria-label') || '').toLowerCase();
      if (text.includes('tune') || iconText.includes('tune')
        || aria.includes('settings') || aria.includes('options') || aria.includes('tune')) {
        const panel = document.querySelector('[role="dialog"][class*="Popover"], [class*="settings-panel"], [class*="PopoverContent"]');
        if (panel && isVisible(panel)) { window.__THROUGH_FLOW_TUNE__ = true; return true; }
        await clickElement(btn);
        window.__THROUGH_FLOW_TUNE__ = true;
        await sleep(500);
        return true;
      }
    }
    return false;
  }

  async function openComboboxAndPick(trigger, matchText) {
    await clickElement(trigger);
    await sleep(400);
    const needle = String(matchText).toLowerCase();
    for (const opt of document.querySelectorAll('[role="option"]')) {
      if (((opt.textContent || '').toLowerCase().includes(needle)) && visible(opt) && !opt.disabled) {
        await clickElement(opt);
        return true;
      }
    }
    try { document.body.click(); } catch {}
    return false;
  }

  async function selectModel(modelValue, isImageMode = false) {
    if (!modelValue) return true;
    const videoMap = {
      'veo-3.1-fast': '3.1 - fast', 'veo-3.1-quality': '3.1 - quality',
      'veo-2-fast': '2 - fast', 'veo-2-quality': '2 - quality',
    };
    const imageMap = { 'imagen-4': 'imagen 4', 'nano-banana': 'nano banana', 'nano-banana-pro': 'banana pro' };
    const target = (isImageMode ? imageMap[modelValue] : videoMap[modelValue]) || modelValue;
    const keys = isImageMode ? ['imagen', 'nano', 'banana'] : ['veo'];
    for (const btn of document.querySelectorAll('button')) {
      if (!visible(btn)) continue;
      const t = (btn.textContent || '').toLowerCase();
      if (t.includes('tune')) continue;
      if (!keys.some((k) => t.includes(k))) continue;
      if (t.includes(target.toLowerCase())) return true; // already selected
      const picked = await openComboboxAndPick(btn, target);
      if (picked) return true;
    }
    return true; // best-effort: control absent on this UI revision
  }

  async function selectRatio(ratio) {
    const want = String(ratio || 'landscape').toLowerCase();
    const keys = want.startsWith('portrait')
      ? ['portrait', '9:16', 'crop_portrait'] : ['landscape', '16:9', 'crop_landscape'];
    for (const btn of document.querySelectorAll('button')) {
      if (!visible(btn)) continue;
      const t = (btn.textContent || '').toLowerCase();
      const h = (btn.innerHTML || '').toLowerCase();
      if (/veo|nano|imagen|output|text to|frames to|create image/.test(t)) continue;
      if (!keys.some((k) => t.includes(k) || h.includes(k))) continue;
      if (t.includes(keys[0])) return true;
      const picked = await openComboboxAndPick(btn, keys[0]);
      if (picked) return true;
    }
    return true;
  }

  async function selectOutputCount(count) {
    const target = String(parseInt(count) || 1);
    for (const combo of document.querySelectorAll('button[role="combobox"]')) {
      const t = ((combo.textContent || '').toLowerCase());
      if (!t.includes('outputs per prompt')) continue;
      if (new RegExp(target).test(t)) return true;
      await clickElement(combo);
      await sleep(400);
      for (const opt of document.querySelectorAll('[role="option"]')) {
        if (new RegExp('^(' + target + ')$').test((opt.textContent || '').trim()) && visible(opt)) {
          await clickElement(opt);
          return true;
        }
      }
      try { document.body.click(); } catch {}
    }
    for (const tag of ['div', 'span', 'button']) {
      for (const el of document.querySelectorAll(tag)) {
        if (/^x[1-4]$/.test((el.textContent || '').trim()) && visible(el)) {
          if (el.textContent.trim() === 'x' + target) return true;
        }
      }
    }
    return true;
  }

  async function selectCreationMode(mode) {
    const map = {
      'text-to-video': 'text to video', 'frames-to-video': 'frames to video',
      'create-image': 'create image', 'ingredients': 'ingredients to video',
    };
    const target = map[mode] || 'text to video';
    const combos = Array.from(document.querySelectorAll('[role="combobox"]'));
    for (const c of combos) {
      const t = (c.textContent || '').toLowerCase();
      if (/text to|frames to|create image|ingredients/.test(t)) {
        if (t.includes(target)) return true;
        const picked = await openComboboxAndPick(c, target);
        if (picked) return true;
      }
    }
    const el = findElementByText(target, ['button', 'div', 'span']);
    if (el) { await clickElement(el); return true; }
    return true;
  }

  async function enterPrompt(prompt, clearFirst) {
    await sleep(500);
    let box = null;
    try { box = document.querySelector('textarea#PINHOLE_TEXT_AREA_ELEMENT_ID'); } catch {}
    if (box && visible(box) && !box.disabled) { await typeText(box, prompt, 20, clearFirst); return; }
    for (const ta of document.querySelectorAll('textarea:not([disabled])')) {
      if (visible(ta)) { await typeText(ta, prompt, 20, clearFirst); return; }
    }
    throw new Error('Could not find prompt input');
  }

  async function clickGenerate() {
    const avoid = ['expand', 'edit', 'settings', 'more', 'menu', 'copy', 'download', 'new project', 'tune'];
    const buttons = Array.from(document.querySelectorAll('button:not([disabled])')).filter(visible);
    for (const b of buttons) { // M1: arrow icon + create text
      const t = (b.textContent || '').toLowerCase();
      if (avoid.some((a) => t.includes(a))) continue;
      if ((b.innerHTML || '').includes('arrow_forward') && t.includes('create')) {
        await clickElement(b); return;
      }
    }
    for (const b of buttons) { // M2: exact glued label
      if ((b.textContent || '') === 'arrow_forwardCreate') { await clickElement(b); return; }
    }
    for (const b of buttons) { // M3: exact action word
      const t = (b.textContent || '').trim().toLowerCase();
      if ((t === 'create' || t === 'generate') && !avoid.some((a) => t.includes(a))) {
        await clickElement(b); return;
      }
    }
    for (const b of buttons) { // M4: any arrow
      if ((b.innerHTML || '').includes('arrow_forward')) { await clickElement(b); return; }
    }
    throw new Error('Could not find generate button');
  }

  function checkVideoStatus() {
    try {
      for (const v of document.querySelectorAll('video')) {
        const src = v.currentSrc || v.src;
        if (src && v.readyState >= 2) return { status: 'completed', videoUrl: src };
      }
    } catch {}
    const busySel = '[role="progressbar"], [class*="loading"], [class*="spinner"], [class*="progress"], [class*="generating"], [aria-busy="true"]';
    for (const el of document.querySelectorAll(busySel)) {
      if (visible(el)) return { status: 'processing' };
    }
    try {
      if (/generating/.test((document.body.innerText || '').toLowerCase())) return { status: 'processing' };
    } catch {}
    for (const el of document.querySelectorAll('[role="alert"], [class*="error"]')) {
      if (visible(el)) return { status: 'error', error: (el.textContent || 'generation error').slice(0, 300) };
    }
    return { status: 'unknown' };
  }

  async function downloadVideo(folder) {
    const dir = folder || 'VeoFlow';
    const urls = [];
    for (const v of document.querySelectorAll('video')) {
      const s = v.currentSrc || v.src;
      if (s && /^https?:/.test(s)) urls.push(s);
    }
    for (const s of document.querySelectorAll('video source[src]')) {
      if (/^https?:/.test(s.src)) urls.push(s.src);
    }
    if (urls.length) {
      for (const u of urls) {
        window.__THROUGH_FLOW_DL_INDEX__++;
        const resp = await chrome.runtime.sendMessage({
          type: 'THROUGH_DOWNLOAD_URL', url: u,
          filename: dir + '/video_' + window.__THROUGH_FLOW_DL_INDEX__ + '_' + Date.now() + '.mp4',
        });
        if (!resp || !resp.ok) throw new Error('download-failed: ' + ((resp && resp.error) || 'unknown'));
      }
      return { success: true, count: urls.length };
    }
    for (const b of document.querySelectorAll('button')) { // direct download buttons
      if (!visible(b)) continue;
      const t = ((b.textContent || '') + ' ' + (b.getAttribute('aria-label') || '') + ' ' + (b.className || '')).toLowerCase();
      if (/download|save/.test(t) && !/more|menu/.test(t)) { await clickElement(b); await sleep(1000); }
    }
    return { success: true, count: 0 };
  }

  async function uploadImage(imageData) {
    const data = imageData || {};
    let input = null;
    for (const inp of document.querySelectorAll('input[type="file"]')) {
      if (!visible(inp)) continue;
      const acc = (inp.getAttribute('accept') || '').toLowerCase();
      if (!acc || acc.includes('image')) { input = inp; break; }
    }
    if (!input) {
      const trig = findElementByText('upload', ['button', 'div', 'span'])
        || findElementByText('add image', ['button', 'div', 'span'])
        || findElementByText('select image', ['button', 'div', 'span'])
        || findElementByText('choose file', ['button', 'div', 'span']);
      if (trig) { await clickElement(trig); await sleep(800); }
      for (const inp of document.querySelectorAll('input[type="file"]')) {
        if (visible(inp)) { input = inp; break; }
      }
    }
    if (!input) throw new Error('Could not find image upload input');
    if (!data.url) throw new Error('uploadImage needs {url}');
    const blob = await (await fetch(data.url)).blob();
    const file = new File([blob], data.name || 'reference.png', { type: blob.type || 'image/png' });
    const dt = new DataTransfer();
    dt.items.add(file);
    input.files = dt.files;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
    await sleep(1000);
    return { success: true };
  }

  async function applySettings(mode, settings) {
    if (window.__THROUGH_FLOW_SETTINGS__) return { success: true, skipped: true };
    const s = settings || {};
    const isImageMode = mode === 'create-image';
    const VALID_VIDEO = ['veo-3.1-fast', 'veo-3.1-quality', 'veo-2-fast', 'veo-2-quality'];
    const VALID_IMAGE = ['imagen-4', 'nano-banana', 'nano-banana-pro'];
    let model = s.model;
    if (isImageMode && !VALID_IMAGE.includes(model)) model = 'nano-banana-pro';
    else if (!isImageMode && !VALID_VIDEO.includes(model)) model = 'veo-3.1-fast';
    try {
      await selectCreationMode(mode);       // 1. mode FIRST
      await sleep(1000);
      await openSettingsIfNeeded();         // 2. tune panel
      await sleep(500);
      await selectModel(model, isImageMode); // 3. model
      await sleep(500);
      await selectRatio(s.ratio || 'landscape'); // 4. ratio (exact value)
      await sleep(500);
      await selectOutputCount(s.outputCount || '1'); // 5. outputs
      await sleep(300);
      try { document.body.click(); } catch {} // 6. close popups ×2
      await sleep(300);
      try { document.body.click(); } catch {}
      await sleep(200);
      window.__THROUGH_FLOW_SETTINGS__ = true;
      return { success: true };
    } catch (e) {
      return { success: false, error: String((e && e.message) || e) };
    }
  }

  async function executeTask(task, settings) {
    try {
      if (task.image) await uploadImage(task.image);
      await enterPrompt(task.prompt, true); // always clearFirst
      await clickGenerate();
      window.__THROUGH_FLOW_AUTOMATING__ = false;
      return { success: true };
    } catch (e) {
      window.__THROUGH_FLOW_AUTOMATING__ = false;
      return { success: false, error: String((e && e.message) || e) };
    }
  }

  if (!window.__THROUGH_FLOW_LISTENER__) {
    window.__THROUGH_FLOW_LISTENER__ = true;
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      switch (message.type) {
        case 'APPLY_SETTINGS':
          applySettings(message.data && message.data.mode, message.data && message.data.settings)
            .then(sendResponse).catch((e) => sendResponse({ success: false, error: e.message }));
          return true;
        case 'EXECUTE_TASK': {
          const taskId = message.data && message.data.task && message.data.task.id;
          if (taskId && window.__THROUGH_FLOW_PROCESSED__.has(taskId)) {
            sendResponse({ success: true, skipped: true });
            return true;
          }
          if (taskId) {
            window.__THROUGH_FLOW_PROCESSED__.add(taskId);
            setTimeout(() => window.__THROUGH_FLOW_PROCESSED__.delete(taskId), 300000);
          }
          window.__THROUGH_FLOW_AUTOMATING__ = true;
          executeTask(message.data.task, message.data.settings)
            .then(sendResponse).catch((e) => sendResponse({ success: false, error: e.message }));
          return true;
        }
        case 'CHECK_VIDEO_STATUS':
          sendResponse(checkVideoStatus());
          break;
        case 'DOWNLOAD_VIDEO':
          downloadVideo(message.data && message.data.folder)
            .then(sendResponse).catch((e) => sendResponse({ success: false, error: e.message }));
          return true;
        case 'CLICK_START_PROJECT':
          clickStartProject()
            .then((result) => sendResponse({ success: result }))
            .catch((e) => sendResponse({ success: false, error: e.message }));
          return true;
        case 'PING':
          sendResponse({ success: true, message: 'Content script active', url: window.location.href });
          break;
        case 'RESET_SETTINGS_FLAG':
          window.__THROUGH_FLOW_SETTINGS__ = false;
          window.__THROUGH_FLOW_TUNE__ = false;
          sendResponse({ success: true });
          break;
        default:
          sendResponse({ error: 'Unknown message type' });
      }
    });

    const notifyReady = () => {
      try {
        chrome.runtime.sendMessage({ type: 'CONTENT_SCRIPT_READY', data: { url: window.location.href } }).catch(() => {});
      } catch {}
    };
    if (document.readyState === 'complete') notifyReady();
    else window.addEventListener('load', notifyReady);
  }
  console.log('[ThroughFlow] site contract initialized');
})();
