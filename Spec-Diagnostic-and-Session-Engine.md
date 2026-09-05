# Implementation Spec
## A · Round logging and the diagnostic engine  (Master Brief §3.3)
## B · The Session Player  (Master Brief §6.4)

**Project:** MGA / *Senda* · **Owner:** Brett, AL Performance · **Version:** 1.0 · **15 August 2026**
**Reads with:** `Golf-App-Master-Brief.md` — §3.1 supplies every benchmark constant used here.

**Confidence convention:** **[V]** verified from a primary source · **[D]** derived by me, needs validating against your own data · **[C]** calibration constant, a starting value to be replaced once you have real users.

---
---

# SPEC A — Round logging and the diagnostic engine

## A1. What this component does

**In:** a golfer's basic round stats, entered in ~30 seconds, plus their handicap index (or an estimate).
**Out:** a ranked Game Profile — which of four areas is costing them most, how much it's worth in shots, and how confident the app is in saying so.

**The three design constraints that drive everything below:**

1. **No hardware.** Every input must be recallable from memory at the end of a round. This is the whole competitive wedge — every rival needs Arccos or Shot Scope data before it can build you a plan.
2. **Honest confidence.** Within-handicap-band variation exceeds between-band variation (Brief §3.2). One round is noise. The engine must say so and must visibly sharpen as data arrives.
3. **Two of the four obvious stats are traps.** Fairways hit is flat across the whole handicap range; putts per round is confounded by greens hit. The engine must not use either naively.

---

## A2. Data model

### A2.1 `Round`

```ts
type Area = 'ott' | 'app' | 'short' | 'putt';

interface Round {
  id: string;
  userId: string;
  playedAt: string;              // ISO date, local
  holesPlayed: 9|10|11|12|13|14|15|16|17|18;
  par: number;                   // par for the holes actually played
  grossScore: number;

  // Tier 1 — required
  gir: number;                   // greens in regulation, 0..holesPlayed
  penalties: number;             // penalty strokes + lost balls
  putts: number;
  upDownMade: number;
  upDownAttempts: number;

  // Tier 2 — required but defaultable
  fairwaysHit: number;
  fairwaysPossible: number;      // default 14 for 18 holes, 7 for 9
  threePutts: number;

  // Tier 3 — optional deep dive, Plus only, offered ~1 round in 5
  deepDive?: {
    teeMiss: { left: number; right: number; short: number; long: number };
    approachMiss: { u100: number; b100_150: number; b150_200: number; o200: number };
  };

  // WHS (only if you are computing an index — see Brief §10.2 risk 2)
  courseRating?: number;
  slopeRating?: number;
  pcc?: number;                  // -1..+3

  source: 'manual' | 'import';
  createdAt: string;
}
```

### A2.2 `NormalisedRound` — always 18-hole equivalent

Every downstream calculation uses this, never the raw round.

```
f = 18 / holesPlayed          // scale factor

girN        = gir * f
penaltiesN  = penalties * f
puttsN      = putts * f
threePuttsN = threePutts * f
fairwayPct  = fairwaysHit / fairwaysPossible          // ratio, not scaled
udPct       = upDownMade / max(1, upDownAttempts)     // ratio, not scaled
scoreToPar  = (grossScore - par) * f
roundWeight = holesPlayed / 18                        // for confidence counting
```

**A 9-hole round counts as 0.5 rounds toward confidence.** Nine holes is the beginner's native format and now WHS-acceptable at 9–18 holes (Brief §3.8) — it must be a first-class case, not an edge case, but it carries half the evidential weight.

### A2.3 `GameProfile` — the output contract

```ts
interface GameProfile {
  userId: string;
  computedAt: string;
  roundsUsed: number;            // weighted count
  handicapUsed: number;          // index, or estimate, or self-assessment prior
  handicapSource: 'whs' | 'estimated' | 'self_assessed';
  confidence: 'estimate' | 'low' | 'medium' | 'good';

  areas: Array<{
    area: Area;
    rank: 1|2|3|4;               // 1 = worst = practice priority
    z: number;                   // shrunk standardised residual, + = worse than peers
    shotsLostVsScratch: number;  // the "here's the picture" number
    recoverableShots: number;    // the "here's what it's worth" number
    headline: string;            // one plain sentence
  }>;

  totalShotsLostVsScratch: number;
  flags: string[];               // e.g. 'putting_myth', 'penalty_dominant', 'low_data'
}
```

