# Golf Practice App — Master Brief
### Research, evidence base and design specification
**Project:** MGA · **Owner:** Brett, AL Performance · **Version:** 1.2 · **Date:** 15 August 2026

---

## 0. How to use this document

This is a **self-contained handover file**. It is written so it can be pasted into a fresh conversation, sent to a developer or designer, or used as project context without needing anything else. Everything material from the research and design work is here.

Companion files: `golf-app-prototype.html` and `Spec-Diagnostic-and-Session-Engine.md` — a clickable prototype of every screen described in §6, plus a live colour and type reference.

**Confidence convention used throughout:** claims are marked **[V]** verified from a primary or strong secondary source, **[D]** derived by me from verified data (needs validating), or **[U]** unverified / could not confirm. Please respect these markers — several widely-circulated "facts" in this category turned out to be fabricated (see §10.1).

---

## 1. Decisions, and what is still open

### 1.1 Settled

| Area | Decision |
|---|---|
| **Core loop** | Structured practice plans. Diagnose → prescribe a session → score it → adapt the next one. |
| **Audience** | Complete beginners *and* handicap improvers. Both, deliberately — the beginner segment is the open one. |
| **Market** | UK first (WHS / England Golf), global thereafter. |
| **Brand strategy** | **One brand worldwide.** See §4.1 for the reasoning. |
| **Monetisation** | Balanced freemium. Free at point of use, paid for depth. |
| **Pricing** | £7.99/month or £49.99/year, annual pushed hard. |
| **Colour system** | "Links" — see §5. Validated for contrast and colour blindness. |
| **Navigation** | Four tabs: Today · Practice · Progress · Learn. |

### 1.2 Open — needs your decision

| # | Decision | Options | My recommendation |
|---|---|---|---|
| 1 | **The name** | Senda · Cima · Cairn (UK/US only) | **Senda** — see §4.3 |
| 2 | Trade mark clearance | Which jurisdictions to clear first | UK + EU + US, classes 9 and 41, before any brand spend |
| 3 | Day-0 trial offer | Trigger paywall at session 3 only, or also offer a trial on day 0 | Ship session-3 only; A/B a day-0 *trial* (never a wall) once you have volume |

---

## 2. Market research

*All prices verified from GB App Store listings or official vendor pages, August 2026. Where a range is shown, that is Apple listing multiple live SKUs, not a tier structure.*

### 2.1 The competitive headline

**Hole19 now owns your category.** [V] On 15 December 2025 Hole19 launched an "Intelligence" tier bundling **CORE Golf** — a purpose-built practice app with 100+ drills and 15+ plans that auto-build from your weaknesses. CORE Golf and Hole19 are the same company (Stat Track Technologies, Portugal). Hole19 has **5m+ Play Store installs** and claims 4.8m+ golfers.

You cannot beat that on distribution. The three places you can beat it:

1. **Who they serve.** CORE Golf's own store copy targets **10–20 handicaps**. Beginners and 25+ handicaps are explicitly not their user.
2. **Where they serve them.** Hole19 is a course app with a practice bolt-on. There is no consumer-scale app that owns the *range*.
3. **Which country they understand.** No practice app in this survey integrates WHS, England Golf or iGolf.

### 2.2 Practice-plan apps — the direct competitive set

| App | What it does | Free tier | Price (GB) | Traction |
|---|---|---|---|---|
| **CORE Golf** (Hole19) | Auto-builds plans from weaknesses; 100+ drills; 15+ programmes; "discipline tracker" | First drill in each skill group | **£9.99/mo, £26.49/yr**, 7-day trial | 4.7★, 24 GB ratings standalone — but now bundled into Hole19 |
| **Break X Golf** | Ranks your game by strokes gained, builds plan to your time + facilities; 130+ skills games; imports Arccos/Shot Scope | None (7-day trial) | **$19/mo, $179/yr** | Golf Insider UK's top practice pick |
| **GolfPlan AI** | Weekly AI plans; XP, badges, 7-tier ladder (36+ hcp → scratch) | **1 plan/month + handicap tracking + badges** | **$12.99/mo** | Web only, no App Store presence |
| **The Golf Practice** | Plans by player/goal/facility; SG in practice and on course; competitive pressure games | No | **$10/mo, $99/yr** | Members from pros to 30+ handicaps |
| My Golf: Practice, Play & Plan | Shot tracking + practice library + SG | Freemium | £9.99/mo, £99.99/yr | Not enough ratings to display |
| Practice Coach Golf | "Motor learning science", adjusts to performance and time | 1-week trial | £49.00 | No ratings; last updated May 2025, possibly stalled |
| RangeGame | Range shot tracking, 36-week fitness programme, group chat | Freemium | $3.99–$14.99/mo | 5.0★, 9 ratings |
| Better At Golf | Randomised short-game shots at the range | Freemium | £9.99/mo, £99.99/yr | Not enough ratings |
| Up + Down Golf | Apple Watch short game, 9-shot sessions, **streaks**. "No subscription." | — | £4.99 one-time | Launched Nov 2025 |

**Read-across:** every direct competitor except CORE Golf is sub-scale — single-digit to low-double-digit rating counts. The category is crowded with attempts and has no consumer-scale winner other than the one Hole19 just absorbed.

### 2.3 Video instruction (adjacent — content, not prescription)

| App | Price | Note |
|---|---|---|
| **Me and My Golf** | GB IAP **£24.99/mo, £209/yr**; site Core $299/yr, VIP $499/yr | 4.2★, only 13 GB ratings. VIP includes free Arccos sensors |
| **Scratch Golf Academy** | **$24.99/mo, $199.99/yr** (list $49.99 / $499) | Heavy discounting off list — a signal list price doesn't convert |
| Golfshot Golfplan | Solo $49.99/yr, Pro Bundle $99.99/yr | 400+ videos |
| Golf Coach by Dr Noel Rousseau | **Now free** (was $10) | PhD motor learning. Won UK & US App Design Awards |

### 2.4 Stats / handicap trackers

| App | Free tier | Price | Scale |
|---|---|---|---|
| **Arccos** | None — sensors required | **$12.99/mo billed annually at $155.88**; sensors £26.99–£114.99 | 4.5★, 5,200 GB ratings. **Trustpilot 1.9/5** |
| **Shot Scope** | **App and dashboard 100% free** — "No Subscription Fees" is the headline | Hardware only | 100+ stats including strokes gained |
| **18Birdies** | GPS, scorecard, handicap, 9 side games, social feed | £6.99/wk; £9.49–£19.99/mo; £64.99–£105.99/yr | 4.9★, 15,000 GB ratings. Claims 10m users |
| **Hole19** | GPS, scorecard, course previews, social — 42,000+ courses | Premium Pro **£9.99–£12.99/mo, £59.99–£69.99/yr**; **Intelligence £99.99/yr** (includes CORE Golf) | 4.8★, 13,000 GB ratings; 5m+ Play installs |
| Golfshot | GPS, shot tracking, 3D previews | £4.99–£14.99/mo; £49.99–£69.99/yr | 4.7★, 25,000 GB ratings |
| **Clippd** (UK) | Freemium | **£19.99/mo, £191.99/yr** | **3.5★, 8 ratings** — the price-ceiling warning |
| **MyEG** (England Golf, official WHS) | **Free, no IAPs at all** | Free; iGolf £47/yr for the index | **2.4★ from 931 ratings** |

### 2.5 Engagement mechanics in use — and the gap

| Mechanic | Who uses it | Gap |
|---|---|---|
| Streaks | Only **Up + Down Golf** and CORE Golf's "discipline tracker" | **Wide open.** Streaks are the standard retention primitive everywhere else and are barely used in golf |
| XP / levels | Only **GolfPlan AI** (7-tier ladder, web only) | Open on mobile |
| Badges | GolfPlan AI, in the **free** tier deliberately | Model worth copying |
| Skills games as drills | Break X (130+), Better At Golf, The Golf Practice | Strongest pattern in the category |
| Leaderboards | 18Birdies, TheGrint, Hole19 | **18Birdies paywalled theirs and users revolted** — see §8.4 |
| Coach messaging | Skillest (4.9★, 3,900+ ratings — highest-traction coaching app found) | Not your v1 |

### 2.6 Market size and benchmarks

