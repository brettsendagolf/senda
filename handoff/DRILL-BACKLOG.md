# Drill backlog

Gaps in the library, found by running a coverage report over the skill tags. Each of
these means a golfer with that problem currently gets nothing useful.

Roughly in priority order.

---

## 1. Strike — highest priority

**Currently:** primary skill on zero drills, secondary on two.

Mid-handicappers' most common complaint is contact — thin, fat, off the toe. It's the
first thing that breaks and the first thing they notice. An app aimed at this golfer
having no drill that trains strike as its main job is the biggest hole in the library.

Wants: low point control, ball-first contact, centre-face strike. Ideally some that work
into a net, since strike is one of the few things a net gives honest feedback on.

Target: 4 drills, at least 2 net-compatible.

---

## 2. Bunkers

**Currently:** zero drills. The symptom "I can't get out of bunkers first time" returns
nothing at all.

The `bunker` capability exists in the model but nothing uses it. Worth 3 drills covering
splash consistency, distance control from sand, and the longer bunker shot.

Target: 3 drills.

---

## 3. Net and at-home practice

**Currently:** no drill requires `net` or `home`.

This is the corner of the market nobody serves and the reason the facility-aware
generator is worth building. Right now the app can't actually deliver on its own premise
for someone with a net in the garage or a carpet in February.

Wants: strike and tempo work into a net, putting on carpet, grip and setup rehearsal,
alignment work, short putting gates indoors.

Target: 5 drills — 3 net, 2 home.

---

## 4. Flight and spin

**Currently:** zero drills.

Trajectory control, roll out, hitting it lower into wind, taking spin off. This is more
of a lower-handicap concern so it can wait, but the skill exists in the taxonomy and
nothing serves it.

Target: 2–3 drills.

---

## 5. Green reading

**Currently:** one drill touches it incidentally.

Reading slope and break is a distinct skill from stroke mechanics and start line. Harder
to drill well, and harder to score, which is probably why it's underserved everywhere.
Worth 2 drills.

Target: 2 drills.

---

## Approach

Add in batches, not all at once. After each batch, check whether the new drills actually
get selected by the generator across a spread of time and venue combinations. A drill
that never gets picked is either badly tagged or genuinely redundant, and it's better to
find that out with five new drills than with thirty.

Re-run the coverage report after each batch.