---

## A3. Benchmark constants

Ship these as a static table, versioned. **[V]** — Shot Scope, 90M+ shots (Brief §3.1).

```js
// index by handicap; linear-interpolate between rows, clamp outside 0..25
const BENCH = [
  // H     girPct  pen    udPct  putts  fwPct  scoreToPar
  [  0,    61,     0.56,  47,    29.4,  50,    0.83  ],
  [  5,    44,     0.91,  41,    30.2,  48,    6.33  ],
  [ 10,    36,     1.62,  31,    31.2,  49,   10.88  ],
  [ 15,    24,     2.45,  21,    33.1,  48,   17.38  ],
  [ 20,    17,     3.03,  20,    33.1,  46,   21.69  ],
  [ 25,    10,     4.67,  18,    33.8,  46,   28.97  ],
];
```

**Above 25:** extrapolate linearly but cap penalties at 6.0/round and floor GIR at 0.5 holes, because the source data stops at 25 and linear extrapolation to a 40-handicap produces nonsense. **[D]**

**Never benchmark against Tour figures.** Shot Scope moved their own baselines to amateur bands for exactly this reason; showing a 20-handicap a Tour comparison produces a wall of red and they churn.

---

## A4. The putting model — solving the confound

Raw putts per round is useless on its own: it moves only 29.4 → 33.8 across 25 handicap strokes, and high handicaps chip onto greens and putt from closer, which flatters them.

**Fix: model expected putts as a function of greens hit, then measure the residual.**

Ordinary least squares on the six benchmark rows (GIR holes → putts):

```
E[putts | girN] = 34.778 − 0.5170 × girN        R² = 0.957
```

Fit residuals across the six rows: +0.30, −0.48, −0.23, +0.56, −0.10, −0.05 — all inside ±0.6 putts. **[D]**

```
puttResidual = puttsN − (34.778 − 0.5170 × girN)     // positive = worse
```

**What this means, and it is worth understanding before you build on it:** because the curve fits so well, a golfer's *handicap* explains almost none of their putting once you know how many greens they hit. Differences in putts per round between handicap bands are overwhelmingly a GIR effect, not a putting-skill effect. That is the quantified form of "your putting probably isn't the problem" — and it is the single most useful thing this engine can tell a mid-handicapper.

**Caveat to carry:** this is a population relationship derived from six aggregate rows, not from individual golfers. It cannot separate "putts well" from "leaves easy chips". Validate against your own users at N > 500 rounds and refit. **[D]**

**Secondary putting signal:** three-putts per round. Reference points are inconsistent in the literature — Broadie's Golfmetrics puts 90-shooters at ~2.3/round vs ~0.6 for pros; Arccos reporting suggests ~4.0 for 20+ handicaps vs 1.3 for scratch. **[U — conflicting]** Use three-putts for *copy* ("you three-putted 4 times — that's distance control, not stroke") but not as a scored input until you can norm it yourself.

---

## A5. Diagnosis — ranking the four areas

### A5.1 Residuals

Compute against handicap-matched benchmarks. Sign convention: **positive z = worse than your peers.**

```
zApp   = (bench.girHoles  − girN)        / SD.gir
zOtt   = (penaltiesN      − bench.pen)   / SD.pen
zShort = (bench.udPct     − udPct×100)   / SD.ud
zPutt  = (puttResidual)                  / SD.putt
```

**Calibration constants [C]** — starting values. Replace with observed within-band standard deviations once N > 500 rounds; that replacement is the single highest-value data task in the first six months.

```js
const SD = { gir: 2.2, pen: 1.3, ud: 12.0, putt: 1.8 };
```

**Fairways hit is deliberately absent.** It is flat at 46–50% from scratch to 25-handicap (Brief §3.1) — a binary that discards how badly you missed. Collect it (users expect to be asked, and it costs one tap), display it, but **do not let it enter the diagnosis.** Off-the-tee is diagnosed on penalties, which run 0.56 → 4.67, an 8× range.

### A5.2 Shrinkage toward the population prior

