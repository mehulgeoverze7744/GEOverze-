# GEOverze — Design System

**Status:** Official, living document
**Audience:** Designers, developers, AI assistants, future contributors
**Authority:** This document defines the official GEOverze visual language. All future pages and components must follow it.
**Source of truth for values:** `src/styles.css`. This document explains the tokens; the stylesheet defines them.
**Companion documents:** [`docs/geoverze-prd.md`](./geoverze-prd.md) (product behaviour), [`docs/geoverze-roadmap.md`](./geoverze-roadmap.md) (sequencing).

---

## Table of Contents

1. [Brand Identity](#1-brand-identity)
2. [Design Philosophy](#2-design-philosophy)
3. [Color System](#3-color-system)
4. [Typography](#4-typography)
5. [Spacing System](#5-spacing-system)
6. [Layout Principles](#6-layout-principles)
7. [Component Library](#7-component-library)
8. [Glassmorphism](#8-glassmorphism)
9. [Motion Design](#9-motion-design)
10. [Iconography & Imagery](#10-iconography--imagery)
11. [Responsive Design](#11-responsive-design)
12. [Accessibility](#12-accessibility)
13. [Page Templates](#13-page-templates)
14. [Do's and Don'ts](#14-dos-and-donts)
15. [Living Design System](#15-living-design-system)

---

## 1. Brand Identity

| Field | Value |
| --- | --- |
| Project name | **GEOverze** |
| Slogan | **Know Earth** |
| Tagline | **Think Global** |
| Brand mark | Bronze circular emblem: 3D globe centred, "GEOVERSE" arched above, "Know Earth" below |
| Core accent | Bronze |
| Core surface | Deep-space near-black |

### 1.1 Personality

| Trait | How it shows up visually |
| --- | --- |
| **Premium** | Restraint, precision spacing, metallic accents, no visual noise |
| **Intelligent** | Clear hierarchy, honest labelling, data presented calmly |
| **Inspiring** | Cinematic scale, atmospheric depth, the globe as a hero moment |
| **Modern** | Light type weights, generous whitespace, soft glass surfaces |
| **Cinematic** | Deep-space backdrop, directional lighting, slow eased motion |
| **Educational** | Legibility first, generous line height, never style over clarity |
| **Global** | Earth imagery, maps, flags, neutral and inclusive iconography |
| **Minimal** | One accent colour, one focal point per screen, nothing decorative without purpose |

> **Note:** When two traits conflict, resolve in this order: legibility, then restraint, then drama. Cinematic never wins over readable.

---

## 2. Design Philosophy

The GEOverze visual language is permanent. It is not re-decided per page or per feature.

| Pillar | Definition |
| --- | --- |
| **Cinematic deep-space universe** | A single fixed Milky Way backdrop unifies every page. Stars and nebulae are subtle, never busy. |
| **Premium dark interface** | Near-black background with light, low-chroma foreground text. No light mode. |
| **Interactive 3D globe on Home** | The bronze globe is the brand moment and exists only on the Home route. |
| **Bronze metallic accents** | Bronze is the sole accent. It marks interaction, emphasis and brand — nothing else. |
| **Atmospheric lighting** | Soft key light, bronze rim light, vignette. No overexposed highlights, no pure white. |
| **Glassmorphism** | Dark charcoal glass panels with blur and hairline bronze borders carry all content. |
| **Elegant motion** | Slow, eased, purposeful. Motion reveals and guides; it never entertains for its own sake. |
| **Spacious layouts** | Whitespace is a design element. Sections breathe. Density is a last resort. |
| **High-quality typography** | Light weights, tight display tracking, wide eyebrow tracking, comfortable measure. |

**Consistency mandate:** Every new page, feature and component inherits this language unchanged. A new surface may extend the system, but may not introduce a competing visual style, a second accent colour, or an alternative background treatment.

---

## 3. Color System

All colours are defined in `oklch` in `src/styles.css`. Components must reference tokens through Tailwind utilities (`bg-background`, `text-bronze`, `border-border`) or `var(--token)`. **Hardcoded colour utilities (`text-white`, `bg-black`, `bg-[#...]`) are prohibited.**

### 3.1 Core palette

| Token | Value | Usage |
| --- | --- | --- |
| `--background` | `oklch(0.06 0.004 60)` | Page background beneath the universe backdrop; the deep-space void |
| `--foreground` | `oklch(0.93 0.02 70)` | Primary text; warm off-white, never pure white |
| `--charcoal` | `oklch(0.16 0.006 60)` | Solid surface base for panels and elevated blocks |
| `--bronze` | `oklch(0.68 0.09 62)` | The accent: links, active states, eyebrows, icons, borders, focus |
| `--bronze-glow` | `oklch(0.82 0.08 78)` | Bronze highlight for gradients, hover lifts and light edges |

### 3.2 Text emphasis

Derive text hierarchy from `--foreground` opacity rather than new colours.

| Level | Usage | Suggested value |
| --- | --- | --- |
| Primary | Headings, key figures | `text-foreground` |
| Secondary | Body copy | `text-foreground/70` |
| Tertiary | Supporting copy, metadata | `text-foreground/60` |
| Quiet | Disabled, timestamps | `text-foreground/45` |
| Accent | Eyebrows, links, emphasis | `text-bronze` |

> **Note:** Do not go below `/45` for any text a user must read. Below that, contrast fails.

### 3.3 Surface and glass

| Token | Value | Usage |
| --- | --- | --- |
| `--glass-bg` | `oklch(0.16 0.006 60 / 0.42)` | Default glass panel fill |
| `--glass-bg-strong` | `oklch(0.12 0.006 60 / 0.72)` | Overlays, modals, drawers, sticky navigation |
| `--glass-border` | `oklch(0.68 0.09 62 / 0.18)` | Hairline border on default panels |
| `--glass-border-strong` | `oklch(0.68 0.09 62 / 0.38)` | Border on hover, active and elevated surfaces |
| `--glass-blur` | `18px` | Base backdrop blur (strong variant multiplies by 1.4) |
| `--bloom-bronze` | `oklch(0.22 0.02 60 / 0.4)` | Atmospheric bloom behind hero content |

### 3.4 Shadows and glows

| Token | Value | Usage |
| --- | --- | --- |
| `--shadow-panel` | `0 24px 60px -24px oklch(0 0 0 / 0.85)` | Standard depth for glass panels and cards |
| `--shadow-float` | `0 10px 30px -12px oklch(0 0 0 / 0.7)` | Lighter depth for floating chips, popovers, toasts |
| `--glow-bronze` | `0 0 40px oklch(0.68 0.09 62 / 0.22)` | Subtle bronze halo on primary actions and the emblem |
| `--glow-bronze-strong` | `0 0 60px oklch(0.72 0.1 66 / 0.35)` | Hover/active glow on primary CTAs only |

Utilities: `bronze-glow`, `bronze-glow-strong`, `shadow-panel`, `shadow-float`.

### 3.5 Gradients

| Token | Usage |
| --- | --- |
| `--gradient-bronze` | Metallic bronze sweep for display text (`text-gradient-bronze`), rules and key accents |
| `--gradient-surface` | Subtle top-lit surface wash for large panels (`surface-gradient`) |

Never introduce a new gradient without adding it as a token. Never use a multi-hue gradient — bronze only.

### 3.6 Status colours

Status colours are **not yet defined as tokens**. When a feature first needs one, add it to `src/styles.css` as a token in `oklch` and register it in `@theme inline`. Never inline a status colour in a component.

| Role | Intended character | Token to add | Usage |
| --- | --- | --- | --- |
| Success | Muted, desaturated green — quiet confirmation | `--success` / `--success-foreground` | Correct answers, completed orders, saved state |
| Warning | Amber close to bronze but distinguishable | `--warning` / `--warning-foreground` | Streak at risk, expiring session, unsaved changes |
| Error | Deep desaturated red, never neon | `--destructive` (exists) | Wrong answers, failed payment, validation errors |
| Info | Cool low-chroma blue | `--info` / `--info-foreground` | Neutral notices, tips, "coming soon" context |

Rules:

- Status colours are for state, never for decoration or branding.
- Status must never be the only signal — always pair colour with an icon or text.
- Status colours stay desaturated so they never compete with bronze.

> **Note:** The shadcn `--card`, `--popover`, `--primary`, `--secondary`, `--muted` and `--accent` tokens in `:root` retain light-theme defaults from the template. GEOverze surfaces use `--background`, `--charcoal`, the glass tokens and `--bronze` instead. Do not build new UI on those legacy tokens; when a shadcn primitive needs restyling, override it with GEOverze tokens.

### 3.7 Borders

| Purpose | Value |
| --- | --- |
| Panel hairline | `--glass-border` |
| Emphasis / hover | `--glass-border-strong` |
| Divider between sections | `hairline-top` utility |
| Focus ring | `--bronze` at reduced alpha with visible offset |

---

## 4. Typography

### 4.1 Families

| Role | Family |
| --- | --- |
| Display and UI | The system sans stack (Tailwind default `font-sans`) |
| Numeric data | Same family with `tabular-nums` for tables, scores, timers and leaderboards |
| Monospace | Reserved for codes, IDs and technical output only |

> **Implementation note:** GEOverze does not currently load a web font. If one is introduced, load it via a `<link>` in the root route head (`src/routes/__root.tsx`) — never with `@import` in `src/styles.css`, which the Tailwind v4 build resolves from the filesystem. Any new family must be a neutral geometric or humanist sans; serif and display typefaces are out of the system.

### 4.2 Hierarchy

| Level | Size | Weight | Tracking | Line height | Usage |
| --- | --- | --- | --- | --- | --- |
| Hero display | `clamp(2.2rem, 5.4vw, 4.4rem)` | `font-light` | `tracking-tight` | `0.98` | Home hero H1 only |
| Brand display | `clamp(4rem, 12vw, 8rem)` | `font-light` | default | `1` | Error and status screens, bronze gradient text |
| Section title (H2) | `clamp(1.7rem, 3.6vw, 2.9rem)` | `font-light` | `tracking-tight` | `1.05` | Section headings |
| Subsection (H3) | `1.25rem–1.5rem` | `font-light` / `font-normal` | `tracking-tight` | `1.2` | Card titles, grouped content |
| Body large | `1rem` | `font-normal` | default | `1.65` | Lead paragraphs, section intros |
| Body | `0.875rem` | `font-normal` | default | `1.6` | Default copy |
| Label | `0.75rem` | `font-medium` | `0.02em` | `1.4` | Form labels, table headers |
| Eyebrow | `0.7rem` | `font-normal`, uppercase | `--tracking-eyebrow` (`0.42em`) | `1.3` | Section kickers — use the `eyebrow` utility |
| Button | `0.7rem–0.8rem` | `font-medium`, uppercase | `--tracking-button` (`0.24em`) | `1` | All button labels |
| Caption | `0.68rem` | `font-normal` | `0.04em` | `1.45` | Metadata, footnotes, image credits |

### 4.3 Weight policy

Light and normal carry the brand. `font-light` for anything `1.25rem` and above; `font-normal` for body; `font-medium` for labels and buttons. **Never use `font-bold` or heavier** — weight is not how GEOverze creates emphasis. Emphasis comes from size, bronze colour, and space.

### 4.4 Readability principles

- [ ] Body measure stays between 45 and 75 characters (`max-w-lg` to `max-w-2xl`).
- [ ] Long-form GEOlibrary copy uses body-large size and `1.7` line height.
- [ ] Uppercase is reserved for eyebrows and buttons, never for sentences.
- [ ] Wide tracking is never applied to running text.
- [ ] Only one H1 per page.
- [ ] Numeric columns and timers use `tabular-nums` so digits do not jitter.
- [ ] Text never sits directly on the starfield without a glass surface or a scrim behind it.

---

## 5. Spacing System

### 5.1 Scale

Spacing is the Tailwind 4px scale. Use these steps and no arbitrary values.

| Step | Value | Typical usage |
| --- | --- | --- |
| `1` | 4px | Icon-to-label gap |
| `2` | 8px | Tight inline gaps, chip padding |
| `3` | 12px | Button gaps, compact list rows |
| `4` | 16px | Default internal padding |
| `6` | 24px | Card padding (mobile), grid gap |
| `8` | 32px | Card padding (desktop), block separation |
| `12` | 48px | Sub-section separation |
| `16` | 64px | Large block separation |
| `24` | 96px | Section separation fallback |

### 5.2 Layout tokens

| Token | Value | Usage |
| --- | --- | --- |
| `--space-section` | `7rem` | Vertical padding between major sections (desktop) |
| `--space-section-sm` | `4.5rem` | Section padding on small viewports |
| `--nav-height` | `4.75rem` | Sticky navbar height; use as scroll offset and top padding |

### 5.3 Containers

| Container | Max width | Usage |
| --- | --- | --- |
| Narrow | `48rem` | Long-form reading, legal pages, auth forms |
| Standard | `72rem` | Default for content sections and grids |
| Wide | `88rem` | Dense dashboards, wide tables, the footer |
| Full bleed | none | Universe background and the Home hero canvas only |

Horizontal gutters: `1.5rem` mobile, `2rem` tablet, `3rem` desktop and above. `SectionContainer` implements these — use it rather than re-declaring widths.

### 5.4 Grid spacing

| Context | Columns | Gap |
| --- | --- | --- |
| Feature cards | 1 / 2 / 3 | `1.5rem` |
| Category tiles | 2 / 3 / 4 | `1rem`–`1.5rem` |
| Stat blocks | 2 / 4 | `1rem` |
| Footer columns | 1 / 2 / 4 | `2rem` |

---

## 6. Layout Principles

### 6.1 Hero sections

- Full viewport height using `h-dvh` (never `h-screen`, which jumps on mobile).
- One eyebrow, one H1, one supporting paragraph, at most two CTAs.
- Content aligns left on desktop and centres only when there is no adjacent visual.
- The Home hero is the only hero containing a 3D canvas.

### 6.2 Content sections

- Every section: `SectionIntro` (eyebrow + title + optional copy), then the content block.
- Vertical padding from `--space-section` / `--space-section-sm`.
- Sections alternate rhythm (grid, split, centred statement) so the page never feels repetitive.
- Each section carries exactly one idea.

### 6.3 Cards

- Built on `GlassCard`; padding `1.5rem` mobile, `2rem` desktop.
- Structure: icon or eyebrow, title, description, optional action — in that order.
- Cards in a grid are equal height with content aligned to the top and actions to the bottom.
- Hover raises the border to `--glass-border-strong` and adds a subtle translate; never a scale bounce.

### 6.4 Sidebars

- Reserved for dashboard, creator and settings templates.
- Width `16rem`–`18rem`, sticky below the navbar, strong glass surface.
- Collapse to a drawer below the laptop breakpoint.
- Sidebar navigation uses a bronze left indicator for the active item, not a filled background.

### 6.5 Navigation

- Sticky, transparent at scroll top, transitions to strong glass with a hairline bottom border once scrolled.
- Left: emblem and wordmark. Centre or left-adjacent: primary destinations. Right: search, credits, profile or auth actions.
- Mobile collapses to a drawer with `role="dialog"`, `aria-modal`, focus trap and Escape to close.
- Creator and Admin never appear in global navigation.

### 6.6 Footers

- Wide container, strong glass, hairline top border.
- Four columns — Platform, Resources, Company, Legal — plus a brand block with slogan and social links.
- Collapses to two columns on tablet and one on mobile.

### 6.7 Visual balance

- [ ] One focal point per viewport.
- [ ] Whitespace grows with viewport width; content does not simply stretch.
- [ ] Consistent alignment grid — content edges line up across sections.
- [ ] Bronze covers roughly 5–10% of any screen. More than that cheapens it.
- [ ] Never place two heavy glass panels directly adjacent without spacing between them.

---

## 7. Component Library

Reuse before creating. Shared components live in `src/components/shared`; styled primitives in `src/components/ui`.

| Component | Implementation | Visual style | Behaviour |
| --- | --- | --- | --- |
| Buttons | `GeoButton` + `geoButtonVariants` | Uppercase, wide tracking, bronze gradient (primary) or hairline outline (secondary) | Hover lifts glow; active presses 1px; disabled at 45% with no glow |
| Cards | `GlassCard`, `FeatureCard`, `StatCard` | Glass panel, hairline bronze border, panel shadow | Hover strengthens border; whole card is the link target when actionable |
| Inputs | `ui/input`, `ui/textarea`, `AuthField` | Transparent fill, hairline underline or border, bronze focus ring | Label above, helper below, error replaces helper in destructive colour |
| Search bars | Input + leading icon + `/` shortcut | Rounded glass field with bronze icon | Debounced, grouped results, recent searches, keyboard navigable |
| Tables | `ui/table` | Hairline row dividers, no zebra striping, `tabular-nums` | Sticky header, sortable columns, horizontal scroll on mobile |
| Modals | `Modal`, `ui/dialog` | Strong glass, blurred scrim, `radius-2xl` | Focus trap, Escape closes, restores focus, scroll lock |
| Drawers | `ui/sheet` | Strong glass panel from the edge | Slide with `--ease-cinematic`; mobile nav and filters |
| Alerts | `ui/alert` | Inline glass block with status icon and left accent | Static, in-page; dismissible only when informational |
| Toasts | `sonner` via `ui/sonner` | Floating glass card, `--shadow-float`, bottom-right (bottom-centre on mobile) | Auto-dismiss ~4s, max 3 stacked, action button optional |
| Tabs | `ui/tabs` | Text tabs with a bronze underline indicator | Arrow-key navigable; state reflected in the URL when the view is shareable |
| Accordions | `ui/accordion` | Hairline dividers, bronze chevron | Height-eased open/close; multiple open allowed for FAQs |
| Badges | `ui/badge` | Small pill, bronze tint fill or hairline outline | Static status: Premium, Creator, New, difficulty |
| Chips | Badge variant | Compact pill, optional dismiss "x" | Interactive filters and tags; selected state fills bronze at low alpha |
| Progress | `ui/progress` | Thin 4px track with bronze gradient fill | Determinate where possible; animate value changes with `--dur-base` |
| Pagination | To build in `shared` | Hairline outline buttons, bronze active page | Preserves filters in the URL; disables ends; shows total |
| Breadcrumbs | `Breadcrumb` | Caption size, bronze separators, current page unlinked | Appears on all internal pages below the navbar |

Supporting components: `SectionContainer`, `SectionIntro`, `AnimatedSection`, `PageHeader`, `PageShell`, `PageTransition`, `LoadingScreen`, `EmptyState`, `ComingSoon`, `RouteErrorFallback`.

Rules:

- [ ] One button system. Never hand-roll a button.
- [ ] Empty, loading and error states are designed for every data surface — `EmptyState`, skeletons and `RouteErrorFallback` exist for this.
- [ ] Unbuilt modules use `ComingSoon`, never placeholder or fake data.
- [ ] New shared components accept `className`, forward refs where relevant, and use tokens exclusively.

---

## 8. Glassmorphism

Glass is the primary surface material. It is also the easiest thing to overuse.

### 8.1 Specification

| Property | Default (`glass-panel`) | Strong (`glass-panel-strong`) |
| --- | --- | --- |
| Fill | `--glass-bg` (42% charcoal) | `--glass-bg-strong` (72% charcoal) |
| Border | `1px --glass-border` (bronze 18%) | `1px --glass-border-strong` (bronze 38%) |
| Blur | `18px` + `saturate(1.1)` | `25.2px` (18 × 1.4) + `saturate(1.15)` |
| Shadow | `--shadow-panel` | `--shadow-panel` |

### 8.2 When to use which

| Surface | Treatment |
| --- | --- |
| Content cards, stat blocks, section panels | `glass-panel` |
| Navbar (scrolled), modals, drawers, popovers, footer | `glass-panel-strong` |
| Full-page backgrounds | No glass — the universe backdrop only |
| Text sitting on the starfield | Glass or a soft scrim, always |

### 8.3 Layering

```text
z-0   Universe background (fixed, parallax)
z-10  Page content and glass panels
z-20  Sticky navbar
z-30  Popovers, dropdowns, tooltips
z-40  Modals, drawers, and their scrim
z-50  Toasts
```

### 8.4 Limits

- [ ] Never nest glass inside glass. An inner surface uses a flat tinted fill instead.
- [ ] Maximum two glass layers visible at once, excluding the navbar.
- [ ] Do not apply blur to large full-width regions — it is expensive and flattens the backdrop.
- [ ] Do not raise blur above the strong value; more blur reads as fog, not glass.
- [ ] Provide a solid `--charcoal` fallback wherever backdrop blur is unsupported.

> **Implementation note:** Write only the standard `backdrop-filter` in new CSS and let the build add prefixes. Never hand-write `-webkit-backdrop-filter` beside the standard property — Lightning CSS dedupes them, keeps the last, and the effect silently disappears in Chrome on the built site.

---

## 9. Motion Design

### 9.1 Tokens

| Token | Value | Usage |
| --- | --- | --- |
| `--dur-fast` | `180ms` | Hover, focus, press, colour and border changes |
| `--dur-base` | `320ms` | Reveals, tab and accordion transitions, toasts |
| `--dur-slow` | `700ms` | Page transitions, hero entrances, large staged reveals |
| `--ease-cinematic` | `cubic-bezier(0.22, 1, 0.36, 1)` | Entrances, reveals, drawers — decisive then settling |
| `--ease-soft` | `cubic-bezier(0.4, 0, 0.2, 1)` | Small state changes and micro-interactions |

Never use `linear` (except continuous rotation), `ease-in-out` defaults, spring overshoot, or bounce.

### 9.2 Scroll animations

- Reveals use `AnimatedSection`, which toggles a `data-shown` attribute from an `IntersectionObserver` — no React state per item.
- Reveal pattern: 16–24px upward translate plus opacity, `--dur-slow`, `--ease-cinematic`.
- Stagger children by 60–90ms, capped at roughly 6 items.
- Reveals fire once and never replay on scroll-up.
- The Home globe is driven by a single pinned GSAP ScrollTrigger writing to refs, never through React re-renders.

### 9.3 Hover and press

| Interaction | Response |
| --- | --- |
| Button hover | Glow strengthens, border brightens, 1px lift — `--dur-fast` |
| Button press | 1px down, glow reduces |
| Card hover | Border to strong, 2px lift, no scale |
| Link hover | Bronze underline grows from the left |
| Icon hover | Opacity to full; no rotation or spin |

### 9.4 Loading

- Skeletons that match the final layout — never spinners inside content areas.
- `LoadingScreen` for route-level pending states, shown only after ~300ms so fast navigation never flashes.
- Progress bars animate to their new value rather than jumping.

### 9.5 Page transitions

- `PageTransition` cross-fades with a small upward translate at `--dur-base`.
- The universe background never transitions — it persists to preserve continuity between pages.
- Scroll resets to top on route change unless returning to a stored position.

### 9.6 Restraint and reduced motion

- [ ] Motion always communicates something: arrival, change, relationship or state.
- [ ] Nothing loops indefinitely except the globe's slow idle rotation.
- [ ] Nothing flashes, pulses aggressively, or moves without user intent.
- [ ] `prefers-reduced-motion: reduce` disables scroll reveals, parallax, page transitions and globe animation, leaving instant opacity changes only. Content must remain fully visible and usable.

---

## 10. Iconography & Imagery

### 10.1 Icons

| Property | Standard |
| --- | --- |
| Library | `lucide-react` exclusively |
| Style | Line icons, consistent stroke, no fills |
| Stroke width | `1.5` |
| Sizes | `16px` inline, `20px` UI controls, `24px` section and feature icons |
| Colour | `--bronze` for accent and feature icons, `--foreground` at reduced opacity for utility icons |

Icons are never the only label for a destructive or ambiguous action — pair with text or an accessible name. Decorative icons take `aria-hidden`.

### 10.2 Illustration

Minimal, line-based, bronze-on-dark. Geometric and cartographic in feeling: contour lines, graticules, orbital arcs. No mascots, no flat-vector "corporate" people, no multi-colour illustration.

### 10.3 Photography

- Dark, atmospheric, desaturated; landscapes, cities and cultural detail.
- No overexposed skies or bright white areas — imagery must sit inside the dark interface without punching holes in it.
- Always overlay a dark gradient scrim when text sits on a photo.
- Every content image needs meaningful alt text; decorative images are marked `aria-hidden`.

### 10.4 3D graphics

- Bronze metallic materials with controlled roughness; no chrome, no rainbow environment reflections.
- Lighting is a soft key plus a bronze rim against a black scene background.
- Assets are lazy-loaded behind a WebGL capability check with a static emblem fallback.
- The render loop pauses when the canvas is off-screen or the tab is hidden.

### 10.5 Globe usage

- The interactive globe exists **only on the Home route**.
- Other pages may use the static circular emblem or a flat map motif — never a second interactive globe.
- The globe is never decorative filler; it is the brand's opening statement.

### 10.6 Maps and geography visuals

- Dark base with bronze borders and labels; landmasses slightly lighter than the void.
- Data overlays use bronze opacity steps rather than a multi-hue scale.
- Flags render at their true colours inside a neutral frame with a subtle hairline border — never recoloured to fit the palette.

---

## 11. Responsive Design

| Tier | Range | Tailwind | Layout behaviour |
| --- | --- | --- | --- |
| Mobile | 320–639px | base | Single column, 1.5rem gutters, drawer navigation, stacked CTAs, section padding `--space-section-sm` |
| Tablet | 640–1023px | `sm`, `md` | Two-column grids, 2rem gutters, drawer navigation retained, side-by-side CTAs |
| Laptop | 1024–1279px | `lg` | Full horizontal navigation, three-column grids, sidebars appear, 3rem gutters |
| Desktop | 1280–1535px | `xl` | Standard container at max width, full `--space-section` rhythm, split hero layouts |
| Ultrawide | 1536px+ | `2xl` | Container stays capped; extra width becomes whitespace. Only dashboards and tables may widen |

Rules:

- [ ] Design mobile-first; add complexity upward.
- [ ] Never horizontal scroll except inside an intentional table or carousel region.
- [ ] Type scales through `clamp()`, not per-breakpoint overrides.
- [ ] The 3D globe reduces scale and pixel ratio on small screens and is skipped entirely without WebGL.
- [ ] Test at 320px, 768px, 1280px and 1920px before shipping any page.

---

## 12. Accessibility

Target: **WCAG 2.1 AA**, without compromising the premium aesthetic.

| Area | Standard |
| --- | --- |
| Text contrast | 4.5:1 body, 3:1 for text 24px+ or 19px bold. `--foreground` on `--background` passes comfortably; verify every reduced-opacity level |
| Non-text contrast | 3:1 for borders, focus rings, icons and form boundaries — hairlines must stay perceivable |
| Keyboard | Every interactive element reachable and operable; logical tab order; no traps outside intentional modal focus traps |
| Focus indicators | Always visible: 2px bronze ring with a 2px offset. Never remove outlines without an equivalent replacement |
| Semantic HTML | Real `<button>`, `<a>`, `<nav>`, `<main>`, `<header>`, `<footer>`; one H1; no skipped heading levels; "Skip to content" link present |
| Forms | Every input has a `<label>`; errors are announced and linked via `aria-describedby`; errors are never colour-only |
| Reduced motion | `prefers-reduced-motion` disables parallax, reveals, transitions and globe motion |
| Touch targets | Minimum 44×44px with at least 8px spacing between adjacent targets |
| Screen readers | Decorative layers `aria-hidden`; modals use `role="dialog"` and `aria-modal`; toasts announce politely; icon-only buttons have accessible names |

> **Note:** Dark, low-contrast design is where accessibility usually fails. When an aesthetic choice drops contrast below standard, raise the opacity — the aesthetic survives; illegible text does not.

---

## 13. Page Templates

**Only the Home page includes the interactive 3D globe.** Every other page uses the same cinematic universe background without it.

### 13.1 Home (3D experience)

```text
Universe background (fixed)
Navbar (transparent -> glass on scroll)
Hero: pinned 3D globe canvas + scroll-synced copy panels
Story sections (revealed on scroll)
Final CTA
Footer
```

### 13.2 Internal 2D page

```text
Universe background (fixed, no globe)
Navbar
PageHeader: breadcrumb, eyebrow, H1, supporting copy
Content sections in SectionContainer
Footer
```

### 13.3 Authentication page

```text
Universe background
Minimal navbar (emblem only)
Centred narrow glass card (max 28rem): emblem, title, fields, primary action,
  secondary link, legal microcopy
No footer navigation
```

### 13.4 Dashboard page

```text
Universe background
Navbar
Sidebar (sticky, collapses to drawer) | Main region
Main: page title, stat row, primary data surface, secondary panels
Compact footer
```

### 13.5 Content page (GEOlibrary)

```text
Universe background
Navbar
Breadcrumb + article header (title, category, reading time, bookmark)
Narrow reading container (48rem)
Related entries and related quizzes
Footer
```

### 13.6 Settings page

```text
Universe background
Navbar
Breadcrumb + PageHeader
Left section navigation | Stacked glass setting groups
Each group: title, description, controls, inline save state
Footer
```

---

## 14. Do's and Don'ts

### Do

- Do maintain generous whitespace — space is the premium signal.
- Do reuse existing components before building anything new.
- Do preserve the bronze visual identity as the single accent.
- Do use design tokens for every colour, shadow, glow, gradient, duration and easing.
- Do keep one focal point and one idea per section.
- Do design empty, loading and error states alongside the happy path.
- Do keep motion slow, eased and purposeful.
- Do test keyboard navigation and reduced motion before shipping.
- Do use `ComingSoon` for unbuilt modules.

### Don't

- Don't introduce random colours, new accents, or multi-hue gradients.
- Don't hardcode colour utilities such as `text-white`, `bg-black`, or `bg-[#...]`.
- Don't mix visual styles — no flat cards, no light surfaces, no competing card designs.
- Don't clutter interfaces or compress spacing to fit more content.
- Don't create inconsistent button styles or one-off buttons.
- Don't nest glass inside glass or blur full-page regions.
- Don't use bold weights, bounce animations, or spinners inside content.
- Don't put an interactive 3D globe on any page other than Home.
- Don't ship fake or placeholder data in place of real states.

---

## 15. Living Design System

This document is the **official GEOverze Design System**. It governs every page and component, existing and future.

It evolves — but carefully:

- [ ] Changes to tokens, components or principles are deliberate decisions recorded here in the same change that implements them.
- [ ] New patterns are added to the shared library and documented before being reused.
- [ ] Extensions are welcome; replacements are not. Additions must feel native to the existing language.
- [ ] The core identity — deep-space universe, bronze accent, dark glassmorphism, light typography, spacious layouts, globe on Home only — does not change without an explicit, documented decision.
- [ ] When this document and the code disagree, the discrepancy is a bug in one of them. Resolve it immediately rather than letting the two drift.

Consistency is the product. Every surface should feel like it came from the same place, because it did.
