# Senda — Design Tokens
### Canonical colour reference for both themes

**Project:** MGA · **Product:** Senda · **Version:** 1.0 · **Date:** 5 September 2026

> **This file supersedes §5.3 of `Golf-App-Master-Brief.md`** (dark mode) and the dark half of §5.4
> (chart colours). §5.2 light mode, §5.5 typography and §5.6 shape and motion are unchanged and still
> live in the brief. Where this file and the brief disagree about a dark-mode value, **this file wins.**

---

## 1. Why dark mode changed

The first dark palette — near-black ground, emerald brand, lime accent — was measured against a
competitor app and found to be functionally identical in the places that matter. Sampled from a
screenshot of the live app, compared in OKLab (ΔE×100, where under 8 reads as *the same colour*):

| Element | Theirs | Old Senda dark | ΔE | Verdict |
|---|---|---|---|---|
| **Card surface** | `#161618` | `#141C19` | **2.2** | The same colour — and it's the largest area on both screens |
| Bright green | `#6BDD7B` | `#C9F24C` lime | 12.3 | Same family |
| Green again | `#6BDD7B` | `#35B084` brand | 14.4 | Same family |
| Page ground | `#020202` | `#0B1310` | 9.4 | Both read as black |

Two problems compounded. We were carrying **two greens, both in their family** — a mint-ish brand
green *and* a lime accent, with their single green sitting between the two. And the card surface, the
biggest area on the screen, was indistinguishable.

**The fix was three moves, not a hue swap:**

1. **Lift and tint the card** so it stops being their grey.
2. **Stop lightening Fairway into mint for dark mode.** In dark mode, green is a **fill colour only** —
   never the primary button, never the third chart series. Those two were what read as generic.
3. **Let a warm bone carry the primary action**, which is the job their bright green button does.

The result inverts the reference app rather than fleeing it: *their* green is the button on a black
ground; *ours* is the ground, with a bone button. Senda keeps green as its brand colour instead of
surrendering it.

| Palette | Ground ΔE | Card ΔE | Accent ΔE | Contrast |
|---|---|---|---|---|
| Old — Emerald & Lime | 9.4 | **2.2** | 12.3 | Too close |
| **Forest & Bone** | **14.0** | **10.4** | **19.9** | All AAA |

---

## 2. Light mode — unchanged

Nothing in light mode changes. The linen-and-Fairway palette the website already ships is correct.

| Role | Token | Hex | Contrast on page |
|---|---|---|---|
| Page | `--bg-page` | `#F5F3EE` | — |
| Card | `--bg-card` | `#FFFFFF` | — |
| Sunken | `--bg-sunken` | `#EDEAE2` | — |
| Ink primary | `--ink-1` | `#0D1A15` | **16.11 : 1** AAA |
| Ink secondary | `--ink-2` | `#4C5C55` | **6.38 : 1** AA |
| Ink muted | `--ink-3` | `#7C8A84` | 3.25 : 1 — labels and axis ticks only |
| Hairline | `--line` | `#E3E0D8` | — |
| Fairway (brand) | `--brand` | `#0B5C42` | **7.22 : 1** AAA |
| Fairway pressed | `--brand-press` | `#08402E` | — |
| Fairway tint | `--brand-tint` | `#E6F0EB` | — |
| Primary button bg | `--btn-bg` | `#0B5C42` | — |
| Primary button text | `--btn-fg` | `#FFFFFF` | 8.00 : 1 AAA on brand |
| **Moment** | `--moment` | `#C9F24C` | 1.16 : 1 — **fill only.** Ink on it = 13.85 : 1 AAA |
| Moment text | `--on-moment` | `#0D1A15` | — |
| Good | `--good` | `#146B3A` | 5.93 : 1 AA |
| Warning | `--warn` | `#8A5A00` | 5.34 : 1 AA |
| Critical | `--crit` | `#B3261E` | 5.89 : 1 AA |

---

## 3. Dark mode — Forest & Bone

Contrast measured against the card surface `#1C332A` unless stated.