This is how §3.2 gets implemented rather than merely acknowledged.

```
shrink = n / (n + 5)          // n = weighted round count
z_a = z_raw_a × shrink
```

With 1 round the engine is 17% the user's own data and 83% population prior. At 5 rounds, 50/50. At 20 rounds, 80% their own. The user *sees* the confidence label move, which is both honest and a reason to keep logging. **[D — standard James–Stein style shrinkage, k=5 chosen for a sensible confidence curve; tune it.]**

### A5.3 Allocating shots lost

Base weights anchored on Broadie's variance decomposition (long game ~72%, short game 11%, putting 17% **[V]**) with the long game split using Shot Scope's costliest-shot findings — approach costs most per swing, tee shots most per round.

```js
const BASE = { app: 0.40, ott: 0.32, short: 0.11, putt: 0.17 };   // [D]
const K = 0.5;                                                     // modulation strength [C]

w_a  = max(0.02, BASE[a] × (1 + K × z_a))
w_a  = w_a / Σw                                     // normalise
total = avgScoreToPar − 0.83                        // vs the scratch benchmark
shotsLostVsScratch[a] = total × w_a
```

The **total** is anchored to real data (their own score vs the scratch benchmark). The **split** is population prior modulated by the individual. Neither half is invented.

### A5.4 "What it's worth" — the number the user acts on

Shots-lost-vs-scratch is the picture. It is also a big, slightly demoralising number. The actionable figure is separate: **what you'd save by reaching the standard of a golfer five handicap points better, in this one area.**

Direct per-unit conversions **[D — transparent approximations; validate]**:

| Unit | Shots |
|---|---|
| 1 penalty stroke avoided | 1.15 |
| 1 extra green in regulation | 0.55 |
| 1 extra up-and-down converted | 0.85 |
| 1 putt saved | 1.00 |

```
target_a         = BENCH interpolated at (handicap − 5), that stat only
recoverable_a    = max(0, (player_a − target_a)) × conversion_a
```

**Use `recoverable` in the UI. Use `shotsLostVsScratch` in the chart.** Never blend them — they answer different questions and mixing them is how you end up promising something you can't deliver.

### A5.5 Worked example — compute this as your first unit test

Player: handicap index 20.0, 5 logged 18-hole rounds. Averages: score +23.0, GIR 3.4, penalties 3.8, up-and-down 16%, putts 33.9, fairways 44%.

Benchmarks at H=20: GIR 3.06 holes · penalties 3.03 · U&D 20% · fairways 46% · score to par 21.69
Expected putts at 3.4 GIR: `34.778 − 0.5170 × 3.4 = 33.02` → **puttResidual = +0.88**

| | raw z | shrunk (×0.50) | weight | shots lost vs scratch |
|---|---|---|---|---|
| Approach | −0.155 | −0.08 | 36.2% | **8.03** |
| Off the tee | +0.592 | +0.30 | 34.6% | **7.67** |
| Short game | +0.333 | +0.17 | 11.2% | **2.49** |
| Putting | +0.489 | +0.24 | 18.0% | **3.98** |
| | | | | **22.17 total** |

Recoverable, against a 15-handicap standard in each area:

| Area | Now | 15-hcp standard | Recoverable |
|---|---|---|---|
| Off the tee | 3.8 penalties | 2.45 | **1.55 shots** |
| Putting | +0.88 residual | 0.00 | **0.88 shots** |
| Short game | 16% U&D | 21% | **0.62 shots** |
| Approach | 3.4 GIR | 4.32 | **0.51 shots** |
| | | | **≈3.6 shots** |

**Note the two rankings disagree, and that is the point.** By raw volume, approach is the biggest bucket. By *recoverable in the next twelve weeks*, off the tee is worth three times as much — because this player takes 3.8 penalty shots a round against a peer average of 3.03, and penalties are the cheapest shots in golf to stop giving away.

**Practice priority ranks on `recoverable`, not on `shotsLostVsScratch`.** A 25-handicap does not fix their approach play by trying harder at 180 yards; they fix their score by stopping the reload off the tee.

### A5.6 Flags and copy

