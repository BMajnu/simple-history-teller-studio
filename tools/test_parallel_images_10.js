/*
 * AI Studio project image-fleet runner.
 *
 * It creates one named, background-only AI Studio tab per scene, submits the
 * ready workers concurrently, harvests results collectively, writes validated
 * assets into the project's visual_assets directory, then closes only the tabs
 * it created. The run evidence remains under automation_runs/<run-id>.
 *
 * Run: $env:PROJECT_ID='parallel_five_scene_pilot'; $env:MAX_JOBS='5'; node tools/test_parallel_images_10.js
 * Safe UI-only check: $env:DRY='1'; $env:MAX_JOBS='1'; node tools/test_parallel_images_10.js
 * Artifacts: projects/<project_id>/automation_runs/<run-id>/image_outputs/
 */
const fs = require('fs');
const http = require('http');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PROJECT_ID = process.env.PROJECT_ID || '_automation';
const RUN_ID = `image10-${Date.now().toString(36)}`;
const PROJECT_DIR = path.join(ROOT, 'projects', PROJECT_ID);
const PROJECT_FILE = path.join(PROJECT_DIR, 'project.json');
const OUT_DIR = path.join(PROJECT_DIR, 'automation_runs', RUN_ID, 'image_outputs');
const ASSET_DIR = path.join(PROJECT_DIR, 'visual_assets');
const ADOPT_EXISTING_RUN_ID = String(process.env.ADOPT_EXISTING_RUN_ID || '').trim();
const DAEMON_URL = 'http://127.0.0.1:9333/run-script';
const MODEL_CHAIN = [
  { id: 'gemini-nano-banana-2.1', label: 'Nano Banana 2.1' },
  { id: 'gemini-3.1-flash-image', label: 'Nano Banana 2' },
  { id: 'gemini-3.1-flash-lite-image', label: 'Nano Banana 2 Lite' },
];

// Ten independent illustrations deliberately share one production style, while
// their staging/composition differs enough to make accidental duplicate output
// obvious during review.
const FALLBACK_SCENES = [
  'Dawn over a Neolithic riverside settlement: families carry woven baskets between clay huts, smoke rises from a small cooking fire, distant green hills, optimistic opening-wide composition.',
  'Ancient Mesopotamian canal workers guide water into wheat fields beside a mud-brick city wall and a stepped ziggurat, bright early morning, wide establishing composition.',
  'A Sumerian market at sunset: merchants arrange baskets of grain and pottery on low tables, travelers and donkeys pass between blank cloth awnings, energetic eye-level composition.',
  'Ancient Egyptian surveyors measure a floodplain with rope and wooden stakes while the Nile glitters behind them, palm trees and distant temple silhouettes, calm panoramic composition.',
  'Indus Valley craftworkers shape terracotta vessels in a clean brick courtyard, a bullock cart rolls past in the background, warm afternoon light, balanced medium-wide composition.',
  'Students study geometry in an ancient library courtyard, open scrolls and brass instruments on a stone table, shaded arches and leafy trees, thoughtful over-the-shoulder composition.',
  'A Bengal river-port scene in the medieval era: a wooden cargo boat arrives at a busy earthen ghat, jute bundles and clay jars, monsoon clouds breaking into golden sunlight, cinematic wide composition.',
  'A Silk Road caravan crosses a rocky mountain pass: camels carry colorful bundles, two guides point toward a distant walled oasis, crisp clear sky, dramatic low-angle wide composition.',
  'A Mughal-era workshop produces an illuminated manuscript: careful artisans mix pigments and paint geometric borders at low desks, carved windows cast patterned warm light, intimate interior composition.',
  'Modern archaeologists carefully uncover an ancient stone foundation with brushes and measuring strings, layered soil profiles and a museum tent beyond, hopeful documentary-style aerial composition.',
];