| Role | Token | Hex | Contrast |
|---|---|---|---|
| Page | `--bg-page` | `#0E1F19` | ink on page **15.59 : 1** AAA |
| Card | `--bg-card` | `#1C332A` | — |
| Sunken / elevated | `--bg-sunken` | `#274134` | — |
| Hairline | `--line` | `#33513F` | — |
| Ink primary | `--ink-1` | `#F0F6F1` | **12.31 : 1** AAA |
| Ink secondary | `--ink-2` | `#AEC2B4` | **7.18 : 1** AAA |
| Ink muted | `--ink-3` | `#7E9488` | 4.16 : 1 — labels and axis ticks only |
| **Green (fills only)** | `--brand` / `--signal` | `#58B98C` | 5.61 : 1 AA |
| Green pressed | `--brand-press` | `#4AA87D` | — |
| Green tint | `--brand-tint` | `#274134` | — |
| **Bone — primary button** | `--btn-bg` / `--bone` | `#EFE6D2` | **10.87 : 1** AAA |
| Bone pressed | `--bone-press` | `#DCD2BB` | — |
| Button text | `--btn-fg` | `#0E1F19` | **13.77 : 1** AAA on bone |
| **Moment** | `--moment` | `#EFE6D2` | — |
| Moment text | `--on-moment` | `#0E1F19` | — |
| Good | `--good` | `#6FD3A2` | **7.40 : 1** AAA |
| Warning | `--warn` | `#E8B44F` | **7.11 : 1** AAA |
| Critical | `--crit` | `#FF8A7E` | 5.90 : 1 AA |

### 3.1 The three rules that keep it distinct

These are the load-bearing decisions. If a future session "helpfully" reverts any of them, the
palette collapses back into the generic look it was designed out of.

1. **Green is never the primary button in dark mode.** Bone is. A bright green CTA on a dark ground
   is the single most recognisable signature of the app this was audited against.
2. **Green is never the third chart series in dark mode.** See §4 — it collides with the ground.
3. **The moment colour differs by theme.** Lime in light, bone in dark. It is reserved for
   *completion and promotion* — the session-complete badge, the Marker progress bar, a Marker
   promotion. Routine progress (the Your Focus bar, phase bars, streak dots) uses green. Because the
   moment colour appears rarely, it lands when it does; spending it on routine progress wastes it.

---

## 4. Chart colours

**Rule 1 — most charts are single-series and must not use categorical colour.** "Shots lost by area"
is one measure across four categories: a magnitude comparison. One hue, focus item emphasised.

Sequential ramp, light (on linen) — unchanged:
`#DCEBE4` · `#B9D7C9` · `#8DBDA8` · `#5C9E82` · `#2E7D5D` · **`#0B5C42` focus** · `#08402E`

Sequential ramp, dark (on `#1C332A`) — **new**, and it runs the other way because the ground is dark:

| Step | Hex | Contrast on card | OKLCH L |
|---|---|---|---|
| 100 | `#2B4A3B` | 1.38 | 0.380 |
| 200 | `#356551` | 2.01 | 0.466 |
| 300 | `#3F8168` | 2.92 | 0.552 |
| 400 | `#4A9E7E` | 4.17 | 0.638 |
| **500 — focus** | **`#58B98C`** | **5.61** | 0.715 |
| 600 | `#7ACFA6` | 7.26 | 0.789 |
| 700 | `#A3E2C4` | 9.15 | 0.862 |

Lightness steps are even (ΔL 0.073–0.086), so the ramp reads as ordered. Steps 100–300 sit under 3:1
against the card — fine for large filled areas, but **they must carry direct labels**, which the brief
already mandates. Never use them for thin marks or text.

**Rule 2 — genuine multi-series charts cap at three concurrent series.**

| Slot | Light | Dark | Change |
|---|---|---|---|
| 1 | `#2A78D6` | `#3987E5` | — |
| 2 | `#EB6834` | `#D95926` | — |
| 3 | `#1BAF7A` | **`#E0D6BE`** | **was `#199E70`** |

The old dark slot 3 was a green sitting **ΔE 9.5 from the fill green** — in a chart it would read as
"the brand colour" rather than as a third series, on a green ground. Bone fixes it decisively.
Validated with all pairs in play on the new card surface:

| Dark trio | Worst normal-vision ΔE (floor 15) | Worst colourblind ΔE (target 8) |
|---|---|---|
| Old — blue / orange / green | 20.9 | 9.3 |
| **New — blue / orange / bone** | **29.7** | **26.0** |

A violet third slot was tested and **failed** (normal-vision 14.7, colourblind 4.7). Bone is the
answer, not a preference.

**Rule 3 — never a dual-axis chart.** Two measures of different scale → two charts, or index to a
common base.

**Rule 4 — text never wears the series colour.** Values and labels stay in ink; a small coloured dot
beside them carries identity.