| Flag | Condition | Copy it drives |
|---|---|---|
| `putting_myth` | User self-assessed putting as their worst area, but `zPutt < 0.2` | "Your putting is fine. Here's what's actually costing you." |
| `penalty_dominant` | `recoverable.ott > 1.5 × ` next highest | "You're losing more to penalty shots than to any swing fault." |
| `low_data` | weighted n < 3 | Suppress all shot numbers. Show ranking only, labelled *Estimate*. |
| `short_game_gap` | `udPct < 0.5 × bench.udPct` | Route to the 25–50 yard pitch, not the greenside chip — that's the 9%→32% gradient. |
| `improving` | 5-round rolling `recoverable` total down >0.8 vs prior 5 | Fires paywall trigger C (Brief §8.4). |

---

## A6. Confidence model

| Weighted rounds | Label | What the UI shows |
|---|---|---|
| 0 (onboarding only) | **Estimate** | Ranking only, from self-assessment. Amber. "This sharpens fast once you log 5 rounds." |
| 0.5 – 2.9 | **Low** | Ranking + recoverable, with a ± band of ±40% |
| 3 – 9.9 | **Medium** | Full profile, ± band of ±20% |
| ≥ 10 | **Good** | Full profile, ± band of ±10% |

**Recompute on every round insert.** Cheap, and the user seeing the number move is the retention mechanic.

**Onboarding cold start:** map the six self-assessment taps to prior z values directly, set `n = 0`, `handicapSource = 'self_assessed'`, and label the whole profile *Estimate*. Never show a shots figure at n=0 — you would be inventing it.

---

## A7. Round entry UX

**Budget: 30 seconds, seven inputs, zero keyboards.**

Order is deliberate — the two the user remembers most reliably come first, and the two that need thought come last:

1. **Score** — large stepper, prefilled from par
2. **Greens in regulation** — 0–18 stepper
3. **Penalties and lost balls** — 0–15 stepper. Sub-label: *"Include water, OB and any ball you couldn't find."* Under-reporting here is the biggest data-quality risk in the app
4. **Putts** — stepper, prefilled at 32
5. **Up and downs** — dual stepper "made / attempted", prefilled attempts at `18 − gir`
6. **Fairways** — stepper out of 14
7. **Three-putts** — 0–6 stepper

**Validation** — soft warnings, never hard blocks. Golfers misremember; refusing their round loses the round *and* the user.

| Rule | Message |
|---|---|
| `putts < gir` | "Fewer putts than greens hit — did you chip in?" |
| `gir > holesPlayed` | Hard block, clamp |
| `upDownMade > upDownAttempts` | Hard block, clamp |
| `upDownAttempts > holesPlayed − gir + 2` | "That's more up-and-downs than greens you missed." |
| `threePutts × 3 > putts` | Soft warn |
| `grossScore < par + gir/2` | "That's a very good round — double-check the score?" |
| `penalties = 0` and `grossScore > par + 25` | "Really no penalty shots? Most rounds like this have a few." |

**Deep dive (Tier 3, Plus).** Offer on roughly one round in five, never consecutively, and only when the user has just finished entering — never as an interruption. Two screens, four taps each: tee-miss pattern, and approach distance bucket for missed greens.

**Non-18-hole rounds.** Hole count is the *first* thing chosen, not buried in settings. Support 9 through 18 — 11, 13 and 15 are all WHS-acceptable since April 2024.

---

## A8. Edge cases