const STYLE_PREFIX = 'Simple History cutout vector cartoon, clean shapes, warm parchment tones, crisp bold ink contours, cel-shaded colors, historically respectful clothing and architecture, no photorealism, no 3D render, 16:9 widescreen composition. ';
const NEGATIVE = '--no text, typography, labels, numbers, titles, subtitles, words, speech bubbles, watermarks, signatures, captions';
function safeSceneNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function loadProjectScenes() {
  if (!fs.existsSync(PROJECT_FILE)) {
    return FALLBACK_SCENES.map((imagePrompt, index) => ({ sceneId: index + 1, imagePrompt }));
  }
  const project = JSON.parse(fs.readFileSync(PROJECT_FILE, 'utf8'));
  if (!Array.isArray(project.scenes) || project.scenes.length === 0) {
    throw new Error(`Project has no scenes: ${PROJECT_FILE}`);
  }
  return project.scenes.map((scene, index) => {
    if (!scene || typeof scene.image_prompt !== 'string' || !scene.image_prompt.trim()) {
      throw new Error(`Scene ${index + 1} has no image_prompt in ${PROJECT_FILE}`);
    }
    return { sceneId: safeSceneNumber(scene.scene_id, index + 1), imagePrompt: scene.image_prompt.trim() };
  });
}

const PROJECT_SCENES = loadProjectScenes();
const ALL_JOBS = PROJECT_SCENES.map((scene, index) => ({
  index: index + 1,
  sceneId: scene.sceneId,
  // Nine isolated signed-in profiles are available; additional scenes reuse u0.
  userSlot: index % 9,
  name: `${RUN_ID}-u${index % 9}-scene-${String(scene.sceneId).padStart(4, '0')}`,
  prompt: `${STYLE_PREFIX}${scene.imagePrompt} ${NEGATIVE}`,
  outBase: path.join(ASSET_DIR, `scene_${String(scene.sceneId).padStart(4, '0')}`),
}));
const MAX_JOBS = Math.max(1, Math.min(ALL_JOBS.length, Number(process.env.MAX_JOBS) || ALL_JOBS.length));
const JOBS = ALL_JOBS.slice(0, MAX_JOBS);
const DRY = process.env.DRY === '1';

