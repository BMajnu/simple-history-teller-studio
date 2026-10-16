# 01. RESEARCH-TO-SCRIPT PROTOCOL (UNIVERSAL v3)

> Scope: EVERY video project in this studio, ANY topic, ANY language, ANY angle.
> No project names, no worked examples, no legacy grading systems below — only the
> method. Method sources: NU Library Research Process
> (https://resources.nu.edu/researchprocess/researchtopic), NHCC Basic Steps
> (https://www.nhcc.edu/academics/library/doing-library-research/basic-steps-research-process),
> Videomaker documentary research
> (https://www.videomaker.com/how-to/documentary/heres-how-to-conduct-research-for-a-documentary),
> IDA fact-checking practice
> (https://www.documentary.org/feature/no-spin-zone-how-journalistic-documentaries-check-their-facts),
> NYFA documentary scripting
> (https://www.nyfa.edu/student-resources/how-to-write-a-documentary-script),
> Desktop Documentaries scripting
> (https://www.desktop-documentaries.com/how-to-write-a-script.html),
> Georgetown 2-column method (https://guides.library.georgetown.edu/documentary/home).

## CORE RULE

Research runs in NUMBERED PHASES. Each phase ends with ONE markdown file in
`research/`. The next phase MUST NOT start until the current phase file exists
and its exit checklist passes. When all phase files exist, they are cross-checked
TOGETHER, and only then does scripting begin. Research never stops fully —
new findings during production re-enter at the phase they belong to
(Videomaker: "never stop researching").

File sequence (exact names):

  research/R1_charter.md → R2_background.md → R3_search_log.md →
  R4_source_sweep.md → R5_evaluation.md → R6_ledger.md →
  R7_synthesis.md → R8_factcheck.md → (then script)

---

## R1 — CHARTER (topic + questions)

1. One page: working title, intended audience in one sentence, angle, non-goals.
2. Write 5–9 research questions AS QUESTIONS (NHCC). Questions expose keywords;
   statements hide them.
3. List the load-bearing claims (max 10) the episode will stand on.
4. Name the counter-position that must be investigated, not hidden (IDA: find who
   will disagree BEFORE publishing).
5. Exit: `R1_charter.md` exists with questions, claims, counter-position.

## R2 — BACKGROUND SWEEP (general → specific)

1. Tertiary first: encyclopedias, timelines, institutional histories (NHCC Step 2;
   NHCC tip: work general→specific).
2. Wikipedia/reference lists are TRAILHEADS, never citations — follow every
   reference to its origin (Reddit practitioner consensus; Videomaker: check citations).
3. Build a date spine: event → date → pointer to where proof lives.
4. Exit: `R2_background.md` with spine + keyword pack v1 (all languages and
   spelling variants of the topic).

## R3 — SEARCH STRATEGY + LOG (NU "Preparing to Search")

1. Open `R3_search_log.md` BEFORE searching. Every query is one row:
   `date | exact query | engine/database | filters | hits scanned | keeps`.
2. Minimum engine set: general web + books + scholar + archives + newspaper
   archives + video transcripts + library catalogs. Log zero-hit engines too.
3. Operators: Boolean AND/OR/NOT, exact-phrase quotes, date ranges, domain
   scoping, filetype for reports. Non-English topics get native-language packs.
4. Volume rule (Ken Burns via Videomaker: collect ~40x what you will use).
   Saturation stop rule: a question is covered only after ≥3 independent source
   classes consulted AND 10 consecutive scanned hits add nothing new. Log the stop.
5. Exit: log shows every engine touched + a stop reason per question.

## R4 — SOURCE SWEEP, THREE FAMILIES (Videomaker: written / visual / interpersonal)

Collect from ALL three families; an empty family must be justified in writing:

1. WRITTEN: books (print included — NHCC), peer-reviewed articles, primary
   documents (letters with dates, laws, communiqués, reports), contemporary
   press, official/institutional publications, theses/grey literature, statistics.
2. VISUAL: archival photos, footage, maps, manuscripts (research value AND
   asset value — Adobe/Videomaker: collect archival footage during research).
   Every visual gets: provenance + license + courtesy line draft.
3. INTERPERSONAL: expert authors (NYFA: books lead to experts who fact-check or
   appear on camera), eyewitness/oral-history accounts with timestamps.
   LLM chatbots are brainstorming aids ONLY (NU lists AI under exploration) —
   never sources, never citations.
4. Exit: `R4_source_sweep.md` — class × family checklist with counts and IDs.

## R5 — EVALUATION (NHCC CARS + NU "Evaluating Information")

Score every kept source on CARS — Credibility, Accuracy, Reasonableness, Support:
- VERIFIED: passes all four; primary or top-reputation secondary. Screen-usable as fact.
- ATTRIBUTED: passes Credibility+Accuracy, weaker elsewhere. Usable ONLY with
  on-screen attribution ("historian X argues…", "the report records…").
- OPINION: fails Reasonableness or Support. Usable ONLY inside an opinion frame
  ("critics say…"), never as narration fact.
- CIRCULATING (unverified narrative — kept WITH provenance, never dropped silently):
  a claim with an identifiable origin (book, article, viral post) but no primary
  proof may appear ONLY in an allegation frame: who says it + where it first
  appears + on-screen "unverified — no document found" card + the counter-evidence
  in an adjacent shot. Unproven ≠ false, but unframed presentation as fact = QA FAIL.
- Exit: `R5_evaluation.md` — every source ID carries one of the four stamps.

## R6 — CLAIM LEDGER (NHCC "Make notes" — upgraded)

1. One row PER CLAIM (not per source): `claim-ID | exact wording | source-IDs |
   stamp | locator (page/archive/URL + access date) | status:
   confirmed / contested / rejected`.
2. Log rejects with reasons (NHCC: document everything consulted) — rejects block
   viral claims from creeping back in later phases.
3. Mechanical law: NO ledger row = NO script sentence. This is what separates
   research from link-collecting.
4. Exit: `R6_ledger.md` with ≥25 rows (or a written justification for fewer).

## R7 — SYNTHESIS (research becomes story)

1. Re-read ALL of R1–R6 together; list contradictions and gaps explicitly.
2. Build the outline FIRST (NYFA sequence outline; Desktop Documentaries):
   message in one sentence → acts → beats → hero/villain forces (person, thing,
   or event) → beginning/middle/end → emotional roller-coaster order.
3. Two-column AV rows (Georgetown/NYFA/Desktop-Docs): left = VIDEO the viewer
   sees, right = AUDIO the viewer hears; one row = one scene. Narration column
   cells each carry their ledger claim-ID in brackets.
4. Asset map: every visual row traces to an R4 visual source or is marked
   AI-generated (never presented as archival).
5. Exit: `R7_synthesis.md` — message, outline, beat list, gap notes
   ("what we could not verify and how the script phrases it").

## R8 — FACT-CHECK PASS (IDA practice)

1. A different pair of eyes (or a next-day self-review) vets against the LEDGER,
   not the script: every date, name, number, quote traced back to its row.
2. Pre-empt the other side (IDA): for each contested claim, write the strongest
   objection and confirm the script answers or acknowledges it.
3. Repetition is not verification (IDA): a claim repeated on 5 sites with one
   origin = ONE source. Same-origin multiples collapse to a single ledger entry.
4. Exit: `R8_factcheck.md` with per-claim PASS/FAIL + sign-off name and date.
   FAIL on any load-bearing claim returns the project to the phase that owns it.

## HANDOFF — SCRIPTING MAY BEGIN

Scripting starts ONLY when R1–R8 all exist and R8 shows zero load-bearing FAILs.
Script module rules (enforced downstream): one sentence per shot, one new fact
per sentence, every narration sentence keeps its ledger claim-ID until voice
recording, and any late discovery re-enters at its phase (file updated, gate re-passed).