**Rule 5 — status colours always ship with an icon and a label**, never colour alone.

---

## 5. CSS — ready to paste

Drop straight into `assets/css/senda.css`, replacing the existing token block. Every page picks it up,
both themes, no other change needed.

```css
:root{
  --bg-page:#F5F3EE; --bg-card:#FFFFFF; --bg-sunken:#EDEAE2;
  --ink-1:#0D1A15; --ink-2:#4C5C55; --ink-3:#7C8A84; --line:#E3E0D8;
  --brand:#0B5C42; --brand-press:#08402E; --brand-tint:#E6F0EB;
  --signal:#C9F24C;
  --btn-bg:#0B5C42; --btn-fg:#FFFFFF;
  --bone:#EFE6D2; --bone-press:#DCD2BB;
  --moment:#C9F24C; --on-moment:#0D1A15;
  --good:#146B3A; --warn:#8A5A00; --crit:#B3261E;
  --g100:#DCEBE4; --g200:#B9D7C9; --g300:#8DBDA8; --g400:#5C9E82;
  --g500:#2E7D5D; --g600:#0B5C42; --g700:#08402E;
  --s1:#2A78D6; --s2:#EB6834; --s3:#1BAF7A;
  --shadow:0 1px 2px rgba(13,26,21,.05);
}

/* ---- FOREST & BONE (dark) ----
   Green is the ground, bone is the action. Green is never the primary button
   and never the third chart series — both of those were what read as generic. */
[data-theme="dark"]{
  --bg-page:#0E1F19; --bg-card:#1C332A; --bg-sunken:#274134;
  --ink-1:#F0F6F1; --ink-2:#AEC2B4; --ink-3:#7E9488; --line:#33513F;
  --brand:#58B98C; --brand-press:#4AA87D; --brand-tint:#274134;
  --signal:#58B98C;
  --btn-bg:#EFE6D2; --btn-fg:#0E1F19;
  --bone:#EFE6D2; --bone-press:#DCD2BB;
  --moment:#EFE6D2; --on-moment:#0E1F19;
  --good:#6FD3A2; --warn:#E8B44F; --crit:#FF8A7E;
  --g100:#2B4A3B; --g200:#356551; --g300:#3F8168; --g400:#4A9E7E;
  --g500:#58B98C; --g600:#7ACFA6; --g700:#A3E2C4;
  --s1:#3987E5; --s2:#D95926; --s3:#E0D6BE;
  --shadow:0 1px 2px rgba(0,0,0,.35);
}

/* Buttons are theme-driven, not hard-coded to the brand colour */
.btn{ background:var(--btn-bg); color:var(--btn-fg); }
.btn:active{ background:var(--brand-press); }
[data-theme="dark"] .btn:active{ background:var(--bone-press); }

/* The hero card is a green block in light, a surface card in dark */
.hero{ background:var(--brand); color:#fff; }
[data-theme="dark"] .hero{
  background:var(--bg-card); border:1px solid var(--line); color:var(--ink-1);
}
[data-theme="dark"] .hero .btn{ background:var(--bone); color:#0E1F19; }
```

**One structural note for whoever implements it.** The hero card is not a token swap. In light mode
it is a solid Fairway-green block; in dark it becomes a surface card with a bone button. If you leave
it as a green block in dark mode, the biggest element on the screen stays green and the palette does
not read as changed — that was the flaw in the first round of options.

---

## 6. What was considered and rejected

| Option | Ground ΔE | Card ΔE | Accent ΔE | Why not |
|---|---|---|---|---|
| **Forest & Bone** | 14.0 | 10.4 | 19.9 | **Chosen.** Best contrast, keeps green as the brand |
| Clay & Terracotta | 11.6 | 6.9 | **25.4** | Furthest on colour and the warm ground ties to light mode's linen — but green nearly disappears at night |
| Slate & Amber | 12.5 | 9.0 | 19.5 | Reads as an instrument, which suits a diagnosis product — but closest to a conventional dark UI and so the least distinctive |
| Ink & Ember | 9.1 | — | 20.1 | Ground barely moved from pure black |
| Midnight & Chalk | 7.9 | — | 19.3 | Ground barely moved; cyan and green also sit close under some colour blindness |

Clay stays the best fallback if Forest ever needs replacing.

---

*All ΔE figures are OKLab ×100. Contrast ratios are WCAG. Both were computed, not estimated.
Reference-app values were sampled from a screenshot and are approximate to within antialiasing.*