function postDaemon(code, timeoutMs, workflow) {
  return new Promise((resolve, reject) => {
    const body = Buffer.from(JSON.stringify({
      code,
      run: {
        projectId: PROJECT_ID,
        workflow: workflow || 'image',
        agentName: 'image-fleet',
        tabName: RUN_ID,
        captureIntervalMs: 5000,
      },
    }), 'utf8');
    const req = http.request(DAEMON_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': body.length },
      timeout: timeoutMs,
    }, (res) => {
      let raw = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => { raw += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(raw);
          if (!res.statusCode || res.statusCode >= 400) reject(new Error(`daemon HTTP ${res.statusCode}: ${raw.slice(0, 600)}`));
          else resolve(parsed);
        } catch (error) {
          reject(new Error(`daemon returned invalid JSON: ${raw.slice(0, 600)}`));
        }
      });
    });
    req.on('timeout', () => req.destroy(new Error(`daemon request timed out after ${timeoutMs}ms`)));
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function daemonCode(phase) {
  return String.raw`
    return (async () => {
      const JOBS = ${JSON.stringify(JOBS)};
      const MODELS = ${JSON.stringify(MODEL_CHAIN)};
      const PHASE = ${JSON.stringify(phase)};
      const DRY = ${JSON.stringify(DRY)};
      const ADOPT_EXISTING_RUN_ID = ${JSON.stringify(ADOPT_EXISTING_RUN_ID)};
      const fs = require('fs');
      const path = require('path');
      const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
      const pages = () => browser.contexts().flatMap((context) => context.pages());

      function gateText(text) {
        const hit = String(text || '').match(/paid\\s+api\\s+key|select\\s+(?:an?\\s+)?api\\s+key|upgrade\\s+(?:your\\s+)?plan|quota\\s+(?:has\\s+)?(?:been\\s+)?exceeded|daily\\s+limit\\s+(?:has\\s+)?(?:been\\s+)?reached|rate\\s+limit\\s+(?:has\\s+)?(?:been\\s+)?reached|you\\s+have\\s+reached\\s+your\\s+limit/i);
        return hit ? hit[0].slice(0, 160) : null;
      }
      async function toolbar() {
        for (const pg of pages()) {
          const url = pg.url() || '';
          if (!url.includes('electron/browser.html')) continue;
          const ready = await pg.evaluate(() => Boolean(window.stb && window.stb.get && window.stb.newTab)).catch(() => false);
          if (ready) return pg;
        }
        return null;
      }
      async function stb(bar, method, arg) {
        return Promise.race([
          bar.evaluate(({ method: m, arg: a }) => {
            if (m === 'new') return window.stb.newTab(a.url, a.name, a.options || {});
            if (m === 'get') return window.stb.get();
            if (m === 'close') return window.stb.close(a);
            if (m === 'layoutStatus') return window.stb.layoutStatus ? window.stb.layoutStatus() : { supported: false };
            if (m === 'repairLayout') return window.stb.repairLayout ? window.stb.repairLayout(a || 'image-worker') : { supported: false };
            if (m === 'activateName') return window.stb.activateByName(a);
            return null;
          }, { method, arg }),
          sleep(15000).then(() => null),
        ]).catch(() => null);
      }
      function findPage(marker) {
        const matches = pages().filter((pg) => (pg.url() || '').includes(marker));
        return matches.length === 1 ? matches[0] : null;
      }
      function existingMarker(job) {
        if (!ADOPT_EXISTING_RUN_ID) return null;
        const priorName = ADOPT_EXISTING_RUN_ID + '-u' + job.userSlot + '-scene-' + String(job.sceneId).padStart(4, '0');
        return 'si_parallel_test=' + encodeURIComponent(priorName);
      }
      async function waitForPage(marker, ms) {
        const until = Date.now() + ms;
        while (Date.now() < until) {
          const pg = findPage(marker);
          if (pg) return pg;
          await sleep(700);
        }
        return null;
      }
      async function pageState(pg) {
        return pg.evaluate(() => {
          const body = document.body ? document.body.innerText : '';
          const box = document.querySelector('textarea, [contenteditable="true"], [role="textbox"]');
          const comboboxes = [...document.querySelectorAll('mat-select[role="combobox"], [role="combobox"]')]
            .map((el) => ({ label: [el.getAttribute('aria-label'), el.getAttribute('title'), el.innerText].filter(Boolean).join(' ').trim().slice(0, 140) }));
          const modelBits = [...document.querySelectorAll('button, mat-select, [role="combobox"]')]
            .map((el) => ([el.getAttribute('aria-label'), el.getAttribute('title'), el.innerText].filter(Boolean).join(' ').trim()))
            .filter((x) => /nano|banana|flash|imagen/i.test(x)).slice(0, 8);
          return { ready: Boolean(box), text: body.slice(0, 12000), comboboxes, modelBits };
        }).catch((error) => ({ ready: false, text: String(error && error.message || error), comboboxes: [], modelBits: [] }));
      }
      async function waitForComposer(pg, ms) {
        const until = Date.now() + ms;
        let last = null;
        while (Date.now() < until) {
          last = await pageState(pg);
          if (last.ready || gateText(last.text)) return last;
          await sleep(700);
        }
        return last || { ready: false, text: '', comboboxes: [], modelBits: [] };
      }
      async function verifyAuthenticatedStable(pg, ms) {
        const until = Date.now() + ms;
        let previous = null;
        while (Date.now() < until) {
          const state = await pageState(pg);
          const loginScreen = /sign in|choose an account|use another account/i.test(state.text || '');
          if (state.ready && !loginScreen) {
            const fingerprint = (state.text || '').slice(-1200);
            if (previous === fingerprint) return { ok: true, state };
            previous = fingerprint;
          }
          await sleep(1000);
        }
        return { ok: false, reason: 'page did not remain authenticated and stable', state: await pageState(pg) };
      }
      async function trustedMouseClick(pg, locator, label) {
        try {
          await locator.scrollIntoViewIfNeeded({ timeout: 5000 }).catch(() => {});
          const box = await locator.boundingBox({ timeout: 5000 });
          if (!box || box.width < 2 || box.height < 2) return { ok: false, reason: (label || 'control') + ' has no usable viewport bounds' };
          await pg.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
          return { ok: true };
        } catch (error) {
          return { ok: false, reason: String(error && error.message || error).slice(0, 220) };
        }
      }
      async function activateWorker(bar, tabName) {
        const activated = await stb(bar, 'activateName', tabName);
        if (!activated) return { ok: false, reason: 'named tab activation failed' };
        // The Electron shell owns native BrowserView geometry. Repair and verify
        // it before any input; a transient 100px restore layout must fail closed.
        await stb(bar, 'repairLayout', 'activate:' + tabName);
        await sleep(550);
        let layout = await stb(bar, 'layoutStatus', null);
        if (!layout || !layout.supported) return { ok: false, reason: 'layout bridge missing; restart the Automation Browser before running workers' };
        if (!layout.healthy) {
          await sleep(700);
          layout = await stb(bar, 'layoutStatus', null);
        }
        if (!layout || !layout.healthy) return { ok: false, reason: 'viewport_layout_unhealthy', layout: layout || null };
        return { ok: true, layout };
      }
      async function setSelect(pg, wanted, ariaLabel, fallbackIndex) {
        let control = pg.locator('mat-select[aria-label="' + ariaLabel + '"]').first();
        if (!(await control.count().catch(() => 0))) {
          const selects = pg.locator('mat-select[role="combobox"], [role="combobox"]');
          const count = await selects.count().catch(() => 0);
          if (count <= fallbackIndex) return { ok: false, reason: 'missing control ' + ariaLabel };
          control = selects.nth(fallbackIndex);
        }
        try {
          await pg.keyboard.press('Escape').catch(() => {});
          await sleep(100);
          const current = (await control.innerText().catch(() => '')).trim();
          if (current.toLowerCase().includes(wanted.toLowerCase())) return { ok: true, chosen: current, unchanged: true };
          const opened = await trustedMouseClick(pg, control, ariaLabel);
          if (!opened.ok) return opened;
          await sleep(300);
          const optionBox = await pg.evaluate((expected) => {
            const normalized = String(expected).trim().toLowerCase();
            const candidate = [...document.querySelectorAll('mat-option, [role="option"]')].find((node) => {
              const rect = node.getBoundingClientRect();
              return (node.innerText || '').trim().toLowerCase() === normalized && rect.width > 2 && rect.height > 2;
            });
            if (!candidate) return null;
            const rect = candidate.getBoundingClientRect();
            return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
          }, wanted).catch(() => null);
          if (optionBox) {
            await pg.mouse.click(optionBox.x + optionBox.width / 2, optionBox.y + optionBox.height / 2);
            await sleep(300);
          } else {
            await pg.keyboard.press('Escape').catch(() => {});
            return { ok: false, reason: 'option ' + wanted + ' unavailable' };
          }
          const chosen = (await control.innerText().catch(() => '')).trim();
          return { ok: chosen.toLowerCase().includes(wanted.toLowerCase()), chosen };
        } catch (error) {
          await pg.keyboard.press('Escape').catch(() => {});
          return { ok: false, reason: String(error && error.message || error).slice(0, 180) };
        }
      }
      async function setImagesOnly(pg) {
        const option = pg.locator('button[role="radio"]').filter({ hasText: 'Images only' }).first();
        if (!(await option.count().catch(() => 0))) return { ok: false, reason: 'Images only output option missing' };
        if ((await option.getAttribute('aria-checked').catch(() => '')) === 'true') return { ok: true, chosen: 'Images only', unchanged: true };
        const clicked = await trustedMouseClick(pg, option, 'Images only output option');
        if (!clicked.ok) return clicked;
        await sleep(300);
        const chosen = await option.getAttribute('aria-checked').catch(() => 'false');
        return { ok: chosen === 'true', chosen: chosen === 'true' ? 'Images only' : 'not selected' };
      }
      async function verifyConfiguration(pg) {
        return pg.evaluate(() => {
          const value = (label) => (document.querySelector('mat-select[aria-label="' + label + '"]') || {}).innerText || '';
          const output = [...document.querySelectorAll('button[role="radio"]')]
            .find((button) => /Images only/i.test(button.innerText || ''));
          const result = {
            output: Boolean(output && output.getAttribute('aria-checked') === 'true'),
            aspect: value('Aspect ratio').trim(),
            resolution: value('Resolution').trim(),
            thinking: value('Thinking Level').trim(),
          };
          result.ok = result.output && result.aspect === '16:9' && result.resolution === '1K' && result.thinking === 'High';
          return result;
        }).catch((error) => ({ ok: false, error: String(error && error.message || error) }));
      }
      async function configure(pg) {
        const output = await setImagesOnly(pg);
        const aspect = await setSelect(pg, '16:9', 'Aspect ratio', 0);
        const resolution = await setSelect(pg, '1K', 'Resolution', 1);
        const thinking = await setSelect(pg, 'High', 'Thinking Level', 2);
        return { output, aspect, resolution, thinking };
      }
      async function submit(pg, prompt) {
        const staged = await pg.evaluate((text) => {
          const box = document.querySelector('textarea, [contenteditable="true"], [role="textbox"]');
          if (!box) return { ok: false, reason: 'prompt box missing' };
          try {
            if (box instanceof HTMLTextAreaElement || box instanceof HTMLInputElement) {
              const proto = box instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
              const setter = Object.getOwnPropertyDescriptor(proto, 'value').set;
              setter.call(box, text);
            } else {
              box.textContent = text;
            }
            box.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText', data: text }));
            box.dispatchEvent(new Event('change', { bubbles: true }));
            box.focus();
            window.__siParallelPreviousImages = [...document.querySelectorAll('img')]
              .filter((img) => img.naturalWidth >= 700 && img.naturalHeight >= 400)
              .map((img) => img.currentSrc || img.src).filter(Boolean);
            return { ok: true, promptLength: text.length };
          } catch (error) {
            return { ok: false, reason: String(error && error.message || error).slice(0, 180) };
          }
        }, prompt).catch((error) => ({ ok: false, reason: String(error && error.message || error).slice(0, 180) }));
        if (!staged.ok) return staged;

        // HTMLElement.click() dispatches an untrusted synthetic event. AI Studio
        // accepts the text but ignores that event, leaving it in the composer.
        // Locator.click() emits a trusted CDP pointer sequence without making the
        // window foreground, which is the interaction the live Run button needs.
        const buttons = pg.locator('button');
        const count = await buttons.count().catch(() => 0);
        let runIndex = -1;
        for (let i = 0; i < count; i++) {
          const button = buttons.nth(i);
          const label = (await button.innerText().catch(() => '')).trim();
          const visible = await button.isVisible().catch(() => false);
          const disabled = await button.isDisabled().catch(() => true);
          if (/^(run|generate)\b/i.test(label) && /Ctrl/i.test(label) && visible && !disabled) {
            runIndex = i;
            break;
          }
        }
        if (runIndex < 0) return { ok: false, reason: 'enabled Run Ctrl button missing' };
        try {
          const clicked = await trustedMouseClick(pg, buttons.nth(runIndex), 'Run button');
          if (!clicked.ok) return clicked;
          await sleep(300);
          const remaining = await pg.evaluate(() => {
            const box = document.querySelector('textarea, [contenteditable="true"], [role="textbox"]');
            return box && 'value' in box ? String(box.value || '').length : String(box && box.textContent || '').length;
          });
          if (remaining !== 0) return { ok: false, reason: 'Run click was not accepted', remaining };
          await pg.evaluate(() => { window.__siParallelSubmittedAt = Date.now(); });
          return { ok: true };
        } catch (error) {
          return { ok: false, reason: String(error && error.message || error).slice(0, 180) };
        }
      }

      if (PHASE === 'submit') {
        const bar = await toolbar();
        if (!bar) return { fatal: 'named-tab toolbar unavailable', jobs: [] };
        async function prepareAndSubmit(job) {
          const record = { index: job.index, sceneId: job.sceneId, name: job.name, userSlot: job.userSlot, submittedAt: null, model: null, attempts: [] };
          const marker = 'si_parallel_test=' + encodeURIComponent(job.name);
          const adopted = existingMarker(job);
          for (const model of MODELS) {
            let pg = null;
            if (adopted) {
              pg = await waitForPage(adopted, 5000);
              if (!pg) { record.attempts.push({ model: model.id, reason: 'authenticated existing tab not found', adopted }); break; }
              record.adoptedExistingTab = true;
            } else {
              const url = 'https://aistudio.google.com/u/' + job.userSlot + '/prompts/new_chat?model=' + encodeURIComponent(model.id) + '&' + marker;
              const opened = await stb(bar, 'new', {
                url,
                name: job.name,
                options: { background: true, accountSlot: String(job.userSlot), agentName: 'image-worker-' + String(job.index).padStart(2, '0') },
              });
              if (opened === null) { record.attempts.push({ model: model.id, reason: 'named tab open timed out' }); break; }
              pg = await waitForPage(marker, 20000);
              if (!pg) { record.attempts.push({ model: model.id, reason: 'named tab not found by unique marker' }); break; }
            }
            // AI Studio's material-select overlays can ignore a background page's
            // first click. Focus emulation preserves background execution without
            // stealing the user's OS/browser focus.
            await pg.context().newCDPSession(pg)
              .then((session) => session.send('Emulation.setFocusEmulationEnabled', { enabled: true }))
              .catch(() => {});
            await automation.watchPage(pg, {
              agentName: 'image-worker-' + String(job.index).padStart(2, '0'),
              accountSlot: String(job.userSlot),
              tabName: job.name,
            });
            const authenticated = await verifyAuthenticatedStable(pg, 10000);
            if (!authenticated.ok) {
              record.attempts.push({ model: model.id, reason: authenticated.reason, preflight: authenticated.state });
              break;
            }
            const activeName = adopted
              ? ADOPT_EXISTING_RUN_ID + '-u' + job.userSlot + '-scene-' + String(job.sceneId).padStart(4, '0')
              : job.name;
            const activation = await activateWorker(bar, activeName);
            if (!activation.ok) {
              record.attempts.push({ model: model.id, reason: activation.reason });
              break;
            }
            const state = await waitForComposer(pg, 30000);
            const gate = gateText(state.text);
            if (!state.ready) {
              record.attempts.push({ model: model.id, reason: gate || 'composer did not become ready' });
              continue;
            }
            const settings = await configure(pg);
            const verification = await verifyConfiguration(pg);
            if (!settings.output.ok || !settings.aspect.ok || !settings.resolution.ok || !settings.thinking.ok || !verification.ok) {
              record.attempts.push({ model: model.id, reason: 'required setting unavailable or not persisted', settings, verification, controls: state.comboboxes, modelBits: state.modelBits });
              break;
            }
            if (DRY) {
              record.model = model.id;
              record.dry = true;
              record.attempts.push({ model: model.id, settings, verification, submitted: false, reason: null, controls: state.comboboxes, modelBits: state.modelBits });
              break;
            }
            const sent = await submit(pg, job.prompt);
            record.attempts.push({ model: model.id, settings, verification, submitted: sent.ok, reason: sent.reason || null, controls: state.comboboxes, modelBits: state.modelBits });
            if (sent.ok) {
              record.model = model.id;
              record.submittedAt = Date.now();
              break;
            }
            await automation.capture('run_not_accepted');
            const after = await pageState(pg);
            if (!gateText(after.text)) break;
          }
          return record;
        }
        // The workers use distinct accounts and run concurrently after Run is
        // accepted. Electron renders only its active BrowserView, though, so
        // trusted settings/prompt/Run interaction must visit each named tab in
        // turn; parallel clicks would target zero-size hidden views.
        const out = [];
        for (const job of JOBS) out.push(await prepareAndSubmit(job));
        return { phase: 'submit', jobs: out, completedAt: Date.now() };
      }

      if (PHASE === 'harvest') {
        const until = Date.now() + 360000;
        const result = new Map(JOBS.map((job) => [job.index, { index: job.index, sceneId: job.sceneId, name: job.name, done: false, status: 'pending' }]));
        while (Date.now() < until) {
          for (const job of JOBS) {
            const row = result.get(job.index);
            if (row.done) continue;
            const marker = existingMarker(job) || ('si_parallel_test=' + encodeURIComponent(job.name));
            const pg = findPage(marker);
            if (!pg) { row.status = 'tab missing'; row.done = true; continue; }
            await automation.watchPage(pg, {
              agentName: 'image-worker-' + String(job.index).padStart(2, '0'),
              accountSlot: String(job.userSlot),
              tabName: job.name,
            });
            const snapshot = await pg.evaluate(async () => {
              const body = document.body ? document.body.innerText : '';
              const previous = window.__siParallelPreviousImages || [];
              const candidates = [...document.querySelectorAll('img')]
                .filter((img) => img.naturalWidth >= 700 && img.naturalHeight >= 400)
                .filter((img) => !previous.includes(img.currentSrc || img.src))
                .filter((img) => {
                  const ratio = img.naturalWidth / img.naturalHeight;
                  return ratio >= 1.70 && ratio <= 1.85;
                });
              const image = candidates[candidates.length - 1];
              // "Thinking Level: High" is static composer text. Only a live Stop
              // control represents an active request, so no worker is held open
              // merely because the settings panel contains the word "thinking".
              const busy = [...document.querySelectorAll('button, [role="button"]')]
                .some((el) => /^(stop|cancel)$/i.test((el.innerText || el.getAttribute('aria-label') || '').trim()));
              if (!image) return { busy, body: body.slice(-12000), image: null };
              const response = await fetch(image.currentSrc || image.src);
              const blob = await response.blob();
              const data = await new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(String(reader.result).split(',')[1]);
                reader.readAsDataURL(blob);
              });
              return { busy, body: body.slice(-12000), image: { data, mime: blob.type || 'image/png', w: image.naturalWidth, h: image.naturalHeight } };
            }).catch((error) => ({ error: String(error && error.message || error) }));
            if (snapshot.error) { row.status = 'inspect error'; row.error = snapshot.error; row.done = true; continue; }
            if (snapshot.image && snapshot.image.data) {
              const ext = /jpe?g/i.test(snapshot.image.mime) ? 'jpg' : /webp/i.test(snapshot.image.mime) ? 'webp' : 'png';
              const file = job.outBase + '.' + ext;
              const bytes = Buffer.from(snapshot.image.data, 'base64');
              fs.mkdirSync(path.dirname(file), { recursive: true });
              fs.writeFileSync(file, bytes);
              row.done = true;
              row.status = 'saved';
              row.file = file;
              row.bytes = bytes.length;
              row.width = snapshot.image.w;
              row.height = snapshot.image.h;
              row.mime = snapshot.image.mime;
              continue;
            }
            const gate = gateText(snapshot.body);
            const fail = String(snapshot.body || '').match(/failed to generate[^.]*\.?|generation failed[^.]*\.?|unable to generate[^.]*\.?/i);
            if (gate || (fail && !snapshot.busy)) {
              row.done = true;
              row.status = 'failed';
              row.error = gate || fail[0].slice(0, 180);
            }
          }
          if ([...result.values()].every((row) => row.done)) break;
          await sleep(3500);
        }
        for (const row of result.values()) {
          if (!row.done) { row.done = true; row.status = 'timed out'; }
        }
        return { phase: 'harvest', jobs: [...result.values()], completedAt: Date.now() };
      }

      if (PHASE === 'cleanup') {
        const bar = await toolbar();
        if (!bar) return { phase: 'cleanup', closed: 0, error: 'named-tab toolbar unavailable' };
        const tabs = await stb(bar, 'get', null);
        let closed = 0;
        for (const tab of (tabs && tabs.tabs) || []) {
          if (String(tab.name || '').startsWith(${JSON.stringify(RUN_ID)})) {
            await stb(bar, 'close', tab.id);
            closed += 1;
          }
        }
        return { phase: 'cleanup', closed };
      }
      return { fatal: 'unknown phase ' + PHASE };
    })();
  `;
}

