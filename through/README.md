# Through – Simple Automation (Universal)

> **Universal browser + workflow automation bridge. Any site, any task.**
> Video generation (Flow / AI Studio) is **example flow #1**, not the purpose.
> Same engine also runs: bulk forms, research→extract, uploads, QA, CRM, scraping, publishing.

Derived from two references, generalized:
- `crisng95/flowkit` → in-page authenticated RPC (`pageBridge.js`), batch queue + poll, ref→scene staged data, review loop, provider-agnostic bridge.
- `MuazAshraf/flow_automation_tool` → bulk queue UX (blank-line split, settings-once, pause-for-input, auto-download), declarative UI selectors, prompt templates as data.

## What is generic vs example?

| Generic core (never fork per project) | Example data (copy/paste, not code) |
|---|---|
| `manifest.json`, `src/background/engine.js`, `src/content/content.js`, `src/injected/pageBridge.js`, `src/sidepanel/*` | `src/sites/sitePacks.json` (`generic`, `flow`, `aistudio`, `youtube`, `facebook`, `tiktok` packs), `examples/*.json`, `skills/THROUGH_SKILL.md` Appendix A |
| Ops: `waitFor/click/fill/selectOption/uploadDataUrl/extract/sleep/runJS/pageRpc/askHuman/download` | Video `character_names`, `chain_type`, dual `prompt/video_prompt` live in example JSON only |

## Run standalone (no server, no build)

1. `chrome://extensions` → Developer mode → Load unpacked → `through/`
2. Pin **Through**, open SidePanel.
3. Pick site pack → paste bulk (blank line = new job) → Start.
4. `askHuman` pauses → act in page → Continue. Logs → Export JSON.

## Add a new site in 5 minutes (no engine change)

1. Copy the `generic` block in `src/sites/sitePacks.json` → new `siteId`.
2. Fill `match[]` domains + `defaults` selectors (inspect once, like `flow_ui_elements.md`).
3. Optional `actionsPreset` with `{{PLACEHOLDERS}}`.
4. Reload extension → new pack appears in both dropdowns. Done.

## Drive from ANY local app (decoupled bridge)

The extension never imports studio code. Two paths, same job shape `{ id, label, siteId, url, actions[], retries, meta }`:

**A. HTTP poll (no new deps, default).** Any server implements 5 endpoints; the
extension polls `GET /api/through/pending?claim=1` every minute (or SidePanel →
Sync now) and POSTs each result to `/api/through/jobs/:id/result`:

```
POST /api/through/jobs { jobs[] } → { ok, ids }
GET  /api/through/pending?claim=1&limit=5 → { jobs[] (with actions when claimed) }
POST /api/through/jobs/:id/result { status:'done'|'failed', result?, error? }
GET  /api/through/jobs?status=pending|running|done|failed
GET  /api/through/status → counts
```

- Our studio (`server.js :4000`) already speaks this (Through bridge section) —
  **one server among many**, and inert unless something enqueues. Enable in
  SidePanel → Jobs → Bridge → baseUrl → Enable → Sync now.
- `src/bridge/through-client.js` shows the same contract from Node.

**B. WS push (realtime, needs `ws` on your server).** `ThroughClient` in
`src/bridge/through-client.js` (`THROUGH_START_JOBS/STATUS/PAUSED/CONTINUE/…`,
point `THROUGH_WS` at your port) — for servers that want push instead of poll.

## Why this fixes the old pain

- Sept 2026 Flow moved to `flow.google.com`, `Bearer ya29…` died → page-context `pageRpc` (FlowKit lesson) instead of header replay.
- Bengali/English UI drift → selectors live in packs, engine untouched; `selectOption{trigger,option}` + text-fallback click survive renames.
- Reused-tab `no prompt box` (HANDOFF) → explicit `waitFor` + per-job status + retry, not fixed sleeps; `busy` guard stops double-submit.
- Quota/paywall/human contention → `askHuman` + `retries` + evidence export, same as `automation_runs/` but generic.

## Layout

```
through/
  manifest.json
  src/background/engine.js    # queue, tabs, pause, logs, downloads
  src/content/content.js      # 12 generic ops
  src/injected/pageBridge.js  # MAIN-world fetch/captcha/eval
  src/sidepanel/              # vanilla Jobs/Sites/Flows/Logs
  src/sites/sitePacks.json    # generic + flow + aistudio + youtube + facebook + tiktok (examples)
  src/bridge/through-client.js# Node client (WS push) + HTTP contract docs
  skills/THROUGH_SKILL.md     # agent contract
  examples/                   # bulk-generic / video-ref-scene-clip / research-extract / social-upload
  tools/make-icons.js         # dev-only icon generator (zero deps)
```