| Case | Behaviour |
|---|---|
| No handicap at all | Estimate one from score to par: `H ≈ (avgScoreToPar − 0.83) / 1.126`, clamp 0–54, flag `estimated`. **[D — derived from the table's own gradient]** |
| Handicap > 25 | Extrapolate with the caps in §A3. Label the profile *Estimate* regardless of round count |
| Wildly outlying round (blow-up) | Include it — but compute the profile on a **trimmed mean**, dropping the single highest and lowest score-to-par once n ≥ 5 |
| Two rounds same day | Allowed, both count |
| Round edited after the fact | Recompute profile; keep an audit trail. Never silently change a displayed number without a "profile updated" note |
| Simulator / indoor round | Store with `source` flagged; **exclude from the diagnostic** — turf interaction and penalties don't transfer |
| User has Arccos or Shot Scope | Import path is v1.3+. When it lands, imported rounds get `roundWeight × 1.5` |

---

## A9. Test vectors

Ship these as unit tests.

| # | Input | Expected |
|---|---|---|
| 1 | The §A5.5 worked example | Weights 36.2/34.6/11.2/18.0 ±0.5pp; total 22.17 ±0.05; priority rank = `ott` |
| 2 | 9-hole round, all stats exactly half the §A5.5 values | Identical profile to test 1; `roundsUsed` = 0.5; confidence `low` |
| 3 | Scratch player at every benchmark value, n=20 | All z ≈ 0; total ≈ 0; no area dominant |
| 4 | 20-hcp with putts = expected − 3.0 | `zPutt` strongly negative; `putting_myth` flag fires if self-assessed as worst |
| 5 | n = 1 | All shot figures suppressed; confidence `low`; ranking present |
| 6 | n = 0, onboarding only | Confidence `estimate`; no shot figures at all |
| 7 | `penalties = 8`, everything else at benchmark | `penalty_dominant` fires; `ott` ranks 1 |
| 8 | `gir = 0`, `putts = 30` | `puttResidual = 30 − 34.778 = −4.78` → strong negative z. Confirms the model rewards, not punishes, a poor ball-striker who putts well |

---
---

# SPEC B — The Session Player

## B1. What this component does

Turns a Game Profile plus "I have 45 minutes and a driving range" into a specific, sequenced, scored practice session — then adapts the next one from the result.

**This is the app's actual intellectual property.** Everything else is a competent tracker.

---

## B2. The evidence it implements

| Design rule | Source | Where it appears in code |
|---|---|---|
| **Blocked → random progression** beats pure blocked *and* pure random on retention | Porter & Magill **[V]** | §B4 phase sequence |
| **Novices benefit from blocked; experienced from random** | Guadagnoli, Holcomb & Weber 1999 **[V]** | §B4.2 beginner override |
| **External focus of attention** is the most consistent finding across 52 golf RCTs | Barzyk & Gruber 2024 **[V]** | §B6 cue schema — enforced at data level |
| **~70% success** is where learning is fastest | Challenge Point Framework **[V]** | §B7 adaptive difficulty |
| **Reduced feedback beats continuous** on retention | Butki & Hoffman **[V]** | §B5.2 feedback deprivation |
| **Learner-controlled difficulty** beat every other condition | Jalalvand et al. **[V]** | §B7.4 manual override |
| Sessions are **50 balls / 45–60 minutes** in the real world | UK forum evidence **[V]** | §B4.1 default budget |

---

## B3. Data model

### B3.1 `Drill`

```ts
interface Drill {
  id: string;
  name: string;
  area: Area;
  facility: Array<'range'|'green'|'net'|'sim'|'course'>;
  phases: Array<'warmup'|'block'|'random'|'pressure'>;   // where it can be used
  ballsPerRep: number;
  minLevel: 1|2|3|4|5|6|7;                               // gate beginners out of advanced drills
  scoring: 'binary' | 'zone3' | 'measure';

  // difficulty ladder — the SAME drill at 7 tightnesses
  levels: Array<{
    level: number;
    targetSpec: string;      // "within 25 yds of the flag"
    successCriteria: string; // machine-readable in v2; human-readable in v1
  }>;

  cue: {
    external: string;        // REQUIRED
    internalBanned: true;    // lint rule, see §B6
  };

  tier: 'free' | 'plus';
  estimatedMinutes: number;
}
```

### B3.2 `Session`

```ts
interface Session {
  id: string; userId: string;
  generatedAt: string; scheduledFor?: string;
  facility: 'range'|'green'|'net'|'sim';
  budgetMinutes: number; budgetBalls: number;
  difficultyLevel: number;             // 1..7, the user's current level
  primaryArea: Area; secondaryArea: Area; maintenanceArea?: Area;

  phases: Array<{
    phase: 'warmup'|'block'|'random'|'pressure';
    drillId: string;
    prescriptions: Array<{             // one entry per ball, pre-generated
      index: number; club: string; targetYards?: number;
      targetLabel: string; cue: string;
    }>;
    seed: number;                      // for reproducible shuffles on resume
  }>;

  state: 'scheduled'|'in_progress'|'completed'|'abandoned';
  results?: SessionResult;
}

interface SessionResult {
  shots: Array<{ phase: string; index: number; outcome: 0|1|2; at: string }>;
  byPhase: Record<string, { made: number; attempted: number }>;
  pressureScore: number; pressureAttempts: number;
  successRate: number;                 // pressure phase only
  completedFully: boolean;             // partial sessions do NOT feed adaptation
  durationSeconds: number;
}
```

---

## B4. Session generation

### B4.1 Budgets

Default unit — **50 balls, 45–60 minutes** — comes from what golfers actually do, not from what would be ideal.

| Phase | Share of balls | 50-ball session | Purpose |
|---|---|---|---|
| Warm-up | 16% | 8 | Half swings, wedge, no scoring |
| **Block** | 30% | 15 | Same club, same target. Groove it |
| **Random** | 36% | 18 | Club and target shuffle every ball |
| **Pressure** | 18% | 9 | Scored game, one attempt, no do-overs |

Scale proportionally for 30-minute (30 balls) and 90-minute (80 balls) sessions. Below 20 balls, drop the Random phase and run Warm-up → Block → Pressure — interleaving needs volume to mean anything.

### B4.2 Beginner override — do not skip this

If `userLevel ≤ 2` or `handicapSource = 'self_assessed'` and the user selected "never played" or "learning":

| Phase | Share |
|---|---|
| Warm-up | 20% |
| **Block** | 50% |
| Random | 20% |
| Pressure | 10% |

Plus an **errorless progression**: start at the shortest distance in the drill's ladder and lengthen only after two consecutive sessions above 75%. Novices benefit from blocked practice; throwing randomised practice at someone who cannot yet make contact produces failure, not learning — and failure at session one is churn.

### B4.3 Area allocation

```
primary     = argmax(recoverable)      // from Spec A, NOT shotsLostVsScratch
secondary   = 2nd by recoverable
maintenance = any area untouched for > 14 days
```

Ball split: **primary 60% · secondary 25% · maintenance 15%.** If nothing has gone stale, primary takes 70% and secondary 30%.

Facility gating: filter the drill pool by `facility`. If the user only has a putting green, the primary area is overridden to `putt` or `short` for that session, and the app says so plainly: *"You're at the green, so we'll work short game today. Your approach session is still queued."*

### B4.4 Prescription generation

- **Block:** one club, one target, repeated. `prescriptions[i]` identical for all 15.
- **Random:** seeded Fisher–Yates over the club/target pool, with **no immediate repeats** and each combination appearing within ±1 of equal frequency. Store the seed so a resumed session replays identically.
- **Pressure:** a named game with a fixed structure (Par 18, 9-shot ladder, Gate Challenge). Order is fixed, not shuffled — the sequence is part of the test.

---

## B5. Phase behaviour

### B5.1 Common shot loop

```
render prescription → user taps Hit / Miss (or a 3-zone control) →
optimistic local write → 3-second undo window → commit → advance
```

Every shot is persisted locally the moment it is tapped. **Assume the network is not there** — driving ranges are famously bad for signal, and a session that loses 40 shots because a bay had no bars is a one-star review.

### B5.2 Feedback deprivation — Block phase only

**Hide the running score during Block.** Reveal a summary on balls 3, 6, 9, 12, 15 only.

This directly implements the finding that 50–100% feedback deprivation beat continuous feedback on retention. It will feel wrong to users who expect a live counter, so it needs one line of explanation the first time: *"We'll show you where you're at every few balls. Constant feedback makes practice feel better and stick worse."*

Random and Pressure show the running score live. Pressure especially — visible stakes are the point.

### B5.3 Pressure phase

- One attempt per shot. **No undo after the 3-second window.**
- Running score visible and prominent.
- On the final shot, a subtle state change — this is the shot that decides the session.
- **The pressure score is the only score that feeds adaptation.** Block and Random are practice; Pressure is measurement.

---

## B6. The cue system

**Every cue must be external.** This is the most consistent finding in the golf motor-learning literature and it costs nothing but discipline.

| Write this | Never this |
|---|---|
| "Start the ball over the left edge of the flag." | "Rotate your hips through impact." |
| "Land it on the front third of the green." | "Keep your left arm straight." |
| "Roll it into the back of the cup, not at it." | "Accelerate through the ball." |
| "Clip the tee out from under the ball." | "Shift your weight forward." |

**Enforce it in the build, not in review.** A CI lint rule over the drill content: fail the build if any `cue.external` string matches a banned-token list — `hips`, `shoulder`, `wrist`, `weight shift`, `arm`, `elbow`, `spine`, `knee`, `grip pressure`, `backswing`, `follow-through`, `head`. Content is written by humans and humans revert to body cues; a lint rule doesn't.

**One documented exception:** for `userLevel ≤ 2`, an internal cue is permitted, because Perkins-Ceccato found low-skill players benefited from internal focus while high-skill benefited from external. Store these as `cue.internalForNovice` and serve them only below level 3. Everyone else gets external only.

---

## B7. Adaptive difficulty

### B7.1 The signal

```
observed = pressureScore / pressureAttempts
```

Pressure phase only. Nine attempts is a small sample, so smooth across sessions rather than reacting to one:

```
s_t = 0.4 × observed + 0.6 × s_{t−1}          // EWMA, α = 0.4  [C]
s_0 = 0.70                                     // seed at target
```

### B7.2 The rule

Target band **0.62 – 0.78**, centred on 0.70.

| Condition | Action |
|---|---|
| `s > 0.80` for 2 consecutive completed sessions | level + 1 |
| `s < 0.55` for 2 consecutive completed sessions | level − 1 |
| otherwise | hold |

- **Maximum one level of movement per session.** Clamp 1–7.
- **Partial sessions never adapt.** `completedFully = false` → skip entirely.
- New users hold at their starting level for the first three sessions regardless.

### B7.3 What a level actually means

The ladder tightens the target, it does not change the drill. Example — Approach Ladder, 150 yards:

| Level | Success criterion |
|---|---|
| 1 | Anywhere on the target line, any distance |
| 2 | Within 40 yards of the target |
| 3 | Within 30 yards |
| 4 | Within 25 yards |
| 5 | Within 20 yards |
| 6 | Within 15 yards |
| 7 | Within 10 yards |

Calibration sense-check: a 20-handicap's average approach proximity is about 20 feet from *inside* 100 yards, and TrackMan Combine data puts an 18-handicap at 27.5 yards average proximity from 180. **Level 3–4 is the right entry point for a mid-handicapper at 150 yards.** **[D — validate against your own users' self-reported outcomes]**

