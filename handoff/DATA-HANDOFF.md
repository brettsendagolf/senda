# Data handoff — paste this with the JSON files

Six files:

| File | What it is |
|---|---|
| `capabilities.json` | Facility capabilities, equipment list, session length limits |
| `drills.json` | Original 13 drills |
| `drills-batch-2.json` | 14 new — strike, bunkers, net |
| `drills-batch-3-home.json` | 8 new — home practice |
| `skills-and-symptoms.json` | Skill taxonomy and the diagnostic mapping |
| `warmups.json` | Three pre-round routines plus two add-on blocks |

**35 drills total.** Merge the three drill files into one library — they're split only
because they were written in batches.

---

## Capabilities have changed since the brief

The single `range` capability is gone. It's now two:

- **`range_grass`** — hitting off turf
- **`range_mat`** — hitting off artificial mats

A venue can have both, which handles "range with grass bays and mat bays" without
needing a third option. Three drills are grass-only because they need real turf
interaction: Divot Line, Towel Drop and Five to Pass.

Six drills carry a **`surfaceNote`** — an honest caveat rather than a block. Mats hide
fat shots because the sole skids rather than digs, so a strike drill on a mat is
weakened but not useless. Show the note when the venue is mats-only.

`home` is also gone, replaced by three:

- **`home_putting`** — carpet or mat, putter only
- **`home_swing`** — room for a small swing with foam balls
- **`home_mirror`** — no ball, no space, rehearsal only

Full list with labels and help text is in `capabilities.json`.

---

## Equipment

Every drill has an `equipment` array. Empty means it needs nothing but a club.

Venues declare what equipment is available. **A drill is eligible only if the venue has
every item it needs.** Someone at home with a mirror and no towel should not be offered
Towel Connection.

Equipment list is in `capabilities.json`. Keep it short and let users tick items on a
venue.

---

## Session length limits

`capabilities.json` has a `limits` block with two numbers per capability:

- **`maxBlockMinutes`** — the longest one session should spend on that single activity
- **`maxSessionMinutes`** — legacy, kept for reference. Use the additive rule below.

### The additive rule

Session ceiling = **sum** of `maxBlockMinutes` across the venue's capabilities, clamped
to the highest `groupCeiling` among them, then rounded **down** to the nearest
`pickerOptions` value.

Switching activity resets attention, so a mirror plus a carpet supports a longer session
than either alone. Worked examples:

| Venue | Raw | Offered |
|---|---|---|
| Mirror only | 15m | up to 15 |
| Carpet only | 20m | up to 20 |
| Mirror + carpet | 35m | up to 30 |
| Mirror + carpet + swing room | 45m | up to 45 |
| Net in the garage | 45m | up to 45 |
| Net + carpet | 60m | up to 60 |
| Grass range + short game + bunker + green | 60m | up to 60 |

**Within a session, no single capability may exceed its own `maxBlockMinutes`.** That
constraint is what makes combining safe: 15 minutes of mirror work plus 20 on the carpet
is a good 35 minutes, 35 minutes of mirror work is not.

The time picker shows only the options at or below the computed ceiling. Someone with a
mirror and nothing else should never be asked whether they'd like 45 minutes.

## Honesty rule

When a venue and equipment combination yields fewer than three eligible drills, **say so
and offer what exists**. Never pad with drills that don't fit.

> "Two drills fit a mirror and nothing else. Here they are — about 14 minutes."

That's a better product than a fake session, and it tells the user exactly what to add
to get more.

---

## Everything else from the original handoff still applies

- Tagging is my authored judgement, not measured data. Don't present it as evidence.
- Use `primarySkill` to balance sessions, not just `category`. Three distance-control
  drills in a row is a poor 45 minutes.
- `metric.myTarget` is my personal target as a 9 handicap. Treat it as the "Under 9"
  band and leave other bands empty until there's real data.
- `minMinutes` is set on the new drills but missing on the original 13. Please add and
  flag anything you weren't confident about.
- Two drills need custom input: `carry_table` (Carry Numbers) and
  `random_yardage_20_100` (Draw and Hit).
- `mode: 'course'` — the four Ghost Nine drills. Never include in a generated session.
- Warmups stay as presets, separate from the generator.

---

## Remaining gaps

Still nothing for **flight and spin** or **green reading**. Both are deliberate for now
— flight work needs visible ball flight and is a lower-handicap concern, and green
reading is hard to score honestly. They're on the backlog, not forgotten.
