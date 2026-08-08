# Data handoff — paste this with the three JSON files

Here's the drill data. Three files:

- **`drills.json`** — 13 drills, already mapped to the `Drill` shape
- **`skills-and-symptoms.json`** — the skill taxonomy and the diagnostic mapping
- **`warmups.json`** — three pre-round routines plus two optional add-on blocks

---

## How the tagging works

Each drill carries three independent dimensions:

1. **`category`** — where on the course it lives (chipping, wedges, putting, driving)
2. **`primarySkill` and `skills[]`** — what it actually trains, from the nine skills in
   `skills-and-symptoms.json`
3. **Symptoms** — plain-English problems a golfer would report, each mapping to
   categories and skills. This drives the diagnostic feature later.

Category and skill are orthogonal on purpose. Two chipping drills can train completely
different things, and the generator needs to know the difference.

**All of this tagging is my authored judgement, not measured data.** Treat it as a
starting point that will be corrected once real scores exist. Don't build anything that
presents it to users as if it were empirical.

---

## What to do with it

**Add `primarySkill` and `skills: string[]` to the `Drill` type.** Load the skill and
symptom definitions as static data. Don't build the diagnostic UI yet — I just want the
data model to support it.

**Use skills in the generator, not just category.** Balance a session on primary skill as
well as shot type. Three distance-control drills in a row is a poor 45 minutes even if
each one is good. Same rule for pressure: one pressure block per session unless the
session is over 45 minutes.

**`metric.myTarget`** is my personal target as a 9 handicap. Treat it as the "Under 9"
band and leave the other bands empty. I'd rather have four honest bands later than ten
invented ones now. The benchmark strip in the session runner should show only bands that
have real values, and say so plainly when there's nothing to compare against.

**`minMinutes` is missing from every drill.** Please add sensible values and tell me which
ones you weren't confident about, so I can check them against how they actually run.

**Two drills need special handling**, flagged with a `special` field:
- `carry_table` (Carry Numbers) — needs a 3×2 input grid: three wedges by two swing
  lengths, storing carry distances, and computing the largest gap between consecutive
  numbers as the score
- `random_yardage_20_100` (Draw and Hit) — needs a generator that draws a random yardage
  between 25 and 75 before each shot

**`mode: 'course'`** covers the four Ghost Nine drills. They require the `course`
capability and must **never** appear in a generated practice session — they're standalone
things you do while playing. Filter them out of the generator entirely and surface them in
a separate section of the Drills tab.

---

## Warmups: keep them separate from the generator

A warm-up is not a practice session. Its purpose is readiness before a round, so the
sequence is fixed by design — stretch, then wedges, then irons, then driver, then the
first tee. A generator that shuffles that order would make it worse.

So: two entry points on the Today screen.

- **Practice** → the generator (time × venue → session)
- **Warm up** → pick 15, 30 or 60, with the greens and short-game blocks as optional
  toggles

The 60-minute routine is 50 minutes of core blocks; adding the greens block brings it to
the hour. That's intentional.

The generator *should* still open its sessions with a brief loosener, but a two-minute
one it composes itself, not one of these full routines.

---

## Known gaps — do not paper over these

The library currently cannot serve:

- **Flight and spin** — no drills at all
- **Green reading** — one drill touches it incidentally
- **Strike** — never a primary skill, only secondary on two drills
- **Bunkers** — no drills, so that symptom returns nothing
- **Net-only and at-home practice** — no drill requires `net` or `home`

I'm adding these in a later batch. For now, when a venue or symptom has no matching
drills, say so honestly rather than returning a weak session. A message like "nothing in
the library fits a net yet" is better than three putting drills for someone standing in
a net bay.