### B7.4 Manual override — required, not optional

A discreet control in the session overflow: **"Too easy" / "Too hard"**.

- Applies ±1 level **immediately**, mid-session
- Sets a two-session lockout on automatic movement in the *opposite* direction, so the engine doesn't fight the user
- Logged as an explicit event — it is also your best difficulty-calibration data

Learner-controlled difficulty was the best-performing condition in the review. Give people the wheel.

---

## B8. Screen states

| State | Content | Notes |
|---|---|---|
| **Pre-session brief** | Name, duration, balls, targets, primary area, *why this session* in one line | The "why" is what separates this from a drill list |
| **Phase transition** | Full-bleed card, 2s auto-advance or tap. "Now: Random. The app calls each shot." | Explains the *change*, briefly |
| **Shot card** | Club (40pt) · distance · external cue · Hit/Miss (56pt) · undo | §6.4 of the Brief. No keyboard, ever |
| **Between shots** | 400ms transition. No interstitials, no ads, no tips | |
| **Feedback reveal** (Block, every 3rd) | "11 of 15" plus one line | |
| **Paused** | Auto after 10 min idle. Resume / End early | Ranges have queues, phones ring |
| **End early** | Confirm. Saves partial, flagged, excluded from adaptation | Never punish the user for stopping |
| **Summary** | Brief §6.4 | |

