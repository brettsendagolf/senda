# Skills Tests and Markers
### First-pass design, built to be corrected from Brett's own scores

**Project:** MGA · **Product:** Senda · **Owner:** Brett, AL Performance
**Version:** 1.0 · **Date:** 5 September 2026
**Reads with:** `Golf-App-Master-Brief.md` §3.6, §6.6, §7 · `Spec-Diagnostic-and-Session-Engine.md` §B7

**Confidence convention:** **[V]** verified from a primary source · **[D]** derived by me, needs validating · **[C]** calibration constant — a placeholder for Brett's real score.

---

## 0. How to use this document

Every number in the threshold table (§5) is a **placeholder**. The intended workflow is:

1. Brett runs all six tests once, properly, over a week or two.
2. Those six scores become the **Marker 5 row** — he plays off 9, and Marker 5 is the 9–17 band.
3. The other six rows derive from that anchor by the spacing rule in §5.2.
4. Everything gets replaced again once real users generate real distributions (§10).

There is a companion tool — `senda-marker-calibrator.html` — where he enters his six scores and it generates the full table, ready to paste back here or export as JSON for the app.

**Do not ship the numbers below as they stand.** They are structurally right and empirically unfounded. That distinction matters and it is stated on every relevant line.

---

## 1. Design principles

**1. Tests are instruments. Markers are identity.**
Test names are plainly descriptive so a user knows what they are about to do. Marker names carry the brand. Do not make the tests cute — a golfer standing on a practice green needs to know what "Three Flags" involves, not admire it.

**2. Nothing is earned by effort.**
No Marker is reachable by practising ten times, logging a streak, or accumulating XP. Every promotion requires a scored performance on a defined test. This is the whole credibility argument against GolfPlan AI's XP ladder and CORE Golf's discipline tracker, and it collapses the moment one Marker can be bought with attendance.

**3. One number per test, direction stated.**
Five of the six are higher-is-better. Par 18 is lower-is-better because that is its identity and flipping it would be worse. The UI must carry direction explicitly — and per the dataviz rules in the brief, a lower-is-better series needs its axis annotated, not just its colour changed.

**4. Facility-agnostic progression.**
A user with only a putting green must still be able to climb. Promotion requires clearing the bar in **any two** tests, not all six (§6).

**5. Honest about norms.**
No published handicap norms exist for any of these. The app presents test results as **personal-best tracking**, and Marker bars are the only normed use. That constraint is also the opportunity the brief identified: your users' scores eventually become the norms nobody else has, and there is no national amateur skills-test battery in England to compete with.

---

## 2. The six tests at a glance

| # | Test | Covers | Facility | Shots | Score | Time |
|---|---|---|---|---|---|---|
| 1 | **Putting Ladder** | Putting — holing and lag | Practice green | 18 putts | **/18, high** | 12 min |
| 2 | **Par 18** | Chipping and greenside | Practice green with varied lies | 9 up-and-downs | **strokes, low** (par 18) | 25 min |
| 3 | **Three Flags** | Wedges, 30–70 yds | Short-game area or range | 15 | **/45, high** | 20 min |
| 4 | **Ten Fairways** | Driving — keeping it in play | Range (Toptracer ideal) | 10 drives | **/20, high** | 15 min |
| 5 | **Iron Ladder** | Iron play | Range | 15 | **/45, high** | 20 min |
| 6 | **The Nine** | All-round | Range **and** green | 27 | **/27, high** | 30 min |

**Free tier:** Putting Ladder and Ten Fairways. One green test, one range test — so every user can run at least one whatever facility they have. The other four are Plus, matching the 2-free / 6-total split in brief §8.3.

---

## 3. The tests in full

### 3.1 Putting Ladder

**Setup.** Practice green. Three stations, six balls each, played as three blocks of six.
- **4 ft** — one putter-length plus a shoe. Six putts.
- **8 ft** — roughly three paces. Six putts.
- **30 ft** — roughly eleven paces. Six putts.
Mark a 3 ft circle round the hole with tees for the long station (one putter length).

**Scoring.** One point per success. Max 18. **Higher is better.**
- 4 ft and 8 ft: point if holed.
- 30 ft: point if the ball finishes **inside the 3 ft circle** (holing also scores one — no bonus, it keeps the arithmetic trivial).

