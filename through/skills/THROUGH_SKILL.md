# THROUGH_SKILL — Universal Automation Skill (any AI agent)

Base: extension SidePanel OR local bridge (HTTP poll against `/api/through/*`,
default `http://127.0.0.1:4000` — or WS push via `THROUGH_WS`, see README).
Engine is domain-agnostic. You (the agent) own the domain logic.

## Pre-flight (every task)

1. Read `src/sites/sitePacks.json` — pick `siteId`, copy its selectors into your jobs. Never hard-code selectors from memory; packs are the only selector source.
2. `THROUGH_STATUS` — must be `{ ok:true }`. If `isRunning`, wait or `THROUGH_STOP` first.
3. Keep jobs explicit JSON: `{ id, label, siteId, url, actions[], retries }`.

## Rules (MUST)

1. **Batch, don't loop scripts.** Submit ALL jobs in one `THROUGH_START_JOBS`. Engine runs sequentially (bulk-in-same-tab pattern) unless `options` says otherwise.
2. **Selectors from packs.** If UI drifted (Flow/AIStudio markup changes often), update the pack JSON — never patch `engine.js`/`content.js`.
3. **One tab per origin.** Bulk jobs reuse the same tab. Don't force new tabs per job.
4. **Human gates are first-class.** Any destructive/paid/public step (`approve credits`, `publish`, `attach reference`, `solve captcha`) ends with `{ op:'askHuman', args:{ reason } }`. Never auto-approve.
5. **Evidence.** After each batch, export logs (`Logs → Export JSON`) into your run folder: screenshots + DOM `extract` + failure message. A job without evidence = not done.
6. **Sensitive data.** Never put API keys/cookies/passwords inside job JSON. Reference local files (`uploadDataUrl` with short-lived data URLs) or askHuman.
7. **Verify, then next stage.** Poll status; only `done` jobs flow downstream. `failed` → fix selectors/payload → re-enqueue only those IDs.

## Generic pipeline (any domain)

```
0. Pick siteId + read pack
1. STATUS → idle?
2. Build jobs[] (bulk text OR structured data — same shape)
3. START_JOBS (batch) → poll STATUS / watch PROGRESS
4. Paused? → do the human step in the page → CONTINUE
5. Failed? → inspect error → fix → ENQUEUE only failed IDs
6. Export logs + extracted data to your run folder
```

## Action cheat-sheet (content.js ops)

`waitFor{selectors}` → `click{selector|text}` → `fill{selector,text,clearFirst,submitKey}` →
`selectOption{trigger,option}` → `uploadDataUrl{selector,dataUrl,filename}` →
`extract{fields:{name:selector}}` → `sleep{ms}` → `runJS{code}` (isolated) /
`pageRpc{kind:fetch|captcha|eval,…}` (page session) → `askHuman{reason}` → `download{url,filename}`

## Appendix A — video pattern (ONE example flow, not the purpose)

FlowKit pattern as data: entities (appearance-only) → scenes (action-only, `character_names[]`, `chain_type ROOT|CONTINUATION`, dual `prompt` + `video_prompt 0-3s/3-6s/6-8s`) → refs batch → scenes batch → clips batch → review (`score>=7.5`) → concat. See `examples/video-ref-scene-clip.json`. Copy the SHAPE for any multi-stage pipeline (research→draft→review→publish is identical).

## Appendix B — social publish pattern (another example flow)

One rendered file → per-platform jobs (`siteId: facebook|tiktok|youtube`,
`examples/social-upload.json`). Every flow ends with `askHuman` before anything
goes public — no silent auto-publish, ever. Same gate rule covers credit approvals
and captcha walls.

## Appendix C — exact-source map (VeoFlow + FlowKit ports)

New code was written ONLY for what was absent. Everything below is a
verbatim port (header says EXACT PORT) or a page-contract port:

| Source | Ported to | Notes |
|---|---|---|
| VeoFlow `prompt.md`, `video-prompt.md`, `flow_ui_elements.md` | `src/sites/flow/prompt.md`, `video-prompt.md`, `flow-ui-elements.md` | byte-identical bodies |
| VeoFlow `src/utils/openai.js` (SYSTEM/VIDEO prompts) | `src/sites/flow/openai-reference.js` | byte-identical reference |
| VeoFlow content page contract | `src/sites/flow/flow-content.js` | same message names/order/maps/sleeps, `__THROUGH_FLOW_*` flags |
| VeoFlow Control/Settings/History/MoreTools tabs | SidePanel Jobs/Sites/Flows/Logs + `sitePacks.json` flow `settingsSchema` | exact labels/defaults/options/copy; retry implemented (was dead upstream) |
| FlowKit `skills/fk-*.md` (12 workflow skills) | `skills/flowkit/fk-*.md` | byte-identical bodies, base `http://127.0.0.1:8100` |
| FlowKit data model + batch/review/concat | `pipeline/schemas.json`, `review-gate.md`, `concat.md` | exact enums/fields/weights/ffmpeg strings |
| FlowKit `batch-status` aggregate | `GET /api/through/batch-status` | same shape (`processing`=running, `completed`=done) |