**Screen must stay awake for the whole session.** Nothing kills a range session faster than unlocking your phone between every shot with a glove on.

**Haptics** on every shot confirm — the user is often not looking at the screen.

**Force light theme in Session mode by default**, with a manual dark override. Outdoor sunlight legibility beats aesthetic consistency.

---

## B9. Summary generation

Computed on completion:

```
delta            = pressureScore − lastPressureScoreForSameDrill
weakestPhase     = argmin(made/attempted across block, random, pressure)
weakestTarget    = the target with the lowest hit rate in Random
inTargetBand     = 0.62 ≤ successRate ≤ 0.78
```

Templated copy — **one sentence, plain, specific, never hyped**:

> "Your 100 and 130 yard targets are solid. **160 yards is where it falls apart** — that's now the focus of Tuesday's session."

> "You're sitting at 69% overall — right in the range where learning is fastest. We'll hold the difficulty here."

**Language rules for every string in this component:**
- Never "you crushed it", "amazing", "🔥"
- Never claim a course outcome from a range result. *"This should help your approach play"* is a lie you cannot evidence — practice-to-course transfer has never been demonstrated in a controlled golf study (Brief §3.5)
- Always name the specific thing that moved or didn't
- If nothing improved, say so, and say what changes next

---

## B10. Persistence, offline and interruption