**Why this shape.** All measurable putting skill lives inside 12 feet and is concentrated between 3 and 6 feet **[V]** — outside 24 feet, a 25-handicap and a scratch golfer putt essentially identically. So two of the three stations sit in the money zone, and the long station tests **distance control**, not holing, which is what actually prevents three-putts.

**Starting bars derived from Shot Scope make-percentage data [D]:**

| Handicap | 0 | 5 | 10 | 15 | 20 | 25 |
|---|---|---|---|---|---|---|
| Expected score | 12.0 | 10.7 | 9.9 | 8.9 | 8.1 | 7.1 |

---

### 3.2 Par 18

**Setup.** Practice green with real lies. Nine different spots around it, **5 to 25 yards out**, deliberately varied — tight lie, rough, upslope, downslope, bunker if there is one. One ball from each. **No practice shots, no do-overs, no second balls.** Play each one out until it is holed.

**Scoring.** Total strokes to hole out from all nine spots, capped at 4 per spot. Up-and-down every time = 18. **Lower is better.**

**Reliability warning — read before gating on this.** Par 18 discriminates weakly. Across the entire handicap range from scratch to 25, expected scores span only **22.1 to 24.8** — 2.6 strokes — against a single-attempt standard deviation of about **1.4 strokes** **[D]**. Signal-to-noise of 1.84 is the worst of the six.

But it discriminates well **in the tail**, because the score maps directly onto up-and-down rate:

| Par 18 score | Up-and-down rate required |
|---|---|
| 25 | 22% |
| 24 | 33% |
| 23 | 44% |
| 22 | 56% |
| 21 | 67% |
| 20 | 78% |

A scratch golfer converts 54% **[V]**. So **anything at 22 or better is genuinely above scratch standard**, while the difference between 25 and 24 is noise.

**Design consequence:** use Par 18 as a **participation gate at Markers 1–4** ("complete it", then modest bars) and as a **real gate only from Marker 5 up**. The brief's suggested example — *"Marker 4: pass Par 18 in under 24"* — sits inside the noise band and should not ship as written.

---

### 3.3 Three Flags

**Setup.** Short-game area or a range with visible distance markers. Three targets at **30, 50 and 70 yards**. Five balls to each, played as three blocks of five. If the facility has target greens, use those; otherwise pick a flag or marker and judge against it.

**Scoring.** Points by proximity, per shot. Max 45. **Higher is better.**
- Inside 5 yards — **3 points**
- Inside 10 yards — **2 points**
- Inside 20 yards — **1 point**
- Beyond 20 yards, or duffed, or thinned through — **0**

**Why 30–70 yards.** The 25-to-50-yard pitch is the steepest gradient in the entire short game: conversion runs **9% at 25-handicap to 32% at scratch** **[V]**, far steeper than the greenside chip (35% to 63%). It is the shot that separates golfers and almost nobody practises it deliberately.

**Starting bars: [C] — no data exists.** My rough placeholders are 15/45 at 25-handicap and 30/45 at scratch, and they are guesses. This is the test most in need of Brett's own score.

---

### 3.4 Ten Fairways

**Setup.** Range. Define a corridor roughly **30 yards wide** at driving distance — two aiming markers, two flags, or a Toptracer fairway. Ten drives, driver only.

**Scoring.** Max 20. **Higher is better.**
- Finishes in the corridor — **2 points**
- Misses the corridor but would be playable — **1 point**
- Would be lost, out of bounds, or in a hazard — **0 points**

**Why scored this way, and this matters.** Fairways hit is worthless as a measure — it is flat at 46–50% from scratch to 25-handicap **[V]**. What actually separates golfers off the tee is **disasters**: penalty shots run 0.56 to 4.67 per round, an eightfold range. This test scores the thing that matters and ignores the thing that doesn't, which makes it consistent with how the diagnostic engine already treats off-the-tee (Spec A §A5.1).

Say this to the user in the test intro, in one line: *"Your score isn't how many fairways you hit. It's how many balls you kept in play."*

**Starting bars [D]:**

| Handicap | 0 | 5 | 10 | 15 | 20 | 25 |
|---|---|---|---|---|---|---|
| Expected score | 15.1 | 14.5 | 13.4 | 12.0 | 10.9 | 9.7 |

**Facility note.** Without Toptracer this test is eyeballed and therefore soft. Offer a **Toptracer mode** with the corridor auto-measured, and flag ordinary-range results as lower-confidence in the record. Don't pretend the two are equivalent.

---

### 3.5 Iron Ladder