function linkSavedAssetsToProject(harvest) {
  if (DRY || !fs.existsSync(PROJECT_FILE)) return [];
  const project = JSON.parse(fs.readFileSync(PROJECT_FILE, 'utf8'));
  if (!Array.isArray(project.scenes)) return [];
  const linked = [];
  for (const row of harvest.jobs || []) {
    if (row.status !== 'saved' || !row.file) continue;
    const scene = project.scenes.find((item, index) => safeSceneNumber(item && item.scene_id, index + 1) === row.sceneId);
    if (!scene) continue;
    const relativeAsset = path.relative(PROJECT_DIR, row.file).split(path.sep).join('/');
    scene.asset_file = relativeAsset;
    scene.asset_metadata = {
      generated_at: new Date().toISOString(),
      generation_run: RUN_ID,
      image: { width: row.width, height: row.height, bytes: row.bytes, mime: row.mime },
    };
    linked.push({ sceneId: row.sceneId, assetFile: relativeAsset });
  }
  if (linked.length > 0) {
    fs.writeFileSync(PROJECT_FILE, `${JSON.stringify(project, null, 2)}\n`, 'utf8');
  }
  return linked;
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.mkdirSync(ASSET_DIR, { recursive: true });
  const startedAt = Date.now();
  console.log(`RUN_ID=${RUN_ID}`);
  console.log(`OUT_DIR=${OUT_DIR}`);
  console.log(`ASSET_DIR=${ASSET_DIR}`);
  console.log(`PHASE submit: opening ${JOBS.length} named background tab(s)${DRY ? ' without prompt submission' : ' and dispatching distinct prompts'}.`);
  const submitEnvelope = await postDaemon(daemonCode('submit'), 480000, 'image_submit');
  const submit = submitEnvelope.result || submitEnvelope;
  const submitted = (submit.jobs || []).filter((job) => job.submittedAt).length;
  console.log(`PHASE submit complete: ${submitted}/${JOBS.length} request(s) accepted by the composer.`);

  if (DRY) {
    const summary = {
      runId: RUN_ID,
      startedAt: new Date(startedAt).toISOString(),
      finishedAt: new Date().toISOString(),
      elapsedSeconds: Number(((Date.now() - startedAt) / 1000).toFixed(1)),
      dry: true,
      models: MODEL_CHAIN,
      outputDirectory: OUT_DIR,
      assetDirectory: ASSET_DIR,
      submit,
      totals: { requested: JOBS.length, submitted: 0, saved: 0, failed: 0, timedOut: 0 },
    };
    fs.writeFileSync(path.join(OUT_DIR, 'summary.json'), JSON.stringify(summary, null, 2));
    console.log(`DRY RESULT requested=${JOBS.length} configured=${(submit.jobs || []).filter((job) => job.dry).length}`);
    return summary;
  }

  console.log('PHASE harvest: waiting collectively for all active image generations.');
  const harvestEnvelope = await postDaemon(daemonCode('harvest'), 330000, 'image_harvest');
  const harvest = harvestEnvelope.result || harvestEnvelope;
  const saved = (harvest.jobs || []).filter((job) => job.status === 'saved').length;
  const failed = (harvest.jobs || []).filter((job) => job.status === 'failed').length;
  const timedOut = (harvest.jobs || []).filter((job) => job.status === 'timed out').length;
  const linkedAssets = linkSavedAssetsToProject(harvest);
  const summary = {
    runId: RUN_ID,
    startedAt: new Date(startedAt).toISOString(),
    finishedAt: new Date().toISOString(),
    elapsedSeconds: Number(((Date.now() - startedAt) / 1000).toFixed(1)),
    models: MODEL_CHAIN,
    outputDirectory: OUT_DIR,
    assetDirectory: ASSET_DIR,
    submit,
    harvest,
    linkedAssets,
    totals: { requested: JOBS.length, submitted, saved, failed, timedOut },
  };
  fs.writeFileSync(path.join(OUT_DIR, 'summary.json'), JSON.stringify(summary, null, 2));
  console.log(`RESULT requested=${JOBS.length} submitted=${submitted} saved=${saved} failed=${failed} timedOut=${timedOut}`);
  for (const row of harvest.jobs || []) {
    console.log(`SCENE ${row.index}: ${row.status}${row.file ? ` ${path.basename(row.file)} ${row.width}x${row.height} ${row.bytes}B` : row.error ? ` (${row.error})` : ''}`);
  }
  return summary;
}

main()
  .catch((error) => {
    console.error(`FATAL: ${error && error.stack || error}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    // The test must not leave a fleet of AI Studio tabs in the user's shared browser.
    try {
      const cleanup = await postDaemon(daemonCode('cleanup'), 60000, 'image_cleanup');
      console.log(`CLEANUP closed=${(cleanup.result || cleanup).closed || 0}`);
    } catch (error) {
      console.error(`CLEANUP_WARNING: ${String(error && error.message || error).slice(0, 240)}`);
    }
  });
