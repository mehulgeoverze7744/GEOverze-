# GEOverze — Product Requirements Document (PRD)

**Status:** Living document
**Audience:** Developers, designers, AI assistants, future contributors
**Purpose:** The single source of truth for how every part of GEOverze should function.
**Companion document:** [`docs/geoverze-roadmap.md`](./geoverze-roadmap.md) — phases and sequencing. This PRD defines *what* and *how it behaves*; the roadmap defines *when*.

---

## Table of Contents

1. [Product Overview](#1-product-overview)
2. [Target Users](#2-target-users)
3. [User Journey](#3-user-journey)
4. [Information Architecture](#4-information-architecture)
5. [Feature Specifications](#5-feature-specifications)
6. [Quiz System](#6-quiz-system)
7. [User Profiles](#7-user-profiles)
8. [GEOlibrary](#8-geolibrary)
9. [GEOstore](#9-geostore)
10. [Premium Membership](#10-premium-membership)
11. [Rewards System](#11-rewards-system)
12. [Non-Functional Requirements](#12-non-functional-requirements)
13. [Design Principles](#13-design-principles)
14. [Technical Principles](#14-technical-principles)
15. [Future Integrations](#15-future-integrations)
16. [Success Metrics](#16-success-metrics)
17. [Open Questions](#17-open-questions)
18. [Living Document](#18-living-document)

---

## 1. Product Overview

| Field | Value |
| --- | --- |
| Project name | **GEOverze** |
| Slogan | **Know Earth** |
| Tagline | **Think Global** |
| Category | Premium geography learning platform |
| Form factor | Responsive web application (mobile, tablet, desktop) |

### 1.1 Mission

Make geography feel like exploration rather than memorisation. GEOverze turns countries, capitals, flags, maps, cultures and landmarks into an interactive, cinematic experience that people return to because they enjoy it — not because they were assigned it.

### 1.2 Vision

A single global destination where anyone can learn about Earth, test what they know, compete with others, collect knowledge over time, and eventually create and share their own geography content — all inside one coherent, premium product.

### 1.3 Target audience (summary)

Learners of any age who want to understand the world: school and university students, teachers and parents supporting them, competitive quiz players, travel enthusiasts, and curious general learners. See [Section 2](#2-target-users).

### 1.4 Unique value proposition

| Differentiator | Why it matters |
| --- | --- |
| Cinematic, premium presentation | Geography apps are typically utilitarian. GEOverze feels like a product people want to be seen using. |
| Learn + play + compete in one place | No switching between a reference site, a quiz app, and a leaderboard service. |
| Depth over trivia | GEOlibrary provides real context behind every quiz answer. |
| Progression that persists | Streaks, achievements, credits and badges make long-term learning visible. |
| Creator-driven content (planned) | The catalogue grows with the community instead of only with the team. |
| Design system discipline | Every surface shares one visual language, so the product scales without fragmenting. |

> **Note:** GEOverze is education-first. Competitive and commercial features exist to sustain engagement and the platform, never to gate core learning.

---

## 2. Target Users

| Persona | Who they are | Primary goals | How GEOverze serves them |
| --- | --- | --- | --- |
| **Student** | School/university learner, 12–24 | Pass exams, retain facts, study without boredom | Difficulty-progressive quizzes, GEOlibrary reference, streaks and progress tracking |
| **Teacher** | Classroom or tutor | Assign practice, measure class understanding | Curated quiz sets, shareable links, (future) class groups and reports |
| **Parent** | Supporting a child's learning | Safe, screen-time-worthy educational content | Age-appropriate categories, progress visibility, no hostile monetisation |
| **Geography enthusiast** | Self-directed adult learner | Go deeper than school-level content | Advanced categories, long-form GEOlibrary entries, bookmarks |
| **Competitive quiz player** | Motivated by ranking | Win, climb, beat friends | Leaderboards, PvP, timed modes, tournaments |
| **Travel lover** | Plans or dreams of travel | Learn about places and cultures | Country profiles, landmarks, culture entries, maps |
| **General learner** | Casual, curious | Light daily learning | Daily challenge, short quizzes, recommendations |
| **Creator** *(future)* | Power user / educator | Publish their own quizzes and articles | Creator tools, approval workflow, attribution, creator status |

> **Future consideration:** Institutional accounts (schools, clubs) are a distinct persona with billing and administration needs; deliberately out of scope until the individual experience is mature.

---

## 3. User Journey

The ideal end-to-end path. Each step must be reachable without dead ends, and every step must work for a signed-out visitor up to the point where an account is genuinely required.

```text
Discover  ->  Home (3D globe, brand story)
             |
Understand ->  Scroll narrative: what GEOverze is, why it's different
             |
Try        ->  Let's Play: browse quizzes, start one without an account
             |
Commit     ->  Register (prompted at the moment progress becomes worth saving)
             |
Learn      ->  GEOlibrary: read context, bookmark entries
             |
Progress   ->  Profile: streaks, stats, achievements, quiz history
             |
Compete    ->  Leaderboards, daily challenges, PvP
             |
Spend      ->  GEOstore: credits, digital items
             |
Return     ->  Streak reminders, new challenges, unfinished achievements
```

### 3.1 Journey rules

- [ ] A first-time visitor can reach a playable quiz in **two clicks** from Home.
- [ ] Account creation is never required to *try* the product, only to *keep* results.
- [ ] Anonymous progress in a session is offered for migration on signup.
- [ ] Every completed quiz ends with a next action (retry, related quiz, related GEOlibrary entry).
- [ ] Every page provides a clear route back into Play or Library.

---

## 4. Information Architecture

| Section | Route | Purpose | Auth |
| --- | --- | --- | --- |
| Home | `/` | Brand experience, 3D globe, product story, primary conversion | Public |
| Let's Play | `/play` | Quiz discovery and entry point to the quiz engine | Public |
| GEOlibrary | `/library` | Structured learning content and reference material | Public |
| GEOstore | `/store` | Credits, digital items, future merchandise | Public browse, auth to buy |
| Pricing | `/pricing` | Plan comparison and premium conversion | Public |
| Leaderboards | `/leaderboard` | Global, category and time-scoped rankings | Public |
| Profile | `/profile` | Identity, progress, achievements, settings | Auth |
| Authentication | `/login`, `/register`, `/forgot-password` | Account access and recovery | Public |
| Creator Platform | `/creator` *(planned)* | Author quizzes and articles, track submissions | Auth + creator role |
| Admin Dashboard | `/admin` *(planned)* | Moderation, approvals, content and user management | Auth + admin role |
| Support | `/contact`, `/about` | Help, contact, company context | Public |
| Legal | `/privacy`, `/terms` | Policies and terms | Public |

### 4.1 Navigation rules

- The global navbar exposes the primary destinations: Home, Let's Play, GEOlibrary, GEOstore, Pricing, Leaderboards.
- Profile and authentication live on the right side of the navbar and swap based on session state.
- The footer carries the full sitemap grouped as Platform / Resources / Company / Legal, plus social links.
- Creator and Admin are never advertised in global navigation; they appear only for users holding the role.
- Only Home renders the 3D globe. Every other page is a 2D room in the same universe.

---

## 5. Feature Specifications

Each feature is specified with the same seven fields so any contributor can implement it without further discovery.

### 5.1 Authentication

- **Purpose:** Give users a persistent identity so progress, purchases and rankings survive across sessions and devices.
- **Description:** Email + password accounts with email verification and password reset. Social sign-in (Google, Apple) as a fast path. Roles stored in a dedicated roles table, never on the profile record.
- **Primary flow:** Register -> verify email -> land on Profile with an onboarding prompt (avatar, country).
- **Expected behavior:** Session persists across reloads; protected routes redirect to login and return the user to the intended destination after success; sign-out clears all client state including cart and transient quiz state.
- **Success criteria:** Registration completes in under 60 seconds; password reset email arrives within 2 minutes; no protected data is ever readable by another account.
- **Edge cases:** Duplicate email; unverified email attempting a gated action; expired reset link; social account whose email matches an existing password account; session expiry mid-quiz (results must be preserved and submitted after re-auth).
- **Future enhancements:** Passkeys, two-factor authentication, account deletion self-service, session device list.

### 5.2 Quiz Browser (Let's Play)

- **Purpose:** Help users find a quiz they want to play in seconds.
- **Description:** Filterable, searchable catalogue of quizzes with category, difficulty, length and mode facets, plus curated rows (Featured, Daily Challenge, New, Popular, Continue).
- **Primary flow:** Open Let's Play -> filter or pick a curated card -> quiz detail -> Start.
- **Expected behavior:** Filters are reflected in the URL and shareable; results paginate or lazy-load; empty filter results show a designed empty state with a reset action.
- **Success criteria:** Median time from landing on `/play` to quiz start under 20 seconds.
- **Edge cases:** No quizzes in a category; quiz unpublished while a user has it open; slow network (skeleton states, never layout shift).
- **Future enhancements:** Personalised recommendations, "quizzes your friends played", saved filter presets.

### 5.3 Quiz Engine

- **Purpose:** Deliver the core play experience reliably and fairly.
- **Description:** Renders a question sequence, accepts answers, applies timing and scoring rules, and produces a result summary. See [Section 6](#6-quiz-system) for behavioural rules.
- **Primary flow:** Start -> question -> answer -> immediate or deferred feedback -> next -> results screen with score, accuracy, time, credits earned and next actions.
- **Expected behavior:** State is resilient to refresh within an active attempt; the timer never advances while the tab is hidden in solo mode; scoring is computed server-side for any result that affects leaderboards or credits.
- **Success criteria:** Zero mis-scored attempts; input-to-feedback latency under 100 ms locally.
- **Edge cases:** Connection loss mid-attempt; duplicate submission; user leaves and returns after expiry; ties in scoring.
- **Future enhancements:** Map-pin and drag-order question types, hints, lifelines, adaptive difficulty.

### 5.4 Achievements

- **Purpose:** Give long-term goals beyond a single quiz.
- **Description:** Named, tiered milestones (e.g. "All 54 African capitals", "30-day streak") with progress bars and unlock states.
- **Primary flow:** Play -> criteria met -> unlock toast -> achievement appears on Profile.
- **Expected behavior:** Evaluated server-side after each qualifying event; idempotent (never awarded twice); locked achievements are visible with criteria so they motivate.
- **Success criteria:** Unlock notification within 2 seconds of the qualifying action.
- **Edge cases:** Retroactive awards when a new achievement ships; criteria changing after users have partial progress.
- **Future enhancements:** Secret achievements, seasonal sets, shareable achievement cards.

### 5.5 Rewards

- **Purpose:** Convert effort into something spendable and collectible.
- **Description:** Credits earned from quizzes, streaks, challenges and achievements; badges as non-spendable status. See [Section 11](#11-rewards-system).
- **Primary flow:** Complete an activity -> credits granted -> balance visible in navbar and Profile -> spendable in GEOstore.
- **Expected behavior:** Every grant and spend is an append-only ledger entry with a reason; balance is derived, never edited directly.
- **Success criteria:** Ledger always reconciles to the displayed balance.
- **Edge cases:** Refunds, reversed grants after cheat detection, negative-balance prevention.
- **Future enhancements:** Credit gifting, limited-time multipliers.

### 5.6 Leaderboards

- **Purpose:** Provide social comparison and competitive pull.
- **Description:** Rankings scoped by time (daily, weekly, all-time), category, and audience (global, country, friends).
- **Primary flow:** Play a ranked quiz -> score submitted -> rank visible with the user's own row pinned.
- **Expected behavior:** Public read; ranks recomputed on a defined cadence rather than per request; ties broken by fastest completion time, then earliest submission.
- **Success criteria:** Leaderboard loads under 1 second; a user's own position is always visible without scrolling.
- **Edge cases:** Very large tie groups; suspected cheating (flag and exclude); deleted accounts (anonymise, don't reshuffle history).
- **Future enhancements:** Seasons with resets and rewards, club/class leaderboards.

### 5.7 Bookmarks

- **Purpose:** Let users keep what matters to them.
- **Description:** Save GEOlibrary entries, quizzes and store items to a personal list.
- **Primary flow:** Tap the bookmark control anywhere -> item appears under Profile > Bookmarks.
- **Expected behavior:** Optimistic toggle with rollback on failure; signed-out users are prompted to sign in and the intended bookmark is applied after auth.
- **Success criteria:** Toggle feels instant; state is consistent across pages and devices.
- **Edge cases:** Bookmarked content later unpublished (show as unavailable, allow removal).
- **Future enhancements:** Named collections, notes on bookmarks, export.

### 5.8 Search

- **Purpose:** One entry point to everything in GEOverze.
- **Description:** Global search across quizzes, GEOlibrary entries, countries and store items, with grouped results and keyboard navigation.
- **Primary flow:** Open search (icon or `/` shortcut) -> type -> grouped suggestions -> select.
- **Expected behavior:** Debounced queries; recent searches remembered locally; typo tolerance; zero-result state suggests popular content.
- **Success criteria:** First results rendered within 300 ms of a pause in typing.
- **Edge cases:** Very short queries, non-Latin input, results the user cannot access.
- **Future enhancements:** Semantic search, natural-language questions, filters inside search.

### 5.9 Creator Tools

- **Purpose:** Let the catalogue grow beyond the core team without losing quality.
- **Description:** An authoring surface for quizzes and articles with drafts, previews, validation and submission for review.
- **Primary flow:** Apply for creator access -> approved -> author draft -> preview -> submit -> review outcome -> published with attribution.
- **Expected behavior:** Drafts autosave; validation blocks submission of incomplete items; reviewers can request changes with comments; published items show the creator's name and link.
- **Success criteria:** Review decision within a stated SLA; published creator content is indistinguishable in quality from first-party content.
- **Edge cases:** Plagiarised or factually wrong submissions; creator status revoked while items are live; edits to already-published items require re-review.
- **Future enhancements:** Revenue share, creator analytics, collaborative authoring.

### 5.10 Payments

- **Purpose:** Sustain the platform through premium plans and store purchases.
- **Description:** Hosted checkout with a third-party provider; the platform never stores card data.
- **Primary flow:** Choose plan or cart -> hosted checkout -> webhook confirms -> entitlement granted -> receipt.
- **Expected behavior:** Entitlements are granted only by verified webhook, never by a client-side redirect; all webhook handling is idempotent and signature-verified.
- **Success criteria:** Zero entitlement granted without a confirmed payment; zero payment taken without an entitlement.
- **Edge cases:** Duplicate webhooks, delayed webhooks, refunds and chargebacks, currency and tax variation, failed renewals with grace period.
- **Future enhancements:** Regional pricing, promo codes, gift subscriptions.

### 5.11 Notifications

- **Purpose:** Bring users back for the right reasons.
- **Description:** In-app notification centre plus optional email digests. Categories: achievements, streak risk, challenge results, creator review outcomes, store/order updates, product news.
- **Primary flow:** Event occurs -> notification created -> badge on the bell -> user reads or dismisses.
- **Expected behavior:** Per-category preferences honoured everywhere; no duplicate notifications for one event; read state syncs across devices.
- **Success criteria:** Unsubscribe honoured immediately; complaint rate stays negligible.
- **Edge cases:** Bulk events collapsing into one summary; notifications for content the user can no longer access.
- **Future enhancements:** Web push, scheduled quiet hours, weekly progress email.

### 5.12 Premium Membership

- **Purpose:** Fund the platform while keeping core learning free. See [Section 10](#10-premium-membership).
- **Description:** Paid tier unlocking depth features rather than basic access.
- **Primary flow:** Hit a premium touchpoint -> Pricing -> checkout -> instant unlock.
- **Expected behavior:** Entitlement checked server-side on every gated action; downgrade preserves user data and simply re-gates features.
- **Success criteria:** No free-tier user ever loses access to previously free functionality.
- **Edge cases:** Expiry mid-session, failed renewal, plan change mid-cycle.
- **Future enhancements:** Family and classroom plans, lifetime tier.

### 5.13 Community

- **Purpose:** Turn solo learning into shared learning.
- **Description:** Friends, following, shared results, discussion on GEOlibrary entries, and clubs.
- **Primary flow:** Add a friend -> see their activity and ranks -> challenge them.
- **Expected behavior:** All social surfaces are moderated and reportable; users control the visibility of their profile and activity.
- **Success criteria:** Reports actioned within the stated SLA; no unmoderated public free text ships without a report path.
- **Edge cases:** Harassment, blocked users appearing in leaderboards, minors' privacy.
- **Future enhancements:** Clubs with private leaderboards, events, mentor roles.

### 5.14 AI Features

- **Purpose:** Personalise learning and reduce content production cost.
- **Description:** AI-assisted question generation for reviewers, adaptive study plans, explanations for wrong answers, and a geography assistant.
- **Primary flow:** User answers incorrectly -> requests an explanation -> receives a concise, sourced explanation linked to a GEOlibrary entry.
- **Expected behavior:** AI output is always labelled; generated quiz content is never auto-published without human review; requests are rate-limited per user.
- **Success criteria:** Explanation helpfulness rating above target; zero unreviewed AI content in the public catalogue.
- **Edge cases:** Hallucinated facts, provider outage (graceful degradation), abusive prompts, cost spikes.
- **Future enhancements:** Voice interaction, personalised daily briefings, image-based questions.

---

## 6. Quiz System

### 6.1 Modes

| Mode | Description | Status |
| --- | --- | --- |
| Solo | Single player against the clock and their own record | Core |
| Daily Challenge | One shared quiz per day, one attempt, ranked | Core |
| PvP | Head-to-head, same questions, live or asynchronous | Planned |
| Multiplayer | Rooms of 3+ players with a live scoreboard | Planned |
| Tournament | Bracketed or points-based multi-round events | Future |

### 6.2 Categories

Countries, Capitals, Flags, Maps and Borders, Physical Geography, Cities, Landmarks, Cultures and Languages, Economies and Populations, Oceans and Climate.

> **Note:** Categories are data, not code. Adding one must never require a code change.

### 6.3 Difficulty progression

| Level | Scope | Unlock rule |
| --- | --- | --- |
| Explorer | Widely known facts | Always available |
| Navigator | Regional detail | Available after any Explorer completion |
| Cartographer | Precise and less common facts | Recommended after consistent Navigator accuracy |
| GEOmaster | Expert, low-frequency knowledge | Recommended after consistent Cartographer accuracy |

Progression is **recommended, never locked** — any user may attempt any difficulty.

### 6.4 Question and answer rules

- Question types at launch: multiple choice (MCQ), true/false, short text answer, image identification.
- **MCQ limits:** exactly 4 options; one correct answer; options shuffled per attempt; no "all of the above".
- **Accepted answer rules for text input:** case-insensitive; leading/trailing whitespace ignored; diacritics normalised; a curated alias list per answer (e.g. "USA", "United States", "United States of America"); minor typos accepted only via an explicit alias, never by fuzzy guessing.
- **Timer constraints:** per-question timer default 20 seconds, configurable 10–60 per quiz; an optional whole-quiz timer; timeout counts as an incorrect answer; timers pause in solo mode when the tab is hidden and never pause in PvP or multiplayer.
- **Scoring:** correctness is primary; remaining time is a secondary bonus; streak within an attempt applies a capped multiplier.
- **Live scoreboards:** required in multiplayer and tournaments, updating after each question; hidden in solo.

### 6.5 Content creation and approval

```text
Draft (creator)  ->  Submitted  ->  In review (admin)  ->  Approved -> Published
                                          |
                                          -> Changes requested -> Draft
                                          -> Rejected (with reason)
```

- All questions are manually written at launch; AI assistance is a drafting aid only.
- Every question requires: text, correct answer, distractors (MCQ), category, difficulty, and a source or GEOlibrary link.
- Published content can be reported by users, which returns it to review.

### 6.6 Discovery

Quizzes surface through curated rows, category browsing, search, GEOlibrary cross-links ("test yourself on this"), and recommendations based on history.

> **Placeholder — future additions:** map-pin questions, audio questions, timed marathon mode, co-op mode, offline play, printable quiz export.

---

## 7. User Profiles

| Element | Description | Visibility |
| --- | --- | --- |
| Avatar | Uploaded image or generated default | Public |
| Display name | Unique handle plus optional display name | Public |
| Country | Self-selected, drives country leaderboards | Public (optional) |
| Bio | Short free text | Public (optional) |
| Achievements | Unlocked and in-progress milestones | Public |
| Badges | Status markers, non-spendable | Public |
| Quiz history | Past attempts with score, accuracy, date | Private by default |
| Statistics | Totals, accuracy by category, best times, favourite category | Configurable |
| Current streak | Consecutive active days, plus longest streak | Public |
| Progress | Category mastery and level progression | Configurable |
| Bookmarks | Saved library entries, quizzes, store items | Private |
| Credits balance | Spendable reward currency | Private |
| Premium status | Active plan and renewal date | Private (badge may be public) |
| Creator status | Creator role, published item count, attribution page | Public when active |
| Settings | Notifications, privacy, motion preference, units, language | Private |

Rules:

- [ ] Every profile field has an explicit visibility default; nothing sensitive is public by accident.
- [ ] Users can make their whole profile private without losing functionality.
- [ ] Roles (user, creator, admin) live in a separate roles table and are never client-trusted.

---

## 8. GEOlibrary

### 8.1 Content organisation

| Layer | Example |
| --- | --- |
| Collection | Continents, Countries, Capitals, Flags, Physical Geography, Cultures, Landmarks |
| Entry | "Iceland", "The Sahel", "Flag of Nepal" |
| Section within entry | Overview, Geography, People, Economy, Did you know |
| Cross-links | Related entries, related quizzes, related store items |

### 8.2 Behaviour

- **Search:** scoped library search plus global search integration; filters by collection and region.
- **Bookmarks:** any entry can be saved; bookmarks appear on Profile.
- **Recommendations:** "next to read" driven by the user's weakest quiz categories and recent activity.
- **Reading progress:** entries mark as read; long entries track scroll position and resume; collections show a completion percentage.
- **Offline-friendly reading:** content pages must be readable with a slow connection and no 3D assets.

> **Future consideration:** Guided learning paths (ordered entry sequences with checkpoints), narrated audio versions, printable study sheets, teacher-assignable modules.

---

## 9. GEOstore

| Concept | Definition |
| --- | --- |
| Product | Anything purchasable: digital item, credit pack, or physical merchandise (future) |
| Credits | In-platform currency, earned or purchased, spent on digital items |
| Purchase | A completed transaction, paid with money or credits |
| Order | The record of a purchase, with status and history |
| Digital item | Avatars, frames, themes, badge skins, premium quiz packs |
| Wishlist | Saved items a user intends to buy |

Behaviour:

- Browsing is public; checkout requires an account.
- Cart persists across sessions for signed-in users and locally for guests.
- Digital entitlements are granted immediately after confirmed payment and are non-transferable.
- Every order is visible under Profile with status, items and receipt.
- Credits and money are never mixed in a single transaction at launch.

> **Future consideration:** Physical merchandise (maps, posters, apparel) with shipping, tax and returns; limited-edition seasonal drops; gifting.

---

## 10. Premium Membership

### 10.1 Philosophy

Core learning is free forever. Premium buys **depth, convenience and status** — never the ability to learn geography. Nothing that is free today becomes paid later.

### 10.2 Placeholders

| Item | Status |
| --- | --- |
| Plan names and pricing | To be finalised |
| Monthly vs annual split | To be finalised |
| Benefit list | Draft: advanced statistics, unlimited attempt history, exclusive quiz packs, ad-free (if ads ever exist), profile customisation, early feature access |
| Creator access | Draft: creator application open to all; premium may fast-track review |
| Free-tier limits | To be finalised — must not restrict core play |
| Student/teacher discounts | Under consideration |

---

## 11. Rewards System

### 11.1 Credits

- Earned from completed quizzes, daily challenges, streak milestones and achievements.
- Spent in GEOstore on digital items.
- Recorded as an append-only ledger with a reason for every entry.
- Never expire.

### 11.2 Achievements

Tiered, criteria-driven milestones across categories, accuracy, speed, consistency and exploration. Visible while locked so they act as goals.

### 11.3 Badges

Non-spendable status markers shown on the profile and next to leaderboard entries: early supporter, creator, tournament placements, seasonal participation.

### 11.4 Prize philosophy

Rewards must reinforce learning, never gambling. No loot boxes, no randomised paid rewards, no pay-to-win advantages in ranked play. Real-world prizes, if introduced, are tied to skill outcomes with published rules.

> **Future consideration:** Seasons with reward tracks, referral rewards, team rewards for clubs and classes.

---

## 12. Non-Functional Requirements

| Area | Requirement |
| --- | --- |
| Performance | LCP < 2.5 s on a mid-range mobile device over 4G; CLS < 0.1; INP < 200 ms; 3D scene renders only while visible and pauses when the tab is hidden |
| Accessibility | WCAG 2.1 AA: keyboard operable throughout, visible focus, 4.5:1 text contrast, semantic landmarks, `prefers-reduced-motion` honoured for all animation including the globe |
| Responsiveness | Fully usable from 320 px to ultrawide; no horizontal scroll; touch targets at least 44 px |
| Security | Row-level security on all user data; roles server-verified; secrets never in client code; webhooks signature-verified; all input validated server-side |
| Scalability | Feature-first modules, paginated data access, indexed queries, cacheable public content, no unbounded fetches |
| Reliability | Route-level error boundaries with recovery; graceful degradation without WebGL; no dead ends on failure |
| Maintainability | TypeScript strict, shared design tokens, no duplicated logic, lint and typecheck clean before merge |
| SEO | Unique title (<60 chars) and description (<160 chars) per route, single H1, semantic HTML, image alt text, canonical URLs, Open Graph and Twitter cards, JSON-LD where applicable |

---

## 13. Design Principles

The **GEOverze Design System is locked**. All future development must preserve it.

- [ ] **Cinematic deep-space aesthetic** — dark, restrained, atmospheric; the Milky Way backdrop is global and never overpowers content.
- [ ] **Bronze premium identity** — bronze is the single accent; it signals interaction and importance.
- [ ] **Glassmorphism** — dark charcoal glass panels with blur and hairline borders for all surfaces.
- [ ] **Modern typography** — light weights, generous tracking on eyebrows, tight tracking on display headings.
- [ ] **Spacious layouts** — whitespace is a feature; sections breathe.
- [ ] **Interactive 3D Home page only** — every other page is an elegant 2D room in the same universe.
- [ ] **Consistent design tokens** — all colour, gradient, shadow and glow values come from tokens in `src/styles.css`. Hardcoded colour utilities are prohibited.

Additional rules:

- Motion is purposeful and eased; nothing bounces or flashes.
- Unbuilt modules show designed "coming soon" placeholders, never fake data.
- New components extend the shared library before anything bespoke is written.

---

## 14. Technical Principles

- **Reusable components** — shared UI lives in `src/components/shared` and is used everywhere before a one-off is created.
- **Modular, feature-first architecture** — routes are thin shells; page logic lives in `src/features/<module>/` with its own `components/`, `data/` and barrel export.
- **TypeScript everywhere** — strict mode, no `any` in application code, typed route and navigation contracts.
- **State discipline** — global state in Zustand stores with narrow selectors; server state through the query layer; nothing global that could be local.
- **Lazy loading** — heavy assets (3D scene, textures, charts) load on demand and behind capability checks.
- **Error boundaries** — every route has a fallback that keeps the layout shell intact and offers recovery.
- **Clean folder organisation** — predictable naming, barrels for public surfaces, no cross-feature deep imports.
- **Server boundaries** — app logic through server functions; external callers through public API routes with verification.
- **Minimal technical debt** — unused dependencies and dead components are removed in the phase that orphans them; lint and typecheck stay clean.
- **Accessibility and performance are acceptance criteria**, not follow-up tickets.

---

## 15. Future Integrations

| Integration | Purpose | Status |
| --- | --- | --- |
| AI | Question drafting, explanations, adaptive plans, assistant | Planned |
| Maps | Interactive map questions, country boundaries, pin placement | Planned |
| Payment providers | Subscriptions and store checkout | Planned |
| Analytics | Product analytics and funnel measurement, privacy-respecting | Planned |
| Email services | Transactional email, digests, streak reminders | Planned |
| Localization | Multi-language UI and content, RTL support | Future |
| Mobile apps | iOS and Android, shared design system | Future |
| Desktop apps | Packaged desktop experience | Future |
| Public API | Third-party access to quizzes and content | Future |
| Educational partnerships | Schools, curricula, institutional accounts | Future |

> **Note:** No integration ships without a defined failure mode. The product must remain usable when any third party is unavailable.

---

## 16. Success Metrics

| Domain | Metric | Long-term target |
| --- | --- | --- |
| Engagement | Quizzes completed per active user per week | 5+ |
| Engagement | Median session duration | 8+ minutes |
| Learning outcomes | Accuracy improvement per category over 30 days | +15 points |
| Learning outcomes | Users advancing at least one difficulty level | 40% of active users |
| Performance | Lighthouse performance on Home (mobile) | 85+ |
| Performance | Core Web Vitals passing on all key routes | 100% of routes |
| Accessibility | Automated audit issues on key routes | 0 critical |
| Accessibility | Keyboard-only completion of the core journey | Fully supported |
| Growth | Month-over-month new registered users | Sustained positive |
| Growth | Organic search share of new sessions | 40%+ |
| Retention | Day-7 retention | 25%+ |
| Retention | Day-30 retention | 12%+ |
| Retention | Median streak length among returning users | 5+ days |
| Product quality | Crash/error-free session rate | 99.5%+ |
| Product quality | Content reports resolved within SLA | 95%+ |

---

## 17. Open Questions

Record product decisions here before implementation. Move resolved rows into the relevant section and delete them from this table.

| # | Question | Area | Owner | Status |
| --- | --- | --- | --- | --- |
| 1 | Final premium plan names, pricing and currency strategy | Premium | Product | Open |
| 2 | Exact free-tier limits, if any | Premium | Product | Open |
| 3 | Credit earn rates and store price anchoring | Rewards / Store | Product | Open |
| 4 | Minimum age policy and parental consent handling | Community / Legal | Product | Open |
| 5 | Whether PvP or multiplayer ships first | Quiz System | Engineering | Open |
| 6 | Anti-cheat approach for ranked play | Leaderboards | Engineering | Open |
| 7 | Creator revenue share model | Creator | Product | Open |
| 8 | First set of supported languages for localisation | Localization | Product | Open |
| 9 | Whether physical merchandise is in scope at all | Store | Product | Open |
| 10 | Public API scope and access model | Integrations | Engineering | Open |

---

## 18. Living Document

This PRD is a **living document**. It must be updated whenever a new product decision is finalised — not after implementation, but as part of it.

Update rules:

- [ ] Any behavioural change to a feature updates its specification in [Section 5](#5-feature-specifications) or [Section 6](#6-quiz-system) in the same change.
- [ ] Resolved items move out of [Section 17](#17-open-questions) into their permanent section.
- [ ] New features are added with all seven specification fields; partial specifications are not accepted.
- [ ] Design and technical principles ([Sections 13](#13-design-principles) and [14](#14-technical-principles)) change only by explicit decision, never incidentally.
- [ ] Sequencing lives in the roadmap; behaviour lives here. Keep the two consistent and avoid duplicating either.

Everything in this document must stay aligned with the GEOverze mission, the locked design system, and the long-term vision of a premium, education-first geography platform.
