# 10. Automation Observability, Reliable Interaction & Portable Delivery

## Purpose

Every image, video, speech, BGM and publishing worker is an auditable production job. A browser tab is never an identity by itself: its worker name, account slot, target tab name, project and visual evidence must travel together.

## 1. Required job contract

Every request to `http://127.0.0.1:9333/run-script` MUST include a `run` object:

```json
{
  "projectId": "my_episode",
  "workflow": "image|video|speech|bgm|publish",
  "agentName": "image-worker-03",
  "accountSlot": "3",
  "tabName": "image-u3-scene-0012",
  "captureIntervalMs": 5000
}
```

The daemon creates `projects/<projectId>/automation_runs/<timestamp>__<workflow>__<id>/`. Each observed worker receives its own `agents/<agent>__account_u<slot>__<tab>/` folder containing:

- `screenshots/` — initial, periodic (5–10 seconds) and final PNGs;
- `states/` — DOM text, detected action controls and failure signals matching each screenshot;
- `events.ndjson` — navigation, console, request and interaction events;
- `status.json` — current state and last evidence path;
- `failure.json` — terminal diagnostic record when the worker fails.

Use `automation.watchPage(page, { agentName, accountSlot, tabName })` immediately after resolving every unique worker page. Never rely on an arbitrary browser page as a fallback.

## 2. Tab and account discipline

1. Worker names must be stable and readable: `<workflow>-u<account>-<job>`, for example `speech-u2-bn-scene-004`.
2. Open automated tabs with `{ background: true, accountSlot, agentName }`; background work must not show, activate, focus, or steal the user's active browser tab.
3. The account slot in the tab name and URL (`/u/<n>/`) must agree. If not, record `account_mismatch` and stop that job.
4. Find a worker by an exact unique query marker or exact toolbar tab name. Multiple matching pages are a failure condition, not a reason to use `pages()[0]`.

### 2.1 BrowserView geometry and manual-verification gate

The Automation Browser uses Electron `WebContentsView` tabs. A Windows minimize, restore, maximize, or early-show event can briefly report a tiny content rectangle. That temporary measurement **MUST NEVER** be applied to a worker view. A collapsed view is recognizable by a thin top strip of AI Studio and a blank lower window.

1. The shell must preserve the last known-good bounds whenever its content width is below 640 px or usable page height is below 360 px; it must schedule a settled re-layout after `resize`, `restore`, `maximize`, `unmaximize`, and `show`.
2. Before input, a worker must activate only its named internal BrowserView, request `layoutStatus`/`repairLayout`, and require `healthy: true` with a usable active-view height. This changes the Automation Browser's tab, not the user's operating-system focus.
3. If the bridge is absent (for example, an old shell is still open), the worker must stop with `layout_bridge_missing`. If the geometry is unhealthy, stop with `viewport_layout_unhealthy`. Do not fill a prompt, change settings, press Run, or treat DOM visibility alone as proof that the rendered view is usable.
4. Human verification remains authoritative: when a verifier sees a thin strip/blank lower pane, stop the batch, capture the evidence, restart or restore the Automation Browser, and re-run the preflight. Never continue to the next scene from a collapsed worker.
5. UI preparation is serialized across visible BrowserViews because Electron renders one active view at a time. Once each trusted Run is accepted, the cloud generations may run in parallel.

## 3. Trusted interaction rule — mandatory for Run / Generate / Submit

AI Studio may accept prompt text while ignoring a JavaScript DOM synthetic click. Therefore:

1. Fill the prompt and wait until the control is visible and enabled.
2. Locate the exact visible `Run`, `Generate`, or confirmation control.
3. Use a trusted CDP pointer or keyboard sequence against the active, layout-healthy BrowserView; **never** use `HTMLElement.click()`, `dispatchEvent('click')`, or a DOM-evaluated submit as success criteria. A locator click that reports an out-of-viewport target is a layout failure, not a reason to use a synthetic DOM click.
4. Verify a state transition within a bounded timeout: composer clears, Stop/Cancel/spinner appears, a job card changes, or output is added.
5. On no transition: `automation.capture('run_not_accepted')`, record the selector, enabled state and text tail, then retry only through a defined fallback. Do not silently declare success.

`Control+Enter` may be used only as a documented secondary recovery action. It is never proof that submission occurred.

## 4. Failure taxonomy and recovery

Workers record one explicit terminal reason: `target_unresolved`, `account_mismatch`, `layout_bridge_missing`, `viewport_layout_unhealthy`, `selector_missing`, `control_disabled`, `run_not_accepted`, `quota_or_rate_limit`, `login_required`, `network_failure`, `download_missing`, `output_validation_failed`, or `unexpected_error`.

- Capture before and after every retry or account rotation.
- Quota/login state is a job-level outcome, not a silent UI error. Move only that job to the next authenticated account slot and preserve prior evidence.
- Cap screenshots at 240 per worker (20 minutes at 5 seconds) so a stuck tab cannot fill the disk.
- Redact secrets from event text; never copy cookies, browser profiles, API keys or account passwords into a project folder or portable bundle.

## 5. Completion validation

Generation success requires all relevant checks: expected output control/card observed, output downloaded or saved below the project, non-zero file size, and (for media) duration/probe validation. Update `project.json` only after these checks pass.

## 6. Portable workspace rule

Use:

```powershell
node tools/export_portable_project.js <project_id> --zip --hash
node tools/verify_portable_bundle.js <exported-folder>
```

The export contains the selected `projects/<project_id>` tree (video, audio, images, renders, metadata and automation evidence), all source workflow instructions and a `RUN_PORTABLE.cmd`. It deliberately excludes browser cookies and logged-in accounts. On the destination machine run `RUN_PORTABLE.cmd`, then sign in to the allowed AI accounts inside the Automation Browser.

## 7. Legacy-runner migration gate

Historical one-off scripts in `tools/` are not automatically approved production runners. Before use, run:

```powershell
node tools/audit_automation_contract.js --write
```

Any `foreground_tab`, `arbitrary_page`, or `dom_synthetic_submit` finding must be migrated to this contract before a quota-consuming run. The current supported runners are `test_parallel_images_10.js`, `aistudio_speech_helper.js`, `dispatch_bgm_electron.js`, `dispatch.js`, and `try_lyria_multi.js`.
