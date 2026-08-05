# Practice Book — Claude Code project brief

Paste this whole file into Claude Code as your first message. It sets up the project
and builds session one.

---

## Context

I'm building a golf practice app. I'm a 9 handicap working towards 5, playing at a
UK club, and I've been running a prototype as a single HTML file. I want to restart
properly as a React project I can grow into a real product and eventually ship to the
App Store.

I'm not a professional developer. Explain decisions briefly as you go, and tell me
when I need to make a choice rather than making it silently.

**The one idea this app is built around:** you tell it how long you have and what
facilities you can get to, and it generates a practice session that fits. Every other
golf practice app gives you a menu of fixed-length sessions and assumes you're standing
on a full practice ground. Most golfers aren't. They have twenty minutes and a putting
green, or a net in February, or a range bay and no short game area.

That constraint solver is the product. Everything else is supporting cast.

---

## Stack

Set up a new project with:

- **Vite + React + TypeScript**
- **Tailwind CSS**
- **React Router** for navigation
- **Zustand** for state (lightweight, no boilerplate)
- **Vitest** for tests on the generator logic

Mobile-first. Target is iPhone 15 in Safari, later wrapped for the App Store. Everything
must work at 393px wide with a bottom nav bar and safe-area insets respected.

Do NOT set up: auth, a backend, payments, analytics. Those come later. Storage is local
for now but must sit behind an adapter so a real backend can slot in without touching
the UI.

---

## Data model

Build these types first, in `src/types/`.

### Facility capabilities

```ts
type Capability =
  | 'range'          // hitting into open space, full shots, see ball flight
  | 'net'            // hitting into a net, no flight feedback
  | 'putting_green'
  | 'short_game'     // chipping/pitching area with a green
  | 'bunker'
  | 'sim'            // launch monitor or simulator
  | 'course'         // on course, playing holes
  | 'home'           // indoors, carpet, no ball flight, minimal space
```

### Venue

A user-created place with a set of capabilities. This replaces hardcoded course names.

```ts
interface Venue {
  id: string
  name: string              // "My club", "Range down the road", "Living room"
  capabilities: Capability[]
  isDefault?: boolean
}
```

Ship with three starter venues the user can edit or delete:
- "Golf club" — putting_green, short_game, bunker
- "Driving range" — range, short_game
- "At home" — home

### Drill

```ts
type Category = 'putting' | 'chipping' | 'pitching' | 'wedges' | 'bunker' | 'full_swing' | 'driving'
type Mode = 'warmup' | 'build' | 'pressure' | 'test'
type LogType = 'aggregate' | 'per_shot'   // one number, or shot by shot

interface Benchmark {
  band: string       // "Under 5", "Under 9", "Under 15", "Under 24"
  target: number
}

interface Drill {
  id: string
  name: string
  category: Category
  mode: Mode
  requires: Capability[]      // ANY of these satisfies it
  minutes: number             // typical duration
  minMinutes: number          // shortest sensible version
  purpose: string             // one line, what it trains
  why: string                 // one or two sentences, why it matters
  setup: string[]             // numbered steps
  tip: string
  scoring: string             // how the score is derived, in words
  metric: {
    label: string             // "Inside 10 ft", "Attempts", "Points"
    max: number
    lowerIsBetter: boolean
  }
  benchmarks: Benchmark[]     // targets by handicap band
  logType: LogType
}
```

### Session

```ts
interface SessionBlock {
  drillId: string
  minutes: number
  completed: boolean
  score?: number
}

interface Session {
  id: string
  date: string
  venueId: string
  requestedMinutes: number
  focus?: Category            // optional user-chosen emphasis
  blocks: SessionBlock[]
}
```

### Entry

One logged drill score.

```ts
interface Entry {
  id: string
  drillId: string
  sessionId?: string
  score: number
  note?: string
  ts: number
}
```

---

## The session generator

This is the important part. Put it in `src/lib/generator.ts`, keep it pure (no React,
no storage), and write real unit tests for it.

**Signature:**

```ts
generateSession(opts: {
  minutes: number
  capabilities: Capability[]
  focus?: Category
  recentDrillIds?: string[]   // avoid repeating the last session's drills
  allDrills: Drill[]
}): SessionBlock[]
```

**Rules it must follow:**

1. **Only include drills the venue can actually support.** A drill is eligible if the
   venue has at least one of its `requires` capabilities.