**UK / England Golf** [V]
- **750,071** England Golf club members in 2025, up 2.66% YoY; 100,000+ new members since 2021
- Junior membership **+34%** (46,028 → 61,483)
- **iGolf: 72,921 users, +34%.** At £47/yr that is ~**£3.4m/year** of revenue for what is essentially handicap admin plus insurance
- Of iGolfers: **87% submit scores, 75% establish an active index. Average handicap 19.7, average age 42**
- **5.75m scores submitted in England in H1 2025, +29% YoY**; April 2025 alone +98% vs April 2024
- H1 2026 rounds down 9% vs record 2025, but above every other year this decade

**Global participation** [V]
- **108 million golfers** across R&A markets in 2024; 43.3m playing 9/18-hole on-course; 8.4m registered club members
- **"80% of young people engage with the sport through formats that are not 9 or 18-hole on-course golf"** — driving ranges, simulators, adventure golf
- GB&I: 5.3m on-course adult golfers, but **3.5m+ people used a driving range in Great Britain**
- USGA 2024: **94.5% of rounds posted were recreational**; only ~25% of golfers posted any competitive score. 9-hole scores +40% since 2020. **Women new to golf played 9-hole rounds more than half the time**

> **The single most important market fact: 3.5m+ GB range users vs 750k club members.** Design for the range.

**Subscription benchmarks (health & fitness)** [V]
- Download → trial: 6.2% median, 20.3% at P90
- Trial → paid: 45.7% median (39.9% in health & fitness)
- **Day 35 download → paid: 2.18% freemium vs 12.11% hard paywall**
- 12-month subscriber retention: **annual 44.1%, monthly 17.0%, weekly 3.4%**
- **82–86% of trial starts happen on the day of install**
- **Annual plans = 61% of health & fitness category revenue** (up from 51% in 2023)
- Annual-with-trial LTV ≈ $70 vs ≈ $17 for low-priced plans — a 4× differential
- Category median price: **$9.70/month, $39.99/year**. **UK price index 1.3×** vs emerging markets

---

## 3. Evidence base — what the data actually says

This section is the intellectual core of the product. It is also where the category is most dishonest, so the flags matter.

### 3.1 Where amateurs actually lose shots

**The peer-reviewed number** [V] — Broadie 2012, *Interfaces* 42(2):146–165. On the PGA Tour, the long game accounts for **≈72% of the variance in total strokes gained**; short game 11%; putting 17%. Broadie's own words: *"The long game explains about two-thirds of scoring."*

**Shot Scope benchmark table** [V] — from a 90M+ shot database. **This is the single most useful artefact in the research and I would build the v1 diagnostic engine directly on it.**

| Handicap | Score to par | Fairways | **GIR** | Up&Down | Putts/rd | **Penalties/rd** |
|---|---|---|---|---|---|---|
| 0 | +0.83 | 50% | **61%** | 47% | 29.4 | **0.56** |
| 5 | +6.33 | 48% | **44%** | 41% | 30.2 | **0.91** |
| 10 | +10.88 | 49% | **36%** | 31% | 31.2 | **1.62** |
| 15 | +17.38 | 48% | **24%** | 21% | 33.1 | **2.45** |
| 20 | +21.69 | 46% | **17%** | 20% | 33.1 | **3.03** |
| 25 | +28.97 | 46% | **10%** | 18% | 33.8 | **4.67** |

Read the columns carefully — three of them overturn conventional wisdom:

- **Fairways hit is nearly flat (46–50% across the entire range).** A 25-handicap hits fairways at almost the same rate as a scratch golfer. **Fairways hit is worthless as a diagnostic** — it is a binary that ignores how badly you missed.
- **Penalties are the hidden high-handicap killer: 0.56 → 4.67, an 8× range.** A 25-handicap loses ~4 shots a round to penalties before any skill question arises. Almost nobody tells them this.
- **Putts per round only moves 29.4 → 33.8 across 25 handicap strokes** — and it is confounded, because high handicaps chip on and putt from closer. **Use putts-per-GIR and three-putt rate instead**, or you reinforce the very myth the app exists to break.

**Short game by handicap** [V] — Shot Scope

| Handicap | Up&Down | Sand save | <25yd U&D | **25–50yd U&D** | Proximity | Shots to finish |
|---|---|---|---|---|---|---|
| 25 | 25% | 10% | 35% | **9%** | 22 ft | 3.01 |
| 20 | 31% | 15% | 41% | **14%** | 20 ft | 2.86 |
| 15 | 34% | 18% | 43% | **16%** | 18 ft | 2.78 |
| 10 | 39% | 20% | 47% | **20%** | 15 ft | 2.68 |
| 5 | 47% | 23% | 56% | **25%** | 14 ft | 2.55 |
| 0 | 54% | 37% | 63% | **32%** | 11 ft | 2.45 |

The 25–50 yard column runs 9% → 32% — the steepest gradient in the short game. **The awkward-length pitch separates golfers far more than the greenside chip does.**

**Putting make % by handicap and distance** [V] — Shot Scope

| Distance | 0 | 5 | 10 | 15 | 20 | 25 |
|---|---|---|---|---|---|---|
| 0–3 ft | 98% | 96% | 96% | 93% | 90% | 88% |
| **3–6 ft** | **76%** | 67% | 65% | 59% | 55% | **48%** |
| 6–9 ft | 49% | 44% | 39% | 36% | 33% | 30% |
| 9–12 ft | 34% | 34% | 26% | 22% | 18% | 17% |
| 12–18 ft | 19% | 19% | 18% | 16% | 14% | 12% |
| 18–24 ft | 12% | 13% | 10% | 9% | 7% | 6% |
| 24–30 ft | 7% | 7% | 7% | 7% | 5% | 4% |
| 30 ft+ | 4% | 3% | 3% | 2% | 2% | 2% |

**Outside 24 feet every handicap band putts essentially identically.** All putting skill lives inside 12 feet, concentrated in 3–6 ft. Directly actionable: a putting module should spend nearly all its time inside 12 ft, and lag putting should be framed as *distance control to leave a makeable second*, not as holing.

**Costliest shots** [V] — Shot Scope via MyGolfSpy, Oct 2025

*Per shot:* approach from 176–200 yards. SG/shot: 25 hcp −0.40 · 20 −0.34 · 15 −0.29 · 10 −0.21 · 5 −0.12.
*Per round:* tee shots on holes 351+ yards. SG/round: 25 hcp −2.94 · 20 −2.62 · 15 −2.10 · 10 −1.49 · 5 −0.81.

Long tee shots cost most **per round** because of frequency; long approaches cost most **per swing**.

### 3.2 The most important caveat in the whole document

[V] Lou Stagner / Arccos: the spread *within* a handicap band exceeds the difference *between* bands. At a 20 index, the gap between the best and worst decile of putters is **7.61 shots per round**. At scratch it is 4.28 on putting and 3.14 on driving.

**Never tell a user "you're a 20, so work on approach."** Population priors are a starting hypothesis with a stated confidence level, not a diagnosis. This is both scientifically correct and — handled well — a retention mechanic, because it gives the user a reason to keep logging.

### 3.3 Minimum viable data set for diagnosis without hardware

You cannot compute true strokes gained without shot-level distance-and-lie data. You **can** build a defensible relative-weakness ranking by percentile-ranking basic stats against handicap-matched benchmarks. For prescribing practice that is enough — you need "approach is your worst area", not "you lost 2.3 strokes on approach".

**Tier 1 — essential (5 inputs, ~30 seconds):** score · GIR · **penalties + lost balls** · putts · up-and-downs made/attempted
**Tier 2 — high value, low cost:** fairways hit (only useful alongside penalties) · three-putt count
**Tier 3 — optional deep dive:** tee-shot miss direction (4 taps) · approach distance bucket for missed greens

Ship Tier 1 + Tier 2 as default. Offer Tier 3 on roughly one round in five.

**Three traps to engineer around:**
1. Putts per round is confounded by GIR → use **putts per GIR** and three-putt rate
2. Up-and-down % is confounded by *where* you missed → segment <25 yd vs 25–50 yd where you have the data
3. Fairways hit is a near-useless binary → replace with **penalties + lost balls** as the primary off-the-tee metric

**Suggested v1 algorithm** [D] — *my synthesis, not a published method; validate before relying on it*
1. Interpolate expected values for each stat from the Shot Scope table by handicap
2. Compute a residual per category: off-the-tee = f(penalties, fairways); approach = f(GIR); short game = f(up&down %, adjusted for GIR); putting = f(putts per GIR, three-putts)
3. Rank residuals; worst = practice priority
4. Convert to shots using observed gradients (5 handicap strokes ≈ 7–8 GIR points ≈ 0.6–1.2 penalty shots)
5. **Show a confidence band; require a minimum of 5 rounds** before presenting it as a diagnosis

