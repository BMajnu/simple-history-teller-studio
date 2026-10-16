# HANDOFF — Advanced Agent Brief
Date: 2026-10-13 | Project: Simple History Teller Production Studio
Workspace: `D:\Developing Projects\Itihash Explainer Video`
App binary: `release/SimpleItihash-Portable/SimpleItihashStudio.exe` (also dev: `npx electron electron/main.js`)
Server :4000 · Daemon :9333 · CDP :9224 · OS: Windows + PowerShell 7 + Node 24

## 1. THE OPEN ISSUE (unfixed — start here)
**Lyria multi-worker dispatch fails on REUSED tabs: "no prompt box" / "enter did nothing".**
- Repro: `REUSE=1 node tools/dispatch.js` → m0/m2 `no prompt box`, m1 fill+Enter with zero effect (no echo, no busy).
- Same flow on FRESH tabs works (proven 4+ times: style-card click → textarea appears → fill → Generate → audio).
- Failing tabs show sidebar-only skeleton (`box:0, cards:0`) even after 45s waits + card retries.
- Hypotheses (untested): (A) SPA per-tab generation state machine won't reset without full reload/new chat; (B) hydration stalls under cumulative load — needs longer state-gated waits, not fixed sleeps; (C) per-tab model session affinity.
- Decisive A/B test NOT yet run: fresh tab full flow (expect PASS) vs same tab second run (expect FAIL?) — run this first.
- Related files: `tools/dispatch.js` (7-step runner), `tools/try_lyria_multi.js` (staggered dispatch + harvest), drop file `%APPDATA%/simple-itihash-production-studio/auto_tabs.json`.

## 2. PROVEN-WORKING (do not regress)
- Named tabs open/switch by name, zero OS-focus (E2E 5/5: `tools/test_named_tabs.js`).
- 9 parallel Google logins; sessions persist in `persist:studio-auto` partition (shared dev+packaged via forced single userData).
- Bangla channel owner = authuser=2, channel `UCOzERwa3GJqO00B8LMTPtDg` (see `tools/find_owner2.js`).
- Upload flow to details step (attach 88MB via CDP setFileInputFiles; Playwright setInputFiles caps at 50MB remote — use CDP path!). Publish step UNTESTED (user halted uploads; old 4 wrong shorts still live — delete/unlist needs user call).
- TTS (bn/en/hi) single + 3-parallel PASS; local BGM synth single + 3-era parallel PASS (8.0s exact).
- Lyria single generations PASS: `Temp/opencode/lyria_try.wav` (158s), `lyria_multi2.wav` (158s), `lyria_u2_177s.wav` (177s), `lyria_harv0.wav` (177s) — all ffprobe+RMS verified real music.
- Studio chapters updated live; Nalanda audio Missing fixed (workspace-root resolution).
- Self-test suite `tools/selftest.js` (9/10 + AI surface separately verified).

## 3. EXTERNAL WALLS (not code bugs — manage, don't chase)
- **Image models paywalled everywhere** (Nano Banana 2/2.1/Lite, all 9 accounts): "requires paid API key". Baked-text thumbs (thumb_ai1,3,4) resume on quota reset/billing via `tools/gen_thumbs_seq.js`. Composites shipped instead: `projects/sample_first_king/renders/shorts_full/thumb_bn_full*.jpg` (Part 3 চাঁদাবাজি QA-passed).
- **Lyria quota unknown ceiling** (2-3 tracks/day observed working; concurrent same-account submits can reject).
- **Google UI drift**: model IDs rotate (?model= params), Bengali UI breaks English selectors (match bn+en), Studio markup changes (evaluate exact-text match wins).
- **Human contention**: user shares the browser (closes/navigates tabs mid-run). Mitigations that work: fail-fast per item + summaries, quiet windows for long runs. Long-term: dedicated automation instance.
- **AV locks** kill electron-builder (EBUSY/EPERM deterministic) and sometimes fresh-dir deletes → portable build is manual (`release/`); never run the app from a dir being (re)built.

## 4. HARD RULES (in SYSTEM_PROMPT.md §1A/§3.1A/§4.0–4.2 + code)
- NEVER launch Task subagents for own work; pipeline parallelism only via scripts.
- Workers: no `bringToFront` (use toolbar `stb.activateByName` / CDP activateTarget); screenshots best-effort + timeout; bounded waits; per-step try/catch; SUMMARY + watchdog exit; never hang.
- Tabs: open named (drop-file `{url,name}` / `tabs:new`); match by name/unique marker (URL fragments get stripped by SPAs!); NEVER `pages()[0]` fallback; fresh-resolve handles every step; skip-saved outputs; hash-compare captures against cross-wired duplicates.
- Stagger navigations (5s+), preflight tab counts, retry once with backoff on ERR_ABORTED.
- Graceful shutdown only (CloseMainWindow; force-kill corrupts cookie DBs — observed session wipes).
- Never navigate `file://browser.html` (toolbar); toolbar auto-recreates on crash + Repair menu.
- Single shared userData for dev+packaged; workspace-root resolution (deepest match); Chrome UA spoof + background-throttling flags mandatory.
- Tooling quirks: .md/.json writes flakily fail (use temp+replace + verify); grep index lags ~2 min (verify via node/read); PowerShell has no `head`; single quotes only (double quotes get mangled).

## 5. KEY FILES
- `electron/main.js` (tabs, IPC, watcher, UA, flags, resolveRoot), `electron/browser.html`, `electron/browser-pre.js`
- `daemon.js` (:9333 → :9224 bridge), `tools/daemon_run.js` (generic runner)
- `tools/dispatch.js` (7-step standard), `tools/try_lyria_multi.js`, `tools/gen_thumbs_seq.js`
- `tools/upload_five_shorts.js`, `tools/find_owner2.js`, `tools/update_youtube_chapters_bn.js`
- `tools/selftest.js`, `tools/test_named_tabs.js`, `tools/probe_perm.js`
- Renders: `projects/sample_first_king/renders/shorts_full/` (5 mp4 + 5 thumbs + meta)
- Temp evidence: `%LOCALAPPDATA%/Temp/opencode/` (wav/mp3), `tools/fx_*.png`, `tools/contact_thumbs.jpg`

## 6. SUGGESTED FIRST MOVES (priority order)
1. A/B test §1 (fresh vs reused tab) → determines whether tab-reuse is viable at all.
2. If reuse viable: fix dispatch (state-gated waits, longer hydration budget) → 3/3 Lyria multi → captures.
3. If reuse NOT viable: fresh-tab-per-generation pipeline (drop-file opener already works) + close-by-name cleanup.
4. YouTube: publish 5 new shorts + set thumbs (scripts ready) + delete/unlist old 4 (needs user decision).
5. Baked-text thumbs on quota reset; Flow test project `565ddafe` needs 1-click delete by user.
