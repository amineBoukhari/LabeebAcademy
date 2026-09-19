# Labeeb Academy — Color Audit & Light Mode Proposal

Scope: this document audits the color system actually implemented in `src/styles/global.css` and the `.astro` components/screens (not the `.dc.html` design-canvas source files), and proposes a complete light-mode palette as dark → light token tables. It does not cover accessibility, performance or responsive behavior beyond color/contrast — run `/impeccable audit` separately for the full technical pass.

---

## 1. How the current (dark) system actually works

Labeeb Academy today is **dark-only**. There is no theme switch, no `prefers-color-scheme` handling, and no `[data-theme]` attribute anywhere in the codebase.

Six tokens are declared in `src/styles/global.css`:

```css
@theme {
  --color-bg: #0a0a0a;
  --color-ink: #ffffff;
  --color-acc: #2ee6a6;
  --color-gold: #c9a961;
  --color-travel-deep: #062522;
  --color-travel-mid: #123a2c;
}
```

**Finding — `--color-ink` is dead code.** It's declared but `text-ink` / `bg-ink` never appear in `src/` (0 matches across 124 uses of `text-white`). Every heading and body string is hand-typed as `text-white` or `text-white/NN`, and every hairline border is `border-white/NN`. This is the single biggest reason light mode can't be a CSS variable flip today: the codebase never routes text/border color *through* a token in the first place, so there's nothing to redefine per-theme. Section 5 covers the fix.

**Finding — brand hues only work as text because the background is near-black.** `#2ee6a6` on `#0a0a0a` is 12.2:1 and `#c9a961` on `#0a0a0a` is 8.8:1 — both comfortably pass WCAG AA as running text. Neither comes close on a light background (1.5:1 and 2.1:1 — see §3.2). Any light-mode plan has to introduce darkened "ink" variants of the brand hues for text use, while keeping the originals for buttons/glows/large type. This is the second load-bearing decision below.