**Benchmark against handicap peers, not Tour.** [V] Shot Scope moved their own baselines from Tour to amateur handicap bands for exactly this reason. Benchmarking a 20-handicap against the PGA Tour just produces a wall of red.

**Precedent that hardware-free SG is commercially viable:** 18Birdies computes eight SG categories from phone/watch tracking with "confirm your score and a few quick details" per hole. They do not publish their baselines.

### 3.4 Practice science — what to build the session engine on

| Source | Finding | Strength |
|---|---|---|
| **Barzyk & Gruber (2024)**, *Frontiers in Sports and Active Living* 6:1324615 — systematic review of **52 golf RCTs** | **External focus of attention** (target/club, not body) is the most consistent finding in the entire review | Strongest |
| **Porter & Magill** | **Blocked → random progression beat both pure blocked and pure random on retention** | Strong |
| **Shea & Morgan (1979)**, *J Exp Psych* 5(2):179–187 | Origin of the contextual interference effect: blocked practice looks better *during* practice; random practice produces better retention and transfer | Foundational |
| **Guadagnoli & Lee (2004)**, Challenge Point Framework; **Guadagnoli & Bertram (2014)**, *Int J Golf Science* 2:119–127 | Optimal challenge is task- and learner-specific and must escalate. Authors recommend tuning club, ball quantity and rest to hold **≈70% success** | Strong, golf-specific |
| **Guadagnoli, Holcomb & Weber (1999)** | **Novices benefit from blocked; experienced players from random** | Critical moderator |
| **Butki & Hoffman** | 50–100% feedback deprivation beat continuous feedback on retention | Moderate |
| **Jalalvand et al.** | Learner control over *both* difficulty and feedback timing beat every other condition | Moderate |
| **Perkins-Ceccato et al.** | High-skill players benefit from external focus; low-skill benefited from internal | Moderator — even the strongest finding is conditional |

**The seven design principles, ranked by evidence strength:**
1. **Cue externally, always.** "Start the ball over the left edge of the flag," never "rotate your hips." Cheap to implement — it is copywriting.
2. **Sequence blocked → random within a session.** A session structure, not a philosophy.
3. **Target ~70% success and auto-escalate.**
4. **Give the user control over difficulty and feedback.** Better learning *and* better UX.
5. **Don't give feedback on every rep.**
6. **Errorless progressions for beginners** (short → long); randomise only once competent.
7. **Score every session.** Scoring supplies the specific goal + feedback that deliberate practice requires.

**The coaching gap — your wedge** [V]: Grecic & Ryan (2018) evaluated **69 golf coaches, all with 10+ years' experience**, on their knowledge of blocked and random practice. Understanding was surface-level — *"block is repetition and random is game like."* **75% failed to say whether one approach was superior.** If experienced professional coaches don't operationalise this literature, an app that does is offering something a lesson genuinely doesn't.

### 3.5 Honesty check — do not overclaim

- [V] **Macnamara et al. (2014)**, *Psychological Science* 25(8):1608–1618 — meta-analysis, 88 studies, 11,135 participants. Deliberate practice explains **18% of performance variance in sport** (12% overall). The authors' conclusion: *"deliberate practice is important, but not as important as has been argued."*
- [V] **Yin et al. (2024)**, *Scientific Reports* 14 — 54 studies, 2,068 participants. High contextual interference shows a medium retention benefit, but it is **"almost negligible" in applied/field settings** and negligible in young participants. Only 3 of 59 studies rated strong or moderate quality.
- [U] **"Range practice doesn't transfer to the course."** Theoretically well-grounded, but **no controlled golf study demonstrates it.** Barzyk & Gruber explicitly confirm no study examined practice-to-course transfer. Everything asserting it online is theory-informed opinion.
- Over half of the 52 golf RCTs were underpowered; most studied simple putting tasks in novices.

**The defensible claim:** *practice quality is the largest single lever you personally control, and here is what your data says to work on.*
**Not:** "science-backed method proven to transfer to the course."

In a category where a fabricated data table currently dominates search results for its most important question (§10.1), **calibrated honesty is a genuine and rare differentiator** — and it keeps refund requests low.

### 3.6 Skills tests and benchmarks

| Test | Protocol | Handicap scaling | Status |
|---|---|---|---|
| **TrackMan Combine** | 60 shots: 6 each to 9 targets at 60–180 yds, plus 6 drives. Scored 0–100 | **PGA Tour avg 81.7; 18-handicap 46.7.** 18-hcp's worst distance is 180 yds (27.5 yd proximity) | [V] but requires TrackMan — emulate at lower fidelity |
| **Par 18 short game** | 9 different locations round the green, one ball each, no do-overs. Up-and-down = par 2. Par 18 | **None published** | [U] scaling. My derivation below is [D] |
| **25-foot lag test** | 10 putts from 25 ft, measure average distance remaining | ≤2 ft = scratch · 2–3 ft = low 80s · 3–4 ft+ = 90s | [V-medium] — Stuart Leong, 2015 Australian PGA Teacher of the Year. No published validation |

**Derived Par 18 scale** [D] — expected score ≈ 27 − (9 × up&down%), using the verified Shot Scope rates:

| Handicap | 25 | 20 | 15 | 10 | 5 | 0 |
|---|---|---|---|---|---|---|
| Expected Par 18 | ~24.8 | ~24.2 | ~23.9 | ~23.5 | ~22.8 | ~22.1 |

**This is unvalidated.** It assumes all-2-or-3 outcomes and that test conditions match on-course difficulty. Present Par 18 results as personal-best tracking until you have your own data to norm against. Deriving real norms from your user base in the first six months would be genuinely novel and a strong marketing asset.