**Setup.** Range. Three clubs, not three distances — a beginner cannot hit 180 yards and shouldn't be asked to.
- **Your pitching wedge**
- **Your 7-iron**
- **The longest iron or hybrid you would actually hit into a green**
Five balls each, played as three blocks of five, to a target at roughly that club's full distance.

**Scoring.** Points by proximity. Max 45. **Higher is better.**
- Inside 10 yards — **3 points**
- Inside 20 yards — **2 points**
- Inside 30 yards — **1 point**
- Beyond, or a genuine mis-hit — **0**

**Anchor.** TrackMan Combine data puts an 18-handicap at **27.5 yards average proximity from 180 yards** and an overall Combine score of 46.7 against a Tour average of 81.7 **[V]**. That 27.5-yard figure is why the scoring bands go out to 30 yards rather than stopping at 15 — a band nobody can reach measures nothing.

**Starting bars: [C].** Roughly 13/45 at 25-handicap and 32/45 at scratch. Guesses.

---

### 3.6 The Nine

**Setup.** Range **and** practice green — this one needs a proper facility and it is the flagship. Nine simulated holes, three shots each, 27 shots total.

For each "hole":
1. **Tee shot** — driver into the Ten Fairways corridor
2. **Approach** — the club you would genuinely have left, to a target
3. **Short shot** — one up-and-down attempt from beside the green, or, if the approach finished within 20 yards of target, one **8 ft putt**

**Scoring.** One point per shot that succeeds. Max 27. **Higher is better.**
- Tee shot in the corridor — 1 point. A lost or OB tee shot **scores the whole hole zero** and you move on.
- Approach within 20 yards of target — 1 point
- Up-and-down converted, or 8 ft putt holed — 1 point

**Why it exists.** The other five tests are isolated skills. This is the only one that tests **sequencing and consequence** — a wiped tee shot costs you the hole, exactly as it does on the course. It is also the closest thing in the set to a course-transfer measure, and the brief is explicit that practice-to-course transfer has never been demonstrated in a controlled golf study **[V]**, so this is the one to watch as a leading indicator once you have data.

**Starting bars: [C].** Roughly 7/27 at 25-handicap and 19/27 at scratch. Guesses.

---

## 4. Reliability — and why promotion needs two clears

Every one of these tests is noisy on a single run. Expected spreads and single-attempt standard deviations **[D]**:

| Test | Spread across handicaps | Single-run SD | Signal / noise |
|---|---|---|---|
| Putting Ladder | 4.9 pts | 2.06 | 2.36 |
| Ten Fairways | 5.4 pts | ~2.3 | 2.35 |
| **Par 18** | **2.6 strokes** | **1.42** | **1.84 — weak** |

None of these supports a one-shot pass. So the rule is:

> **A Marker bar must be cleared twice in the last five attempts of that test.**

Not "best of five" — that just hands out promotions to anyone persistent. Two clears out of five behaves like this **[D]**:

| A player whose true ability is… | Promotes on a single attempt | Promotes under "twice in last 5" |
|---|---|---|
| 1.0 SD **below** the bar | 15.9% | 18.1% |
| 0.5 SD below the bar | 30.9% | 48.9% |
| **Exactly at the bar** | **50.0%** | **81.2%** |
| 0.5 SD above the bar | 69.1% | 96.6% |
| 1.0 SD above the bar | 84.1% | 99.7% |

The trade is deliberate. False promotions rise barely at all (15.9% → 18.1%), while a player who genuinely deserves the Marker goes from a coin flip to 81%. **False negatives are the expensive error here** — a golfer who earns a Marker and doesn't get it stops taking tests, and the whole progression system dies with it. A false promotion just means the next Marker takes longer.

---

## 5. The seven Markers

### 5.1 Names, bands, and who sits where

| # | Name | Spanish | Roughly who is here | Feel |
|---|---|---|---|---|
| **1** | **Setting Out** | *Primer Paso* | No handicap. First one or two sessions | Reachable on day one. Must be |
| **2** | **Finding Your Feet** | *Paso Firme* | 36–54, or new and improving | A few weeks of honest practice |
| **3** | **Making Ground** | *Avanzando* | 26–36 | First real milestone |
| **4** | **Steady Going** | *Ritmo Constante* | 17–26 | **Where most users will start and sit.** Average iGolfer is 19.7 |
| **5** | **Climbing** | *Subiendo* | 9–17 | **Brett's band — the calibration anchor** |
| **6** | **High Ground** | *Alta Ruta* | 4–9 | Genuinely good |
| **7** | **Summit** | *Cima* | Under 4 | Should be rare and should feel it |