- **Local-first.** Session generated and fully materialised before it starts — every prescription pre-computed, nothing fetched mid-session
- Every shot written to local storage synchronously; sync queue drains opportunistically
- Kill and relaunch mid-session → resume at the exact shot, using the stored seed
- Session older than 48 hours in `in_progress` → auto-abandon, flagged, excluded from adaptation
- Conflict resolution: last-write-wins on shots, but **never** overwrite a `completed` session with an `in_progress` one

---

## B11. Analytics

Minimum event set — instrument these from day one, because §8.6 of the Brief only works if you can see the funnel:

```
session_generated   { primaryArea, facility, budgetMinutes, level, isBeginnerMode }
session_started     { sessionId, secondsSinceGenerated }
phase_started       { phase, ballCount }
shot_recorded       { phase, index, outcome, secondsSincePrevious }
shot_undone         { phase, index }
difficulty_override { direction, level, phase }
session_paused      { phase, index }
session_ended_early { phase, index, percentComplete }
session_completed   { successRate, pressureScore, durationSeconds, deltaVsLast }
range_card_shared   { channel }
```

`secondsSincePrevious` is the sleeper metric — it tells you whether people are genuinely practising with intent or tapping through, and it is the earliest signal that a drill is badly designed.

---

## B12. Test cases

| # | Scenario | Expected |
|---|---|---|
| 1 | 45 min, range, primary `app`, level 4 | 50 balls split 8/15/18/9; Block prescriptions all identical; Random has no immediate repeats |
| 2 | Beginner (level 1, "never played") | 20/50/20/10 split; shortest ladder distance; internal cues served |
| 3 | 25 min, putting green only | Random phase dropped; primary overridden to `putt`; explanation string present |
| 4 | Pressure 8/9, previous EWMA 0.79 | `s = 0.4×0.889 + 0.6×0.79 = 0.830` → above 0.80. Second consecutive → level 5 |
| 5 | Same, but `completedFully = false` | EWMA unchanged; level unchanged |
| 6 | User taps "too hard" at level 5 | Immediate level 4; auto-increase locked for 2 sessions; event logged |
| 7 | Force-quit at Random shot 11, relaunch | Resumes at Random shot 11; remaining prescriptions identical to pre-quit (seed) |
| 8 | Drill authored with cue "keep your left arm straight" | **Build fails** on the banned-token lint |
| 9 | Level 7, `s = 0.85` two sessions running | Level stays 7 (clamped); summary suggests a harder drill instead |
| 10 | Airplane mode for the whole session | All shots recorded; summary renders; sync queued; nothing lost |

---

## B13. What is deliberately not in v1

| Deferred | Why |
|---|---|
| Automatic shot detection / launch monitor integration | The hardware-free path is the wedge. Adding hardware puts you in Break X Golf's market, where you lose |
| Video capture | A different product. Skillest owns async video coaching at 4.9★ with 3,900+ ratings |
| Voice input during sessions | Sounds right, fails in wind and with range noise. Test it before you believe it |
| Social / live leaderboards | v1.1. And per Brief §7, never behind the paywall |
| Watch player | v1.3. Get the phone right first |

---

*Prepared by Claude for Brett, AL Performance. All benchmark constants trace to Master Brief §3.1. Every constant marked **[C]** is a placeholder to be replaced with observed values from your own users — that replacement is the highest-value data task of your first six months.*