**Does not exist / not recommended:** a "Golf Distillery skills test" [U — not found]; the "9-shot test" as a scored benchmark [U — it is Tiger's shot-shaping drill, no norms, too advanced]; any **England Golf national amateur skills-test battery** [V — does not exist; county-level only. **Gap in the market.**]

### 3.7 The beginner journey

**The barrier is procedural, not technical.** Every source points at the same wall: *assumption of knowledge*.

Verified barriers, from Golf Monthly's analysis and UK forums:
1. **The range → course transition is the drop-off point.** New players *"find the transition intimidating and isolating."* **This is precisely your opportunity.**
2. **Time.** Golf "requires an entire day"; modern participants want 60–90 minutes. Has produced the *"car park golfer"*.
3. **"Assumption of knowledge."** Members expect newcomers to instinctively understand competition procedures, tee-booking and behavioural norms. *"small behaviours make newer members feel uncomfortable, judged or as though they do not quite belong."*
4. Gender-restricted tee times.
5. Resistance to modernisation.

Real quotes [V]:
> *"turning up to a cours as a new player I'll look out of place and annoy members as a 'clueless hacker' getting in the way?"*
> *"as a beginner would it be considered bad etiquette if after I've had some lessons to apply for membership?"*
> *"I don't know what 'colt' means"*
> *"Do not compare yourself to the guys on TV to judge if you are good enough, that nearly stopped me from entering comps when I was new"*

**The systematic content gap:** the best beginner FAQ articles cover equipment, etiquette, rules and logistics — and explicitly do **not** address *anxiety about performance embarrassment*. Everyone writes the technical FAQ. Nobody addresses the fear.

### 3.8 WHS and getting a handicap in England

**Currency** [V]: the **2024 Rules of Handicapping remain current in 2026**. WHS runs a four-year revision cycle; next revision expected 2028.

**Calculation:**
```
Score Differential = (113 / Slope Rating) × (Adjusted Gross Score − Course Rating − PCC)
Handicap Index     = average of the best 8 of the last 20 Score Differentials
Course Handicap    = (Index × Slope / 113) + (Course Rating − Par)
```
The `(Course Rating − Par)` term is **new in 2024** and is a common source of user confusion — worth an in-app explainer.

- **Maximum Handicap Index 54.0**, all golfers [V]
- **Soft cap:** increases above the 12-month low are halved beyond 3.0 strokes. **Hard cap:** index cannot rise more than 5.0 above the 12-month low
- **PCC** daily adjustment −1 to +3, applied automatically; made more frequent in 2024
- Maximum hole score for handicap purposes: net double bogey
- **[U] The initial-allocation table for fewer than 20 scores includes adjustments that secondary sources routinely get wrong. Implement from the official Rules of Handicapping appendix, not from a blog.**

**2024 changes that help beginners** [V]:
- **Non-standard hole counts accepted** (UK&I, April 2024): 11, 13, 15, or any number 9–18, scaled via Expected Score
- **Minimum course length halved**: 18-hole 3,000 → **1,500 yards**; 9-hole 1,500 → **750 yards**
- Expected Score replaces net-par-plus-one for holes not played

**The friction wall nobody explains** [V — from the official iGolf Handicap Procedures PDF]:
- **54 holes minimum** for an initial index — any mix of 9s and 18s
- **Pre-registration is mandatory.** Create the scorecard in MyEG **before teeing off**
- **Geo-location enforces that you are physically at the course** when you pre-register
- **A marker is required** — someone with a membership number who played with you and verifies promptly
- Submission via MyEG **by midnight on the day of play**. No retrospective scores
- Match play does not count. Individual strokeplay, Stableford, Par/Bogey only
- **iGolf £47/year** is the non-member route

> **England Golf's own public iGolf page does not state the 54-hole requirement.** Beginners genuinely cannot find this. Making it discoverable and free is both the right thing to do and the cheapest acquisition channel available.

### 3.9 Time, volume and cost realities (UK)

Real golfers, in their own words [V] — Golf Monthly forums:
> *"I tend to only get 50 balls at any session"* · *"100 balls each time and I go twice a week"* · *"I get through the balls in about an hour"* · *"a good structured session working through 50 balls is enough"*
> *"I was just mindlessly hitting balls…now I only get 1 or 2 baskets, but it takes longer as I treat every shot"*
> *"Surely it's about quality and not quantity"*

**Planning assumption: 50–100 balls over 45–90 minutes — roughly one ball per minute when practising with intent. Design session templates around 50 balls / 45–60 minutes as the default unit.**

**UK range pricing** [V]:

| Venue type | Price |
|---|---|
| Club-attached range | £3.50–£6.50 per 50 balls |
| Commercial range | £8.00–£9.00 per 100 balls |
| Toptracer bay (Belfry, Trafford) | £10–£12 per 80 balls, 60-minute limit |

Club hire adds real cost (irons £2, woods £4, drivers £6 each at one range) — **a genuine beginner barrier worth surfacing in onboarding.**

**Cost model for a typical user:** twice-weekly range at 100 balls ≈ **£70–£100/month**; iGolf £47/year; club membership £450–£850+/year; 18 holes = 4–4.5 hours including travel.

> **You are competing for attention against a £70–£100/month range habit that users already suspect is being wasted.** The honest pitch is *"same spend, structured — or less spend, better outcome."* That is stronger and more defensible than promising handicap reduction.

---

## 4. Naming and brand strategy

### 4.1 One brand worldwide. Do not dual-brand.

You asked whether you could launch as one name in the UK and another elsewhere. Technically you can — App Store Connect lets you localise the app name per storefront. **Strategically you should not**, for five reasons:

1. **Word of mouth in golf is global.** r/golf is US-dominant, YouTube reviewers are global, forums are global, and golfers travel. A UK golfer recommending your app in a global thread sends people to a name that doesn't exist in their store. That is your cheapest acquisition channel, broken on purpose.
2. **Cost multiplies at exactly the wrong time.** Two trademark portfolios, two domains, two websites, two social presences, two ASO strategies, two support inboxes, two sets of press outreach — for a team your size that is not a tax, it's a tourniquet.
3. **You lose the compounding asset.** Reviews, backlinks, brand searches and press all accrue to a name. Splitting them halves both, permanently.
4. **The switching cost is lowest today.** You are pre-launch. Renaming now costs an afternoon; renaming after 20,000 installs costs your ratings, your ASO position and your backlinks.
5. **The exceptions don't apply to you.** Dual-branding is justified when a trademark is legally blocked in a key market, or when you acquire or partner with an established local brand. Neither is your situation.

**Conclusion: pick a name that survives globally, now, and use it everywhere.**

### 4.2 Why Fettle doesn't survive globally

Your instinct is right, and the specifics are worse than "it might not translate":

| Market | Problem |
|---|---|
| **Korea** | Korean has no /f/ — it renders as ㅍ/p. "Fettle" becomes **페틀 ("peteul")**. The "-tle" syllable has no Korean equivalent. **The brand literally cannot be said as intended.** |
| **Japan** | フェトル (*fetoru*) — same class of problem |
| **Germany** | *fett* = fat/greasy. "Fettle" parses as **Fett + the diminutive -le** → roughly "little fatty". For a fitness-adjacent app, an unforced error. Dutch shares the root (*vet*) |
| **USA** | Survives in standard English essentially only in the frozen phrase "in fine fettle". Most Americans don't use it. **A name nobody can define is a name nobody repeats** |
| **NE England** | A negative sense exists — *fettle* as a noun can mean a mood "assuming the worst"; "in a fettle" is bad |

Plus it is already crowded in fitness: at least six Fettle apps across the stores, and Fettle Bike Repair is a VC-backed UK consumer brand.

**Verdict: Fettle is a lovely UK name and a bad global one. Drop it.**

### 4.3 Priority markets: UK, USA, Spanish-speaking

The brief narrowed after v1.1: the three markets that matter are **UK, USA and the Spanish-speaking world** (Spain, Mexico, Argentina, Colombia, Chile). That single constraint reorders everything, because a name now has to survive being *said and spelled* by a Spanish speaker.

**It demotes Cairn.** Word-final `-rn` is phonotactically illegal in Spanish — permitted final consonants are essentially -n, -r, -s, -l, -d and -z. There is no Spanish cognate to anchor the spelling to (Spanish says *mojón*, *hito*, or Andean *apacheta*), so a Spanish speaker will write **Cairon, Kairn, Caern or Kern**. A user who cannot spell your name cannot search for it, and search is your cheapest acquisition channel. That is a tax paid forever in three of your five Spanish markets.

Two other Cairn findings, for the record: **Tommy Armour Golf's CAIRN mark for golf clubs is abandoned** (express, July 1996), so the golf lane is genuinely clear — but **The Game Bakers' CAIRN (79380586 / IR 1755057) claims classes 9, 16, 28 and 41**, live in the US pipeline since June 2023. Classes 9 and 41 are precisely yours.

**Cairn remains an excellent UK/US name. It is no longer the right one for this brief.**

### 4.4 Recommendation: **Senda**

> *Senda* — Spanish for a path or trail. RAE-listed, slightly literary. The same metaphor as Cairn — route, progression, markers, "you are here, here's the next one" — but **native to Spanish instead of opaque to it.**

| Test | Result |
|---|---|
| Existing golf app | **None found** |
| Existing golf brand | **None found** |
| US trade mark, class 9 | **No conflict surfaced** |
| US trade mark, class 41 | **No conflict surfaced** |
| Nearest sport mark | Senda Athletics — class 28 (futsal balls) and class 25. Different sport, different classes |
| `senda.golf` | **Appears unregistered** |
| `sendagolf.com` | **Appears unregistered** |
| Vulgar or regional slang in ES / MX / AR / CO / CL | **None found in any** |
| Spanish pronounceability | Perfect. SEN-da, two syllables, no clusters, no ambiguous graphemes |
| English pronounceability | Perfect. Spelled correctly from hearing by an English speaker on first attempt |

**Why it wins on this brief.** It is the rare case where the name is *the same word* in both languages — not a loanword, not an approximation. An English speaker hears "Senda" and writes Senda. A Spanish speaker hears it and writes Senda. Nothing else screened managed both. It is less generic than *ruta* or *camino*, which is exactly what makes it registrable. And the iconography and progression story survive intact from the Cairn work — a path with markers along it is the same brand, told in a word your second-largest market already owns.

**Two things to manage:**
- **[SENDA is Chile's national drug-and-alcohol agency](https://www.senda.gob.cl/)** and owns Chilean search for the bare word. Different classes, non-commercial, and "Senda Golf" disambiguates instantly — an association issue, not a blocker, but know about it before a Chilean journalist mentions it.
- `senda.com`, `senda.app` and `getsenda.com` are all taken. **`senda.golf` becomes your primary domain.**

### 4.5 Alternative: **Cima**

"Summit" — instantly understood across all five Spanish markets, easy in English, and `cima.golf` is free. The right promise for a progression product.

**Against:** the ***cima* / *sima*** homophone (summit vs. chasm — the exact opposite meaning) is a well-known Spanish spelling trap across LatAm and southern Spain. **CIMA is also Spain's national medicines database (AEMPS)**, and the **Chartered Institute of Management Accountants** is a global body holding CIMA for training software and owning cima.com — uncomfortably close to class 41. English-side there's a mild spell-from-hearing risk (Seema, Cyma).

Take Cima if clearance kills Senda.

**Dark horse:** **Pauta** ("guideline") has the cleanest legal and domain position of anything screened — no exact US mark at all, and `.golf`, `.app`, `pautagolf.com` and `getpauta.com` all appear unregistered. It fails on the English side (nobody derives "POW-ta" from the spelling) and it is advertising-industry wallpaper across LatAm. Third call only.

### 4.6 On acronyms — don't, and the reason is mechanical

A spelled-out acronym has to survive being **said aloud** in both languages, and Spanish letter names diverge sharply from English ones. **G is the worst offender** — Spanish *ge* is /xe/ against English "jee" — followed by **J** (*jota*), **H** (*ache*, and silent), **Y** (*i griega*), **W**, **V**, **Z**, and every vowel: **A** is "ah" not "ay", **E** is "eh" not "ee", **I** is "ee" not "eye".

Any acronym containing those letters is a **different-sounding brand on each side of the Atlantic**. Word of mouth — your cheapest channel — does not cross.

**MGA specifically is the worst name screened, and the working name should be retired now:**

| Problem | Detail |
|---|---|
| Contains a G | Spanish reads M-G-A as "EH-meh-HEH-ah" vs English "em-jee-ay" |
| **Two live golf handicap apps already called MGA** | [MGA WHS](https://apps.apple.com/us/app/mga-whs/id1392206053) — the Malaysian Golf Association's official handicap app. [My MGA](https://apps.apple.com/us/app/my-mga/id457991465) — Metropolitan Golf Association |
| **A 129-year-old US golf governing body** | [Metropolitan Golf Association](https://mgagolf.org/), founded 1897, runs GHIN handicapping services — in your largest market, in your exact feature |
| MGA Entertainment | 455+ trade marks (Bratz, L.O.L. Surprise), heavy in class 28 |
| `mga.golf` | **Live** — an existing Men's Golf Association site |

Also dead as brand names, each independently: **PACE** ("pace of play" is core golf jargon, Burrows Golf owns PACE for clubs, and three pace-of-play golf apps already exist), **GAP** (a gap wedge is a club category; Golf Association of Philadelphia trades as GAP with its own app; and Gap Inc. is among the most aggressively defended marks on earth), **TEEQ** (an existing golf-coaching platform at teeqapp.com, plus TeeQuest golf software — and `ee` and word-final `q` are both unspellable under Spanish orthography), **Kadi** (kadi.golf is a live Swiss golf apparel brand, *and* the RAE gives **"cadi" as the Spanish spelling of caddie** — you would be branding a golf app with the generic Spanish word for caddie).

**If you want a short coined mark rather than a real word, the answer is Parza** — clean US register, `parza.golf` / `parzagolf.com` / `getparza.com` all unregistered, contains "par", reads as friendly in Colombia. Its weakness is the `z`: /θ/ in Spain, /s/ in Latin America, /z/ in English — three pronunciations of a four-letter word. Smaller than Cairn's problem, same kind of problem. I would still take a real word.

### 4.7 Names that are dead — don't revisit these

| Name | Why |
|---|---|
| **MGA** | See §4.6. Retire it |
| **Fettle** | Cannot be pronounced in Korean (페틀); German reads it as *Fett* + *-le*, "little fatty"; undefinable to most Americans |
| **Blueprint Golf** | Golf Blueprint already sells custom golf practice plans; exclusive licence with TruGolf |
| **Range Rat** | An App Store golf practice app with randomised targets and session tracking. Your product, already named |
| **Pin High** | Five golf apps, one of them a handicap index tracker |
| **Sweet Spot** | sweetspot.io is a golf commerce platform UK clubs use; *The Sweet Spot* is a leading golf-improvement podcast |
| **Quiver** | **TaylorMade owns the live registered QUIVER mark** (85040094, class 28). Also: quiver = tremble with fear = the yips |
| **Kata** | A live **Spanish-language** habit-and-streak app with the same mechanics; OpenStack holds KATA in class 9; homophone with *cata* (wine tasting) so users type the wrong word |
| **Mira** | 681 US marks in class 9 alone. One of the most frequent words in spoken Spanish — unregistrable, unsearchable |
| **Forma** | forma.golf GmbH is a live German golf company; *estar en forma* = "to be fit", which is why five fitness apps took it |
| **Ruta** | ruta.golf is a live golf-tourism business in Lima, Peru |
| **Faro** | Faro is the Algarve's golf gateway — you'd fight golf-travel SEO forever. And in Mexico, *Faros* is the iconic cheap cigarette; *"ya chupó faros"* = he's finished |
| **Arco** | arcogolf.com is live; confusable with **Arccos**, the leading shot tracker; and across AR/CO/CL/PE/MX *el arco* is the football **goal** |
| **Vela** | velagolf.com is a golf venture in pre-launch; reads as sailing |
| **Molde** | *Pan de molde* = sliced bread in Spain. And a mould is rigid; your product is adaptive |
| **Alba** | *Alba: Find Golfers* exists in the UK; **ALBA Net is Japan's leading golf magazine brand** |
| **Praxis, Hone, Meridian, Fescue, Sward, Anvil, Vantage, Ledger, Tally, Plumb, Etude, Whetstone, Flush, Loop, Divot, Groove, Strike, Caddie Lab, Shotcraft, Groundwork, Tempo** | Clashes, or fatal findability / pronunciation problems |

### 4.8 Naming architecture

- **App Store / Play title:** `Senda: Golf Practice Plans` — subtitle carries search keywords, name carries brand
- **Spanish storefronts:** `Senda: Entrenamiento de Golf`
- **Primary domain:** `senda.golf`
- **Subscription tier:** `Senda Plus`
- **The diagnosis:** `Game Profile` / *Perfil de Juego* — plain language, not jargon
- **The session engine:** `Session` / *Sesión* (avoid "workout", which reads gym)
- **Progression:** `Markers` / *Hitos* — 7 tiers. The path metaphor pays for itself in both languages
- **Voice:** direct, plain, never hype. The category overclaims constantly; the differentiating tone is calm competence

## 5. Colour and type system — "Links"

### 5.1 The strategic call

Every major golf app is mid-green (Hole19, Golfshot, 18Birdies). Matching that means invisibility on a home screen and in an App Store grid. Links does three things instead:

1. **A warm linen paper base**, not clinical white — reads as scorecard and clubhouse, and is easier on the eye outdoors
2. **One deep, serious green** for every action. Restraint reads as confidence
3. **One electric lime**, reserved exclusively for progress and completion. Because it appears rarely, it lands hard. This is the colour of "you did the thing"

### 5.2 Light mode (default)

| Role | Token | Hex | Contrast on page |
|---|---|---|---|
| Page | `--bg-page` | `#F5F3EE` | — |
| Card | `--bg-card` | `#FFFFFF` | — |
| Sunken | `--bg-sunken` | `#EDEAE2` | — |
| Ink primary | `--ink-1` | `#0D1A15` | **16.11 : 1** AAA |
| Ink secondary | `--ink-2` | `#4C5C55` | **6.38 : 1** AA |
| Ink muted | `--ink-3` | `#7C8A84` | 3.25 : 1 — labels and axis ticks only |
| Hairline | `--line` | `#E3E0D8` | — |
| **Fairway** (primary) | `--brand` | `#0B5C42` | **7.22 : 1** AAA |
| Fairway pressed | `--brand-press` | `#08402E` | — |
| Fairway tint | `--brand-tint` | `#E6F0EB` | — |
| **Signal** (accent) | `--signal` | `#C9F24C` | 1.16 : 1 — **fill only, never text on light.** Ink on Signal = 13.85 : 1 AAA |
| Good | `--good` | `#146B3A` | 5.93 : 1 AA |
| Warning | `--warn` | `#8A5A00` | 5.34 : 1 AA |
| Critical | `--crit` | `#B3261E` | 5.89 : 1 AA |

### 5.3 Dark mode

Dark is a **selected** palette stepped for the dark surface, not an inverted flip.

| Role | Hex | Contrast on `#141C19` |
|---|---|---|
| Page | `#0B1310` | — |
| Surface | `#141C19` | — |
| Elevated | `#1E2A25` | — |
| Ink primary | `#F2F5F3` | **15.81 : 1** AAA |
| Ink secondary | `#A7B5AE` | **8.15 : 1** AAA |
| Ink muted | `#7C8A84` | 4.82 : 1 AA |
| Hairline | `#26332D` | — |
| Fairway on dark | `#35B084` | **6.36 : 1** AA |
| Signal | `#C9F24C` | **13.46 : 1** AAA — usable as text here |
| Critical | `#FF6B60` | 6.22 : 1 AA |

### 5.4 Chart colours

**Rule 1 — most charts are single-series and must not use categorical colour.** "Shots lost by area" is one measure across four categories: a magnitude comparison. One hue, focus item darkened. Four colours there would imply four unrelated things.

Fairway sequential ramp: `#DCEBE4` · `#B9D7C9` · `#8DBDA8` · `#5C9E82` · `#2E7D5D` · **`#0B5C42` (focus)** · `#08402E`

**Rule 2 — genuine multi-series charts cap at three concurrent series.**

| Slot | Light | Dark |
|---|---|---|
| 1 | `#2A78D6` | `#3987E5` |
| 2 | `#EB6834` | `#D95926` |
| 3 | `#1BAF7A` | `#199E70` |

Validated with all pairs in play in both modes: worst colourblind separation ΔE 9.2 light / 9.4 dark (target ≥ 8); worst normal-vision separation ΔE 24.0 light / 20.9 dark (floor ≥ 15). **A fourth concurrent series cannot clear those floors** — swap the fourth in via a segmented control, never add a fourth colour. In light mode slots 2 and 3 sit just under 3:1 on linen, so **every series must carry a direct label**.

**Rule 3 — never a dual-axis chart.** Handicap index and practice volume are different scales: two charts, or index to a common base.

**Rule 4 — text never wears the series colour.** Values and labels stay in ink; a small coloured dot beside them carries identity.

**Rule 5 — status colours always ship with an icon and a label**, never colour alone.

### 5.5 Typography

System sans throughout — SF Pro on iOS, Roboto on Android. No display face, no serif: it renders faster, respects the user's accessibility text size, and doesn't date.

| Style | Size / weight | Use |
|---|---|---|
| Display | 40 / 700, tight | The one big number on a screen |
| Title 1 | 28 / 700 | Screen titles |
| Title 2 | 22 / 600 | Card headings |
| Headline | 17 / 600 | Row titles, buttons |
| Body | 17 / 400 | Descriptions |
| Callout | 15 / 400 | Secondary |
| Caption | 13 / 500, +0.3 tracking, uppercase | Labels above values |

`tabular-nums` in tables, axis ticks and vertically-aligned columns. Proportional figures everywhere else.

### 5.6 Shape, spacing, motion

- **Spacing:** 4pt base · screen gutter 20 · card padding 16 · section gap 24
- **Radii:** cards 16 · buttons 12 · chips 999 · bar ends 4
- **Elevation:** one level only — 1px `--line` border plus `0 1px 2px rgba(13,26,21,.05)`. No heavy shadows
- **Motion:** 200ms ease-out entrances, 120ms state changes. One exception: session completion gets a 600ms Signal sweep. Respect `prefers-reduced-motion`
- **Touch targets:** 44pt minimum everywhere; **56pt in the Session Player** — the user is standing on a mat, in wind, wearing a glove, holding a club

---

## 6. App layout

### 6.1 Navigation — four tabs

Not five. Five is where golf apps go to die, and the fifth is always a "More" bin.

| Tab | Question it answers |
|---|---|
| **Today** | *What should I do next?* |
| **Practice** | *What am I working on, and what else is there?* |
| **Progress** | *Is it working?* |
| **Learn** | *How does any of this work?* |

Profile and settings sit behind the avatar top-right on Today. No fifth tab, no hamburger.

**Why Learn earns a tab:** the verified beginner barrier is procedural, not technical (§3.7, §3.8). Making it discoverable and free is the cheapest acquisition channel you have.

### 6.2 Onboarding — five screens, under three minutes

82–86% of trials start on install day. Whatever happens in the first three minutes decides the business. **The job of onboarding is not to sell. It is to produce a plan.**

1. **Where are you now?** — *Never played · Learning, no handicap yet · I have a handicap (enter index) · I play but don't track anything*
2. **What do you want?** — *Play my first round without embarrassing myself · Get my first official handicap · Break 100 / 90 / 80 · Get to single figures*
3. **What can you get to?** — driving range · practice green · net at home · simulator · course. Plus sessions per week and typical length
4. **Quick assessment** — six taps. Handicap holders can optionally enter last round's seven stats; beginners get a self-rated confidence scale. **State confidence honestly from the first screen**
5. **Your Game Profile** — the reveal. Four bars, worst area highlighted, one sentence: *"Approach play is costing you about 6.2 shots a round. That's where we'll start."*

Then: **your first session is built.** Start now, or schedule it.

**No paywall in onboarding. No account until session 2.** Email capture happens after the first completed session, when there is something worth saving.

### 6.3 Today

One question, one action.

```
┌─────────────────────────────────────┐
│  Saturday                    (avatar)│
│  ┌───────────────────────────────┐  │
│  │ ▓▓▓▓ WEEK 3 · 2 of 2 done  🔥 │  │   Streak — weeks, not days
│  └───────────────────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │ TODAY'S SESSION               │  │   Hero card, Fairway green
│  │ Approach Ladder               │  │
│  │ 45 min · 50 balls · range     │  │
│  │ Targets 100 / 130 / 160 yds   │  │
│  │ [    Start session    ]  ⋯    │  │   56pt primary
│  └───────────────────────────────┘  │
│  Playing instead?                    │
│  [ Log a round ]  [ Log a session ]  │
│  ── YOUR FOCUS ──────────────────    │
│  Approach · 6.2 shots a round        │
│  ▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░  worst area      │
│  Since you started: −0.8 shots  ✓    │
└─────────────────────────────────────┘
```

**Three design calls worth defending:**

- **One hero action.** If a user opens the app and has to decide what to do, the app has failed. It already knows.
- **The streak counts weeks with 2+ sessions, not consecutive days.** [This is the single most important retention decision in the app.] Golf is weather-dependent and range visits cost £8–£12. A daily streak breaks in week one and takes the user with it. A weekly streak survives a rained-off Tuesday, which means it survives at all. Grant one silent "pass" per month.
- **A rest state is a real state.** On a day with nothing scheduled, the hero card says so and offers a 10-minute putting-mat session. Never an empty screen, never a nag.

### 6.4 Session Player — the heart of the app

Full-screen, no tab bar, no back button (explicit "End session" in the overflow). Built for someone standing on a range mat, in wind, wearing a glove.

**Structure — blocked → random → pressure.** This sequencing is the app's actual intellectual property (§3.4).

| Phase | Balls | What happens |
|---|---|---|
| **Warm-up** | 8 | Half swings, wedge, no scoring |
| **Block** | 15 | Same club, same target. Groove it. **Feedback every 3rd ball, not every ball** |
| **Random** | 18 | Club and target shuffle every ball. The app calls each shot |
| **Pressure** | 9 | A scored game, one attempt each, no do-overs. This score goes in the record |

```
┌─────────────────────────────────────┐
│  ●●●●●○○○○  RANDOM · 5 of 18     ⋯  │
│                                      │
│            7 IRON                    │   40pt display
│         to 150 yards                 │
│                                      │
│   "Start the ball over the left      │   External cue — always about
│    edge of the flag."                │   ball and target, never body
│                                      │
│  ┌──────────┐  ┌──────────┐         │
│  │    ✓     │  │    ✗     │         │   56pt targets, thumb reach
│  │   Hit    │  │   Miss   │         │
│  └──────────┘  └──────────┘         │
│         Undo last                    │
└─────────────────────────────────────┘
```

- **Never a keyboard.** Every input is a tap
- **External cues only** (§3.4, principle 1)
- **Target 70% success.** Above 80% the next session tightens; below 55% it eases. This adaptive engine is a headline Plus feature and it is a real one
- **Let the user override difficulty.** Learner-controlled difficulty was the best-performing condition in the literature. A discreet "too easy / too hard" control genuinely re-tunes the engine

**Session summary**, immediately on completion: score and delta vs your last attempt · which phase moved · one sentence of plain-English interpretation · Marker progress (Signal lime — the moment that colour exists for) · **Share as a Range Card** (free — this is organic acquisition).

### 6.5 Practice

- **Your plan** — the current multi-week programme as a vertical timeline; completed weeks collapse
- **Drill library** — filter by area, facility, time available, equipment. ~20 free, ~150 in Plus
- **Skills tests** — the benchmark battery (§3.6). Monthly. Results feed the diagnosis and drive the Marker ladder
- **Build your own** — pick area, time, facility. One per week free, unlimited in Plus

### 6.6 Progress

- **Game Profile** — four areas ranked worst-first in shots per round, with stated confidence and the round count behind it
- **Handicap** — index trend, WHS-correct, plus "which 8 of your last 20 are counting"
- **Benchmarks** — you vs your handicap peers, using real amateur data, never Tour
- **Markers** — 7 tiers, each with an entry benchmark tied to a *measured test score*, not vanity XP. That distinction is what keeps it credible
- **History** — sessions and rounds. Last 30 days free, unlimited in Plus

### 6.7 Learn — free forever

1. **First Steps** — the beginner pathway. What to buy and what not to. What to wear. How to book. Where to stand. Pace of play. What "provisional" means. **What to do when you're embarrassed** — the emotional layer every existing guide skips (§3.7)
2. **Getting a handicap** — the 54 holes, iGolf at £47/year, and the pre-registration / geo-location / marker / midnight chain nobody warns you about. Plus the 2024 changes that help: 9-hole counts, and so do 11/13/15-hole rounds, and short courses now qualify
3. **How practice works** — short, honest explainers: why your putting probably isn't the problem; blocked vs random; why fairways hit is a useless stat; what 50 balls should actually look like

### 6.8 Round logging — 30 seconds, seven inputs

Per §3.3. **Must handle 9-hole rounds as a first-class case**, plus 11/13/15-hole rounds — all WHS-acceptable, and 9 holes is the beginner's native format.

---

## 7. Engagement

The category is wide open here (§2.5).

| Mechanic | Design | Tier |
|---|---|---|
| **Weekly streak** | Weeks with 2+ sessions. Weather-proof by design. One silent pass per month | Free |
| **Markers** | 7 tiers. Promotion requires passing a benchmark test, not accumulating points | Free |
| **Benchmark tests** | Monthly checkpoints. Measurable, repeatable, shareable — and they refresh the diagnosis, which stops the advice going stale | 2 free, 6 in Plus |
| **Range Card** | Shareable session-result image. Clean and brand-forward, not a meme | Free — it is acquisition |
| **Peer benchmarks** | "You vs 15-handicaps" | Summary free, detail in Plus |
| **Nudges** | Gentle, not guilt. Off by default for the first 14 days | Free |

**Do not paywall anything social or competitive.** When 18Birdies moved leaderboards behind its paywall, users said so in reviews: *"Love this app… but what happened to the leaderboards? I don't show up on any of them anymore?!"* Social features are worth more as retention and acquisition than as conversion levers.

---

## 8. Paywall and pricing

### 8.1 The principle

Free at point of use means **a golfer who never pays a penny still gets better.** That is not charity — it is what makes the app worth recommending, and word of mouth is the only distribution advantage available against an incumbent with 5m installs.

Plus does not sell access. It sells **depth, adaptivity and history**.

### 8.2 Pricing

| Plan | Price | Notes |
|---|---|---|
| **Plus — Annual** | **£49.99 / year** | £4.17/mo equivalent. 7-day trial. Default selection |
| **Plus — Monthly** | **£7.99 / month** | No trial. Presented second |

**Why these numbers.** Category medians of $9.70/mo and $39.99/yr, times a UK index of 1.3×, land at £7.99 / £49.99. Positioned: above CORE Golf (£26.49/yr), level with Hole19 Premium (£59.99/yr), well under Hole19 Intelligence (£99.99/yr), Break X Golf ($179/yr) and Me and My Golf (£209/yr).

**Push annual hard** — 44.1% vs 17.0% twelve-month retention; 61% of category revenue; ~4× the LTV.

**Do not offer a weekly plan.** It converts, and it is predatory, and this is a product built on trust.

### 8.3 The split

| | **Free forever** | **Plus** |
|---|---|---|
| **Diagnosis** | Full Game Profile, refreshed monthly | Refreshed after every round; per-area detail |
| **Sessions** | 1 auto-built per week; ~20 core drills; unlimited manual sessions | Unlimited auto-built; ~150 drills; adaptive difficulty; blocked→random progression |
| **Programmes** | — | Multi-week ("Break 90 in 12 weeks", "Your first handicap") |
| **Rounds** | Unlimited logging, unlimited handicap history, WHS index tracking | Deep-dive analysis; miss patterns; approach-distance breakdown |
| **Benchmarks** | 2 tests; summary peer comparison | All 6; full peer charts; trend over time |
| **History** | Last 30 days | Unlimited |
| **Learn** | **Everything. Permanently.** | — |
| **Social** | Streaks, Markers, Range Card sharing | — |
| **Convenience** | — | Offline sessions, Apple Watch player, PDF export for a coach |

**Handicap tracking is free and always will be.** It is the retention hook, it is what gets people opening the app between range visits, and the official alternative is rated 2.4 stars. Gating it would be strategically illiterate.

### 8.4 When the paywall appears

Never as a wall. Five triggers, in priority order:

| Trigger | Moment | Framing |
|---|---|---|
| **A — primary** | After the **3rd completed session** | "Three sessions in. Your approach score is up 18%. Here's what unlimited looks like." **Evidence, not aspiration** |
| **B** | Building a **second session in the same week** | Show the session they wanted, greyed, **with the drill names visible** |
| **C** | First measurable **improvement** in handicap or a benchmark | Highest emotional point in the product. Lead with the achievement; the offer is second on screen |
| **D** | After logging a round, when the **deep dive** generates | Show the headline finding free. Blur the detail. **Never blur the headline** — that is bait-and-switch and users punish it |
| **E** | Day 21 if nothing above has fired | Plain, un-urgent. No countdown |

**Deliberately not on day 0.** The industry pattern is a hard paywall straight after onboarding and it converts ~5× better on paper (12.11% vs 2.18% by day 35). You are choosing the lower number on purpose because the free tier *is* the acquisition strategy against an incumbent you cannot outspend.

### 8.5 Paywall screen rules

- **Annual first**, monthly second, per-month equivalent shown on the annual card
- **Four benefit rows maximum**, each a concrete capability, not an adjective
- **A visible dismiss from the first frame.** No delayed close, no fake-close patterns
- **"Keep using [app] free"** as an explicit, tappable secondary
- **"Cancel any time in Settings — two taps"**, and make it true. Arccos sits at 1.9/5 on Trustpilot largely on billing and cancellation complaints: *"Advertised at a monthly cost, but billed upfront for the year with no actual monthly option."* *"customer services team are useless."* Being visibly the opposite is cheap and it differentiates
- **No countdown timers, no fake scarcity**

### 8.6 Honest arithmetic

At ~2.2% install-to-paid for generous freemium, **10,000 installs ≈ 220 subscribers ≈ £11,000 annualised.** The free tier has to earn its keep through referral and App Store ranking, or the model is wrong. **Instrument sharing and organic-install attribution from day one**, not later.

---

## 9. Build order

| Phase | Scope | Why |
|---|---|---|
| **v1.0** | Onboarding → Game Profile → Session Player → summary → weekly streak → round logging → Learn (First Steps + handicap pathway) | The whole loop. Nothing here is optional |
| **v1.1** | Skills tests, Markers, peer benchmarks, Range Card sharing | The retention layer. Ship within 8 weeks of launch |
| **v1.2** | Paywall + Plus. Adaptive difficulty, full library, multi-week programmes | **Do not monetise until retention is proven** |
| **v1.3** | WHS index calculation, Apple Watch player, offline | The UK moat and the range-realistic conveniences |
| **Later** | Arccos / Shot Scope import, coach export, club and coach B2B | Only once the consumer loop works |

---

## 10. Risks and things to verify

### 10.1 The fabricated data table — important

[V] **Mark Broadie's strokes-gained-by-handicap-category table does not exist in published form.** Broadie explicitly declined to publish it, citing space and proprietary concerns.

A table like this circulates widely online, attributed to him, and dominates search results:

| Handicap | OTT | Approach | ARG | Putting | Total |
|---|---|---|---|---|---|
| Scratch | −0.8 | −1.5 | −0.5 | −0.4 | −3.2 |
| 5 | −1.4 | −3.0 | −1.0 | −0.8 | −6.2 |
| 10 | −2.0 | −4.5 | −1.5 | −1.2 | −9.2 |
| … | … | … | … | … | … |

**It is synthetic. Do not use it.** The approach column is perfectly linear (−1.5 × handicap/5), as is around-the-green. Real skill data is never that clean. If a developer, contractor or AI assistant hands you numbers that look like this, they have pulled them from an SEO content farm.

**Use the Shot Scope tables in §3.1 instead.**

### 10.2 Risk register

| # | Risk | Action |
|---|---|---|
| 1 | **Trade mark.** No EU screening was possible (EUIPO and TMview unreachable); UK IPO blocks automated search; USPTO only reachable via a mirror | Commission professional clearance for **Senda and Cima together** in **UK + EU + US, classes 9 and 41**, before any brand spend. Roughly £200–£500 per jurisdiction. EUIPO, TMview and UKIPO were all unreachable to automated search across three research passes — this gap is unchanged and it is the one thing standing between you and a decision |
| 2 | **WHS accuracy.** The initial-allocation table for fewer than 20 scores has adjustments that secondary sources get wrong | Implement from the official Rules of Handicapping appendix. Getting this wrong generates support tickets and destroys trust |
| 3 | **Benchmark test norms don't exist.** No published handicap scaling for Par 18 | Present as personal-best tracking until you derive norms from your own users. Doing so would be genuinely novel |
| 4 | **Overclaiming.** Deliberate practice explains ~18% of variance in sport, and practice-to-course transfer has never been demonstrated in a controlled golf study | Claim *"practice quality is the largest single lever you control"*. Never *"proven to transfer"* |
| 5 | **Population averages are not diagnoses.** Within-band variation exceeds between-band variation (§3.2) | Always show a confidence level; update hard as the user's own data arrives |
| 6 | **Hole19 / CORE Golf** may push practice plans into their free tier and compress the category | Defend on beginners, on the range, and on WHS — not on features |
| 7 | **Price ceiling is real.** Clippd charges £191.99/yr and has 8 ratings at 3.5★ | Don't drift upward from £49.99 without evidence |
| 8 | **Reddit was blocked during research** (403 at the proxy). Beginner sentiment came from UK forums instead | Worth a manual pass through r/golf for US beginner language before writing US-facing copy |

---

## 11. Sources

**Research** · [Shot Scope Strokes Gained eBook](https://shotscope.com/ebook/Strokes_Gained.pdf) · [MyGolfSpy: golf's costliest shot](https://mygolfspy.com/news-opinion/where-golfers-lose-the-most-strokes-data-reveals-golfs-costliest-shot/) · [MyGolfSpy: short game by handicap](https://mygolfspy.com/news-opinion/instruction/how-good-is-your-short-game-performance-chart-by-handicap/) · [MyGolfSpy: putting make % by handicap](https://mygolfspy.com/news-opinion/putting-make-percentage-by-handicap-full-chart-are-you-above-or-below-average/) · [Broadie 2012, Columbia PDF](https://columbia.edu/~mnb2/broadie/Assets/strokes_gained_pga_broadie_20110408.pdf) · [Broadie in Golf Digest](https://www.golfdigest.com/story/drive-for-show-and-putt-for-dough-not-true-says-mark-broadie) · [Lou Stagner on within-band variation](https://newsletter.loustagnergolf.com/p/skill-differences-between-different-handicaps)

**Practice science** · [Barzyk & Gruber 2024, Frontiers](https://www.frontiersin.org/journals/sports-and-active-living/articles/10.3389/fspor.2024.1324615/full) · [Shea & Morgan 1979](https://gwern.net/doc/psychology/spaced-repetition/1979-shea.pdf) · [Guadagnoli & Bertram 2014, Int J Golf Science](https://www.golfsciencejournal.org/article/4967-optimizing-practice-for-performance-under-pressure/attachment/14568.pdf) · [Macnamara et al. 2014](https://library.scottbarrykaufman.com/uploads/2014/07/Macnamara-et-al.-2014.pdf) · [Yin et al. 2024, Scientific Reports](https://www.nature.com/articles/s41598-024-65753-3) · [Grecic & Ryan 2018, The Sport Journal](https://thesportjournal.org/article/a-practical-evaluation-of-golf-coaches-knowledge-of-block-and-random-practice/)

**Competitors** · [Hole19 Intelligence tier](https://www.hole19golf.com/the-19th-hole/hole19-intelligence-tier) · [Hole19 CORE Golf](https://www.hole19golf.com/core-golf) · [MyGolfSpy: We Tried It, CORE Golf](https://mygolfspy.com/we-tried-it/we-tried-it-core-golf-practice-app/) · [Break X Golf](https://breakxgolf.com/) · [GolfPlan AI](https://www.golfplan.ai/) · [Me and My Golf pricing](https://meandmygolf.com/price/) · [Arccos Trustpilot](https://ca.trustpilot.com/review/arccosgolf.com) · [Shot Scope](https://shotscope.com/uk/discover/my-shot-scope/) · [Golf Insider UK best golf apps](https://golfinsideruk.com/best-golf-apps/)

**Market** · [England Golf membership 2025](https://golfbusinessnews.com/news/growing-the-game/england-golf-reports-major-rise-in-club-membership/) · [iGolf exceeds 50k](https://www.golfmagic.com/news/igolf-shows-path-club-membership-platform-exceeds-50k) · [GCMA participation](https://www.gcma.org.uk/news/golf-participation-isnt-just-growing-its-evolving/) · [R&A 108m golfers](https://www.randa.org/en/articles/over-100-million-golfers-in-randa-markets-as-global-participation-continues-to-grow) · [The Golf Business H1 2026](https://thegolfbusiness.co.uk/2026/08/participation-data-for-first-half-of-2026-shows-long-term-growth/) · [RevenueCat State of Subscription Apps 2025](https://www.revenuecat.com/state-of-subscription-apps-2025) · [Adapty health & fitness benchmarks](https://adapty.io/blog/health-fitness-app-subscription-benchmarks/) · [Airbridge pricing benchmarks 2026](https://www.airbridge.io/en/blog/subscription-app-pricing-by-category-2026-benchmark)

**WHS & beginners** · [iGolf Handicap Procedures 2024 (PDF)](https://englandigolf.co.uk/media/uploads/2024/05/iGolf-Handicap-Procedures-2024.pdf) · [England iGolf](https://englandigolf.co.uk/) · [R&A: 2024 WHS revisions](https://www.randa.org/en/articles/world-handicap-system-revisions-announced-for-2024) · [Golf Monthly: 6 biggest 2024 WHS changes](https://www.golfmonthly.com/golf-rules/6-biggest-changes-from-the-2024-world-handicap-system-revisions) · [Golf Monthly: what clubs get wrong about growing the game](https://www.golfmonthly.com/features/5-things-golf-clubs-still-get-wrong-about-growing-the-game) · [Golf Monthly forum: nervous first round](https://forums.golfmonthly.com/threads/new-to-golf-nervous-before-playing-my-first-round.72319/) · [Golf Monthly forum: range balls](https://forums.golfmonthly.com/threads/range-how-many-balls-do-you-hit.34460/)

**Naming** · [TaylorMade QUIVER mark](https://trademarks.justia.com/850/40/quiver-85040094.html) · [Anvil Golf](https://anvilgolf.com) · [Alba golf app](https://apps.apple.com/gb/app/alba-find-golfers-book-games/id6749025396) · [ALBA Net Japan](https://play.google.com/store/apps/details?id=ggmg.com.golfnettv) · [Fescue & Dunes](https://fescueanddunes.com/) · [Meridian Putters at Golf Galaxy](https://www.golfgalaxy.com/f/meridian-golf-putters) · [Vantage Golf](https://vantage.golf/) · [Tour Tempo](https://tourtempo.com/pages/tour-tempo-app) · [Fettle Bike Repair](https://www.fettle.cc/) · [Golf Blueprint](https://www.golfblueprint.com/) · [Swardspeak](https://en.wikipedia.org/wiki/Swardspeak)

---

*Prepared by Claude for Brett, AL Performance. Version 1.2, 15 August 2026.*