Handicap bands are **descriptive, not gates.** A 9-handicap who has never taken a test starts at Marker 1 and climbs quickly — which is fine, and is a good first-week experience.

*Cima* at the top is a small piece of housekeeping: it was the runner-up brand name, and retiring it into the product as the summit tier means it never gets accidentally reused.

### 5.2 The spacing rule

Given Brett's score **B** on a test (= the Marker 5 bar) and a beginner floor **F** (= the Marker 1 bar):

```
step_low  = (B − F) / 4
M1 = F
M2 = F + step_low
M3 = F + 2 × step_low
M4 = F + 3 × step_low
M5 = B                          ← the anchor

step_high = step_low × 1.35     ← bars get harder near the top
M6 = B + step_high
M7 = B + 2 × step_high          ← capped at (max − 1)
```

For **Par 18** the arithmetic runs the other way, and M7 is floored at **19** — a 19 requires an 89% up-and-down rate, which is already beyond tour standard, and a bar of 18 would mean "hole out or up-and-down every single time", which is not a bar, it is a lottery.

The **1.35 multiplier** is the one judgement call. It says each step near the top is about a third harder to win than each step near the bottom, which matches how skill acquisition actually behaves and stops Marker 7 being reachable by a decent mid-handicapper on a good day. **[C] — tune it.**

### 5.3 The threshold table — placeholders

Derived from the spacing rule using my estimated values, with Brett's 9-handicap sitting at Marker 5. **Every number here is a placeholder to be overwritten.** [C]

| Test | Dir | M1 | M2 | M3 | M4 | **M5** | M6 | M7 |
|---|---|---|---|---|---|---|---|---|
| **Putting Ladder** /18 | high | 3 | 5 | 7 | 8 | **10** | 12 | 15 |
| **Par 18** strokes | low | 30 | 28 | 27 | 25 | **23** | 21 | 19 |
| **Three Flags** /45 | high | 5 | 9 | 14 | 18 | **22** | 28 | 33 |
| **Ten Fairways** /20 | high | 4 | 6 | 8 | 10 | **12** | 15 | 17 |
| **Iron Ladder** /45 | high | 4 | 9 | 13 | 18 | **22** | 28 | 34 |
| **The Nine** /27 | high | 2 | 5 | 7 | 10 | **12** | 15 | 19 |

Marker 1 on Par 18 is a participation bar — 30 strokes over nine spots is three shots each, so in practice it means *finish the test*.

Sense checks on the two ends, which are the ones Brett specifically asked about:

- **Marker 1 is trivially reachable.** Putting Ladder 3/18 means holing three of twelve short putts, or leaving three of six long ones close. Ten Fairways 4/20 means four playable drives out of ten. A genuine beginner clears one of those in their first or second session, which is the requirement.
- **Marker 7 is genuinely hard.** Putting Ladder 15/18 is above the scratch expectation of 12.0. Par 18 at 19 needs 89% up-and-down. The Nine at 19/27 means seven shots in ten executed, under a format where one wiped drive costs three points. None of that is reachable by a good mid-handicapper having a nice afternoon.

---

## 6. Promotion rules

1. **Clear the bar in any two of the six tests** for that Marker, each on the "twice in last five attempts" basis (§4). Any two — the user picks, and facility access never blocks progression.
2. **Markers 6 and 7 require any three**, and **one of them must be The Nine.** At the top of the ladder, isolated skill is not enough; the all-round test has to be one of them.
3. **You cannot skip a Marker.** Clearing a Marker 6 bar while sitting at Marker 3 promotes you to Marker 4. Progression is one rung at a time and each one gets its own moment.
4. **Markers never go down.** Not on a bad run, not on inactivity, not ever. A demotion mechanic is a churn machine, and there is no version of "we've taken your Marker away" that a user forgives.
5. **Promotion is a moment, not a toast.** Full screen, the Signal lime sweep from brief §5.6, the new Marker name, and one line on what the next one needs. This is the highest-emotion point in the product and it is also paywall trigger C.

---

## 7. Markers and session difficulty — related, not the same

Spec B §B7 has a session difficulty level of 1–7. So do Markers. **Keep them separate but coupled**, because they answer different questions:

| | Marker | Session difficulty |
|---|---|---|
| Answers | "How good am I?" | "How hard should today be?" |
| Moves by | Passing a test | Automatically, toward a 70% success rate |
| Direction | Up only | Up **and** down |
| Visible as | Identity — named, shareable | A quiet setting |

**How they connect:**
- A new user's session difficulty **seeds** at their Marker.
- After that they drift apart, and **the gap is a signal.** When session difficulty has run at or above `Marker + 1` for three consecutive sessions, the app prompts: *"Your sessions have been running above your Marker. Take the Putting Ladder — you might have moved up."*

That gives you a natural, earned, non-nagging reason to prompt a test, instead of a calendar reminder that says "it's been a month."

---

## 8. When tests are prompted

| Trigger | Prompt |
|---|---|
| 28 days since the last test in the user's **weakest area** | Standard monthly checkpoint |
| Session difficulty ≥ Marker + 1 for 3 sessions | The promotion nudge in §7 |
| One bar away from a Marker on a test already attempted | *"You're two points off Making Ground."* |
| Onboarding, day 7 | First test — always the **free** one their facility supports |

Never prompt more than one test per week, and never during a session.

---

## 9. Data model

```ts
type TestId = 'putting_ladder' | 'par18' | 'three_flags'
            | 'ten_fairways' | 'iron_ladder' | 'the_nine';

interface TestResult {
  id: string;
  userId: string;
  testId: TestId;
  takenAt: string;
  score: number;
  stationScores?: number[];        // per block, drives the summary copy
  facility: 'green' | 'range' | 'short_game' | 'sim' | 'toptracer';
  confidence: 'measured' | 'eyeballed';   // Ten Fairways without Toptracer
  markerAtTime: number;
  clearedBarFor?: number;          // which Marker this result clears, if any
  isPersonalBest: boolean;
}

interface MarkerState {
  userId: string;
  marker: 1|2|3|4|5|6|7;
  achievedAt: string;
  clearsTowardNext: Array<{ testId: TestId; clears: number; ofLast: number }>;
  nextMarkerNeeds: string;         // human-readable, shown on Progress
}
```

**Test results feed two things beyond the Marker ladder:**
1. **The Game Profile** (Spec A). A test result is direct evidence for one area and should update that area's residual — with more weight than a logged round, because it is a controlled measurement rather than a recollection. Suggest `roundWeight × 2` for the area it covers. **[C]**
2. **Difficulty calibration** (Spec B §B7.3). A Three Flags or Iron Ladder score is the cleanest read you will get on whether the proximity bands in the difficulty ladder are set correctly.

---

## 10. Calibration plan

**Phase 1 — this month, Brett.** Run all six. Enter the scores in `senda-marker-calibrator.html`. That fixes the Marker 5 row and generates the rest. Total time on the range and green: about two hours.

**Phase 2 — beta, N ≈ 30–50 users.** Ask each to run the two free tests plus state their handicap. Sanity-check that the bands aren't obviously wrong — the specific failure to watch for is everyone clustering at one Marker, which means the spacing is off, not the users.

**Phase 3 — N ≥ 500 results per test.** Refit properly. Two options, and I would take the first:
- **Handicap-anchored:** regress test score on handicap index, set each Marker bar at the expected score for the top of its band. Keeps the ladder meaning something absolute.
- **Population-anchored:** set bars so each Marker holds a target share of users. Feels fairer, but it means the bar moves under people, which is exactly the kind of thing that gets noticed and resented.

**Phase 3 is also the marketing asset.** There is no national amateur skills-test battery in England — county-level only **[V]**. A published, properly normed six-test battery with real handicap scaling is genuinely novel, it is the sort of thing golf media covers, and nobody else is positioned to produce it.

---

## 11. Open questions for you

1. **Is 30 yards the right corridor width for Ten Fairways?** It is the one dimension I have no anchor for, and it drives the whole test's discrimination. Your view as a 9-handicap who has stood on a lot of ranges is worth more than my arithmetic.
2. **Does The Nine work in practice, or is it too fiddly?** It is the most valuable test conceptually and the most likely to annoy someone in a bay with a queue behind them. Worth running first, before the others.
3. **Do the 35 drills you've already written have scoring schemes that should feed these?** If any drill already scores out of a fixed number, the test should reuse that scale rather than inventing a parallel one — send them over and I'll align the two.
4. **Should Three Flags use 30/50/70 or shorter?** For a 25-handicap, 70 yards may be past useful. An alternative is scaling the three distances to the user's own wedge distances, the way Iron Ladder scales to their clubs.