**Finding — the same opacity number reads differently on light vs. dark.** White-on-black and near-black-on-paper are not mirror images at matched alpha: `white/45` on `#0A0A0A` is 4.50:1, but `ink/45` on a warm paper bg is only 3.13:1 (paper's luminance ceiling is lower than pure black's floor is high, and the sRGB contrast curve isn't symmetric). A naive find-replace of `white/NN` → `ink/NN` will under-contrast every secondary/tertiary text tier in light mode. §3.3 gives calibrated replacement opacities, not a 1:1 swap.

---

## 2. Current dark-mode color inventory

### 2.1 Core brand tokens

| Role | Token | Hex | Used for |
|---|---|---|---|
| Page background | `--color-bg` / `bg-bg` | `#0A0A0A` | `<body>`, base canvas everywhere |
| Primary text token (unused) | `--color-ink` | `#FFFFFF` | declared, never referenced |
| Accent (brand) | `--color-acc` / `acc` | `#2EE6A6` | links, active nav, CTA buttons, bullet marks, focus borders |
| Gold (VIP / prestige) | `--color-gold` / `gold` | `#C9A961` | Présentielle + Notre Équipe eyebrows, glows |
| Travel deep | `--color-travel-deep` | `#062522` | Travel page ink-on-light-button text, dark scrims |
| Travel mid | `--color-travel-mid` | `#123A2C` | Travel/CTA-band gradients |

### 2.2 Hardcoded (non-token) colors found in components/screens

| Value | Where | Role |
|---|---|---|
| `#0E0E0E` | `Header.astro` dropdown/mobile menu panel | elevated dark surface, literal hex, not a token |
| `#F3EFE6` (+ `rgba(243,239,230,0.6)`) | `Home.astro` hero | Arabic wordmark "لبيب" + "Academy" caption, inline `style=`, not a token |
| `rgba(46,230,166,0.1–0.75)` | Home/FormationDetail/Story hero & section blooms, Button hover shadow | soft accent "glow" radials, always against near-black |
| `rgba(201,169,97,0.12–0.14)` | Team/Présentielle/Travel hero blooms | soft gold glow radials |
| `rgba(6,32,31,…)`, `rgba(6,37,34,…)`, `rgba(11,63,69,…)`, `rgba(12,74,78,…)` | Home/Travel teal band + Travel hero scrim | Travel's teal identity gradient, layered stops |
| `#123A2C → #0A0A0A` radial | Home / Team / Story / OnlineIndex CTA-booking section | "segment band" that breaks up long dark pages |

### 2.3 Text opacity scale (white on `#0A0A0A`)

This is the real typographic system — a single hue (white) modulated by opacity, not a discrete palette:

| Utility | Flattened hex | Contrast on `#0A0A0A` | WCAG AA (4.5:1) | Typical use |
|---|---|---|---|---|
| `text-white` (100%) | `#FFFFFF` | 19.80 | ✅ | H1–H6, primary labels |
| `text-white/90` | `#E7E7E7` | 15.94 | ✅ | emphasis |
| `text-white/80` | `#CECECE` | 12.58 | ✅ | strong body |
| `text-white/70` (most common) | `#B6B6B6` | 9.71 | ✅ | lede paragraphs, form input text |
| `text-white/65` | `#A9A9A9` | 8.45 | ✅ | bullets, testimonial quotes |
| `text-white/60` | `#9D9D9D` | 7.30 | ✅ | nav links (inactive) |
| `text-white/50` | `#858585` | 5.33 | ✅ | field labels, stat captions |
| `text-white/45` | `#787878` | 4.50 | ✅ (borderline) | footer, form notes |
| `text-white/40` | `#6C6C6C` | 3.77 | ❌ | dropdown meta ("12 formations") |
| `text-white/35` | `#606060` | 3.14 | ❌ | `Photo` placeholder label (intentionally low — it's a construction marker, not content) |

### 2.4 Borders / dividers (white on `#0A0A0A`)

| Utility | Contrast | Use |
|---|---|---|
| `border-white/10` | 1.25 | header/footer/section hairlines (decorative) |
| `border-white/12` | 1.33 | dropdown panel border, bullet-list top rule |
| `border-white/22` | 1.91 | form input/select underline (functional, sub-3:1 already today) |
| `border-white/25` | 2.14 | outline-button border, mobile menu trigger |

---

## 3. Proposed light-mode system

### 3.1 Design principle

Keep the brand hues (`acc` green, `gold`, travel teal) exactly as-is — that's the identity. Change three things only:
1. **Flip the base neutrals**: `bg` goes from near-black to warm paper; `ink` goes from white to near-black (this finally puts the dead `--color-ink` token to work).
2. **Add "-ink" text-safe variants of the brand hues** for small/running text, since the raw hues don't pass AA on a light ground. Keep the raw hues for buttons, large display type, and glows, where they still work.
3. **Recalibrate opacity stops**, not mirror them (per §1's asymmetry finding).

### 3.2 Core tokens — dark → light

| Token | Role | Dark value | Light value | Notes |
|---|---|---|---|---|
| `--color-bg` | page background | `#0A0A0A` | `#FAF8F4` warm paper | not pure white — matches the brand's existing cream (`#F3EFE6`, §3.6) instead of a clinical `#FFFFFF` |
| `--color-surface` *(new token)* | elevated panel (dropdown, mobile menu, cards) | `#0E0E0E` | `#FFFFFF` | one perceptible step up from `bg`, same relationship as dark mode's `#0E0E0E` vs `#0A0A0A` |
| `--color-ink` | primary text | `#FFFFFF` | `#0A0A0A` | reuses the existing dead token — now actually wired to `text-ink` everywhere (see §5) |
| `--color-acc` | brand accent — buttons, large type, glows | `#2EE6A6` | `#2EE6A6` (unchanged) | 1.5:1 on paper — fine for a filled button surface, fails as text |
| `--color-acc-ink` *(new token)* | brand accent, small/running text | *(none — `acc` itself passes on dark)* | `#0F7A52` | 5.04:1 on `#FAF8F4` — AA pass, reads as a deep emerald, same hue family |
| `--color-gold` | VIP accent — large type, glows | `#C9A961` | `#C9A961` (unchanged) | 2.1:1 on paper — fine for backgrounds, fails as text |
| `--color-gold-ink` *(new token)* | VIP accent, small/running text | *(none)* | `#7C6530` | 5.26:1 on `#FAF8F4` — AA pass, reads as antique bronze-gold |
| `--color-travel-deep` | Travel dark teal | `#062522` | `#062522` (unchanged) | already 15.3:1 on paper — works as text *and* stays the ink color for buttons |
| `--color-travel-mid` | Travel mid teal | `#123A2C` | `#123A2C` (unchanged) | 11.9:1 on paper |
| `--color-travel-mist` *(new token)* | Travel section tint (light-mode only) | *(none — dark uses `#123A2C→#0A0A0A`)* | `#E7F3EE` | pale mint panel, see §3.5 |

**Why the brand hues stay identical in both modes**: WCAG contrast is a luminance calculation, blind to hue/saturation. `#2EE6A6` sitting on `#FAF8F4` measures only 1.5:1, yet a saturated mint-green button on a pale cream page reads as clearly distinct to the eye — the formula undercounts saturated-color-vs-desaturated-background pairs. Treat that 1.5:1 as informational, not a failure, for filled buttons/large graphic elements; but don't use it to justify raw `acc`/`gold` as small text color — that case *is* a real legibility failure, which is exactly what the `-ink` variants fix.

### 3.3 Text hierarchy — dark → light (calibrated, not mirrored)

| Role | Dark utility | Dark contrast | Light utility *(new: `text-ink/NN`)* | Light contrast | AA 4.5:1 |
|---|---|---|---|---|---|
| H1–H6, primary | `text-white` (100%) | 19.80 | `text-ink` (100%) | 18.67 | ✅ |
| Emphasis | `text-white/90` | 15.94 | `text-ink/90` | 15.03 | ✅ |
| Lede paragraphs | `text-white/70` | 9.71 | `text-ink/80` | 10.78 | ✅ |
| Bullets, quotes | `text-white/65` | 8.45 | `text-ink/75`\* | ~8.0 | ✅ |
| Nav links (inactive) | `text-white/60` | 7.30 | `text-ink/70` | 7.43 | ✅ |
| Field labels, stat captions | `text-white/50` | 5.33 | `text-ink/65` | 6.17 | ✅ |
| Footer, form notes | `text-white/45` | 4.50 (borderline) | `text-ink/60` | 5.16 | ✅ |
| Dropdown meta text | `text-white/40` | 3.77 ❌ | `text-ink/50`\* | ~4.4 | ⚠️ near-pass |
| Placeholder label (`Photo` component) | `text-white/35` | 3.14 ❌ | `text-ink/40` | 2.69 | ❌ *(intentional — construction marker, matches existing dark-mode non-AA status, not a new regression)* |

\* not in the precomputed table below; interpolated — verify against the swatch table in §3.7 before shipping.

**Why the light-mode numbers are higher percentages than the dark ones at each tier**: this is the direct fix for the §1 asymmetry finding. If you instead did a literal `white/NN → ink/NN` swap, lede paragraphs would drop from 9.71:1 to 7.43:1 and footer text would drop from 4.50:1 (already borderline) to 3.13:1 (fail). The table above keeps every tier at or above its dark-mode AA status.

### 3.4 Borders / dividers — dark → light

| Role | Dark utility | Light utility | Notes |
|---|---|---|---|
| Section/header/footer hairline (decorative) | `border-white/10` | `border-ink/12` | slightly bumped — a warm paper hairline needs a touch more weight than a near-black one to stay visible |
| Dropdown panel border, bullet rule | `border-white/12` | `border-ink/14` | |
| Form input/select underline (functional) | `border-white/22` | `border-ink/30` | pre-existing dark-mode gap (1.91:1, under the 3:1 UI-component threshold) — light mode is bumped further since the warm paper background has less inherent separation from a faint gray line than black does; still not a full WCAG 1.4.11 fix, flagged as P2 in §6 |
| Outline-button border, mobile menu trigger | `border-white/25` | `border-ink/32` | |
| Focus / active state (`border-acc`) | `border-acc` (`#2EE6A6`) | `border-acc-ink` (`#0F7A52`) | use the text-safe variant here too — a focus ring is a UI component under 1.4.11, and the darker green holds up at 3:1+ against paper where raw `#2EE6A6` (1.5:1) would not |

### 3.5 Surfaces & section backgrounds

| Surface | Dark | Light | Notes |
|---|---|---|---|
| Page canvas | `bg-bg` `#0A0A0A` | `bg-bg` `#FAF8F4` | |
| Elevated card / glass panel (`bg-white/[0.04]`) | `#141414` flattened | `bg-ink/[0.04]` → `#F0EEEB` flattened | subtle warm-gray card, same visual weight relationship as dark mode |
| Services dropdown / mobile menu panel | `#0E0E0E` literal | `#FFFFFF` (`--color-surface`) | |
| Header background (default) | `bg-bg/85` (`Header.astro` default prop) | `bg-bg/85` on paper token | works unchanged once `--color-bg` is retokenized |
| Header background (Travel page override) | `bg-travel-deep/88` | `bg-travel-mist/88` (new `#E7F3EE`-based translucent header) | Travel is the one screen that overrides `headerBg`; needs its own light value or the header will stay dark-teal while the page goes light |
| CTA/segment band (Home, Team, Story, OnlineIndex booking sections) | `radial-gradient(80% 120% at 12% 100%, #123A2C 0%, #0A0A0A 62%)` | `radial-gradient(80% 120% at 12% 100%, #E7F3EE 0%, #FAF8F4 62%)` | pale-mint-into-paper mirrors the dark teal-into-black move; **text inside this section must switch from white/N to ink/N tiers**, it's currently authored assuming a dark local background |
| Photo placeholder frame (`Photo.astro`) | `border-white/10` + `bg-white/5` | `border-ink/12` + `bg-ink/[0.03]` | |

### 3.6 Special case — Arabic hero wordmark

`Home.astro`'s "لبيـــب / Academy" hero text is hardcoded inline (`style="color:#F3EFE6"`, `style="color:rgba(243,239,230,0.6)"`), not tokenized. On dark mode this cream tone sits warmly on near-black. If the page background becomes a similar warm cream paper (`#FAF8F4`), reusing `#F3EFE6` here would produce near-zero contrast (both are light, close-hued neutrals). Light-mode value must **invert to ink**, not reuse the cream:

| Element | Dark value | Light value |
|---|---|---|
| "لبيـــب" wordmark | `#F3EFE6` | `text-ink` `#0A0A0A` (100%) |
| "Academy" caption | `rgba(243,239,230,0.6)` | `text-ink/70` (`#525150`, 7.43:1) |

### 3.7 Gradients, glows & scrims

| Effect | Dark treatment | Light treatment | Rationale |
|---|---|---|---|
| Accent glow bloom (radial `rgba(46,230,166,0.1–0.22)` behind hero/section art) | full opacity as authored | same hue, **opacity roughly halved** (`0.05–0.11`) | a "glow" reads as light emanating from darkness; at full strength on paper it just looks like a chalky green smudge. Halving keeps the accent-tinted atmosphere without the glow illusion breaking |
| Gold glow bloom (`rgba(201,169,97,0.12–0.14)`) | as authored | halved (`0.06–0.07`) | same reasoning |
| Button hover shadow (`shadow-[…rgba(46,230,166,0.75)]`) | as authored | unchanged | this is a shadow cast *by* the button, not an ambient background glow — reads fine on light |
| Photo scrim overlays (`linear-gradient(180deg, rgba(10,10,10,0)…rgba(10,10,10,0.96))` over hero photography) | as authored | **unchanged** | scrims exist to keep white overlay text legible against a photo, independent of page theme — the photo itself isn't reskinned, so its scrim shouldn't be either |
| Travel hero teal gradient (`rgba(6,32,31,…)/(11,63,69,…)/(12,74,78,…)`) | as authored | **unchanged** | same logic — it's a scrim over the travel photography, not a page-background decision |

---

## 4. Component quick-reference

| Component | Dark | Light |
|---|---|---|
| **Button — outline** | `border-white/25`, hover `border-acc` + `text-acc` | `border-ink/32`, hover `border-acc-ink` + `text-acc-ink` |
| **Button — solid** | `bg-acc` `#2EE6A6` + `text-bg` (`#0A0A0A`) | unchanged — `bg-acc` + `text-ink` (`#0A0A0A`); self-contained, doesn't depend on page theme |
| **Contact form — text/select underline** | `border-white/22`, focus `border-acc` | `border-ink/30`, focus `border-acc-ink` |
| **Contact form — field label** | `text-white/50` | `text-ink/65` |
| **Contact form — submit button** | `bg-acc` + prop `ink` (defaults `text-bg`, Travel passes `text-travel-deep`) | unchanged in both cases — both ink values already pass AA on the green fill regardless of page theme |
| **Header — logo mark** | white polygon + `bg-acc` corner | `bg-ink` polygon + `bg-acc` corner (logo must invert with the page, not stay white on white) |
| **Header — nav link (active)** | `text-acc` | `text-acc-ink` |
| **Header — nav link (inactive)** | `text-white/60` | `text-ink/70` |
| **Footer** | `border-white/10`, `text-white/45` | `border-ink/12`, `text-ink/60` |

---

## 5. Implementation note

The blocker isn't picking colors (§2–4 above are ready to use) — it's that **text/border color is never routed through a token today**. `text-white/70` is a Tailwind utility resolving straight to `rgba(255,255,255,0.7)`; there's no variable in between to redefine per-theme.

Recommended path:
1. Extend `@theme` with the new tokens from §3.2 (`--color-surface`, `--color-acc-ink`, `--color-gold-ink`, `--color-travel-mist`), and actually wire `--color-ink` so it flips with theme (Tailwind v4 supports this via a `@theme` block re-declared under a `[data-theme="light"]`/`.light` selector, or CSS custom properties redefined outside `@theme` and referenced from it).
2. Do a project-wide pass replacing `text-white/NN` → `text-ink/NN` and `border-white/NN` → `border-ink/NN` (mechanical, but touches every screen — `Header`, `Footer`, `Button`, `ContactForm`, `Photo`, and all 8 screens under `src/screens/`).
3. Add a `<html data-theme>` toggle (system-preference default via `prefers-color-scheme`, with a manual override persisted to `localStorage`) in `Base.astro`.
4. Re-author the six inline `style="background:…"` gradients (§2.2, §3.5, §3.7) as theme-aware — these are the one place colors are typed directly into markup instead of any utility/token, so they won't respond to a `[data-theme]` flip without being touched by hand.

---

## 6. Priority findings

- **P1** `--color-ink` token exists but is unused; 124 raw `text-white` occurrences bypass it. Blocks any theming work, not just light mode.
- **P1** Raw `acc`/`gold` hues fail AA as text on any light background (1.5:1 / 2.1:1) — light mode must not reuse them for small text; use the `-ink` variants in §3.2.
- **P2** Form input underlines (`border-white/22`) are already under the 3:1 non-text contrast threshold in the *current* dark mode (1.91:1) — worth fixing regardless of light-mode work.
- **P2** Six background gradients are hand-typed inline `style=` strings, not tokens — they're invisible to any future theme switch and need manual light-mode authoring (§3.5, §3.7).
- **P3** `Photo` placeholder label and dropdown meta text sit below AA in dark mode already (`white/35`, `white/40`); light-mode equivalents inherit the same status rather than introducing a new one — acceptable for non-content placeholder/meta text, but flagging for completeness.

**Suggested next command**: once tokens from this doc are wired in, `/impeccable audit` for the full accessibility/performance/responsive pass, or `/impeccable polish` after implementation to catch anything the color swap disturbs visually.