2. **Shape the session by mode.** Roughly:
   - Under 20 minutes: one warmup + one build. No pressure block; there isn't time
     to earn it.
   - 20–40 minutes: warmup + build + pressure.
   - Over 40 minutes: warmup + two builds + pressure, optionally a test.
3. **Always finish on a pressure or test drill.** The session should end with something
   that has a consequence, so the golfer walks away having had to deliver.
4. **Respect the time budget.** Total allocated minutes must be within ±10% of requested.
   Use each drill's `minMinutes` to compress rather than dropping a block, where possible.
5. **Bias to focus if given**, but never let a session be 100% one category unless the
   venue only supports one.
6. **Avoid `recentDrillIds`** where an equivalent alternative exists. Practice should
   vary week to week.
7. **Degrade gracefully.** If the venue supports very little (say `home` only) return
   the best short session possible and a clear reason string rather than an empty array.

Return blocks in the order they should be performed.

**Tests to write:**

- 15 minutes at a putting-green-only venue returns a valid putting session under 17 mins
- 60 minutes at a full venue returns 4+ blocks ending on pressure or test
- A venue with only `home` returns something non-empty
- Requesting focus `wedges` at a putting-green-only venue does not return wedge drills
- Recent drills are avoided when alternatives exist
- Total minutes always within ±10% of requested

---

## Screens for session one

Four screens, bottom tab nav.

### 1. Today (default)

The whole point of the app, so make it the first thing.

- Venue picker (chips, remembers last used)
- Time picker — 15 / 30 / 45 / 60 / custom
- Optional "focus on…" selector
- Big **Build my session** button
- Result: the generated session as an ordered list of blocks with drill name, minutes,
  and mode label. A **Start session** button.

A brand new user with no data must be able to get a usable session in under 60 seconds.
No gating, no signup, no "complete 5 drills to unlock". Value first.

### 2. Session runner

- One block at a time, big and legible at arm's length on a practice green
- Drill name, purpose, setup steps, tip
- Score entry appropriate to `logType`:
  - `aggregate` — numeric keypad, big targets
  - `per_shot` — shot-by-shot entry with a progress indicator
- **A benchmark strip under the score input** showing where the entered number sits
  against the handicap bands, with the user's own band highlighted
- **Next block** advances; final block finishes the session
- No nested scrolling containers anywhere. Tap targets minimum 44px. This is being used
  outdoors, in gloves, in wind.

### 3. Drills

Browse the full library. Filter by category and by "what I can do at this venue".
Tapping a drill opens the same detail view, runnable standalone.

### 4. Progress

Per drill: last score, best score, sparkline of the last 10, and the benchmark band
you're currently hitting. Nothing more elaborate yet.

### Settings

Venue management (add, edit capabilities, delete), handicap (sets which benchmark band
is highlighted), units, theme, export data as JSON.

---

## Storage

`src/lib/storage.ts` — a single adapter with `get`, `set`, `remove`, `list`. Back it
with IndexedDB (via `idb-keyval`) and nothing else for now. Every read and write in the
app goes through this module so a backend can be swapped in later without touching
components.

Include an **export all data as JSON** and **import** in settings from day one.

---

## Design direction

Not another dark app with green accents — that's what every golf app does, including the
one I'm competing with. I want something that reads like a well-made yardage book or a
training log: paper-toned light mode, strong condensed headings, a restrained accent,
and tabular figures for anything numeric. Confident and legible, not neon.

Get the fundamentals right, because my competitor hasn't:

- Respect safe-area insets on every screen. Headers must never collide with the status bar.
- One scroll container per screen. Never nest vertical scrolls.
- Stacked labels must be block-level so they don't run together.
- Test at 393px wide.

---

## Content to port

I have around 13 drills in my existing prototype covering rough play, wedges 25–75 yards,
4–7 ft putting and driving, plus three pre-round warmups (15/30/60 min) and add-on blocks
for greens and short game. I'll paste that data in once the project scaffold is up — ask
me for it when you're ready.

---

## Session one: what "done" looks like

By the end of this session I want:

1. Project running locally with `npm run dev`
2. Types, storage adapter and generator implemented, generator tests passing
3. Four screens navigable with the bottom nav
4. Venue setup working, with the three starter venues
5. Session generation working end to end with placeholder drill data
6. Session runner able to log a score and persist it

Do not build: auth, backend sync, payments, XP, streaks, achievements, round tracking.
Those are later, and some of them may never be right for this app.

Start by scaffolding the project and showing me the folder structure before you write
any feature code.
