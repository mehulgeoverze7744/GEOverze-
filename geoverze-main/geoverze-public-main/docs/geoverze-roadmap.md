# GEOverze Roadmap

> **Project:** GEOverze  
> **Slogan:** Know Earth  
> **Tagline:** Think Global  
> **Document type:** Internal reference  
> **Status:** Living document

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Design Philosophy](#design-philosophy)
3. [Technical Foundation](#technical-foundation)
4. [Product Vision](#product-vision)
5. [Development Principles](#development-principles)
6. [Development Roadmap](#development-roadmap)
7. [Future Ideas](#future-ideas)
8. [Project Standards](#project-standards)
9. [Success Metrics](#success-metrics)
10. [Living Document](#living-document)

---

## Project Overview

GEOverze is a premium geography learning platform that combines education, exploration, interactive experiences, and community into one cohesive ecosystem.

### Official Branding

| Element | Value |
| --- | --- |
| **Project Name** | GEOverze |
| **Slogan** | Know Earth |
| **Tagline** | Think Global |
| **Mission** | To make learning geography immersive, enjoyable, and accessible through beautiful design, interactive technology, and meaningful experiences. |

GEOverze is not a simple quiz website. It is a long-term platform built to inspire curiosity about the world, reward exploration, and connect learners through shared discovery.

---

## Design Philosophy

The GEOverze Design System is the official visual language of the platform. It is permanent unless intentionally rebranded.

### Core Design Language

| Principle | Description |
| --- | --- |
| **Cinematic deep-space universe theme** | A near-black void with a soft Milky Way band, sharp stars, and restrained nebulae in indigo, violet, and faint copper tones. |
| **Interactive 3D globe** | The Home page features a bronze 3D globe that responds to scroll and serves as the signature brand moment. |
| **Bronze metallic accent colors** | Warm bronze is the primary accent, used for focus states, highlights, icons, and premium calls-to-action. |
| **Dark premium interface** | Deep charcoal surfaces, low luminance, and high contrast for a cinematic, high-end feel. |
| **Glassmorphism** | Translucent panels with subtle blur and bronze-tinted borders for depth and layering. |
| **Atmospheric lighting** | Soft key lights, rim lighting on the globe, and radial blooms that guide attention without overwhelming. |
| **Modern geometric typography** | Clean, spacious letterforms with tight tracking for headings and generous line-height for readability. |
| **Spacious layouts** | Generous whitespace, clear hierarchy, and section breathing room. |
| **Smooth animations** | Scroll-driven motion, cinematic easing, and reduced-motion support by default. |
| **Premium visual consistency** | Every component, page, and interaction reinforces the same universe. |

---

## Technical Foundation

GEOverze is built on a modern, scalable stack chosen to support long-term growth, performance, and a premium user experience.

### Technology Stack

| Layer | Technology | Purpose |
| --- | --- | --- |
| **Framework** | TanStack Start (React 19) | Full-stack React framework with file-based routing, SSR/SSG, and server functions. |
| **Build tool** | Vite 7 | Fast development and optimized production builds. |
| **Styling** | Tailwind CSS v4 | Utility-first styling with native CSS theme variables and custom design tokens. |
| **UI primitives** | Radix UI | Accessible, unstyled components for dialogs, dropdowns, forms, and more. |
| **3D graphics** | React Three Fiber + Three.js | Interactive 3D globe and future WebGL experiences. |
| **Animations** | GSAP + ScrollTrigger | Scroll-driven cinematic animations and timeline control. |
| **State management** | Zustand | Lightweight, modular stores for auth, preferences, cart, notifications, and quiz state. |
| **Backend** | Lovable Cloud (PostgreSQL, auth, storage, serverless functions) | Managed backend for data, authentication, file storage, and server-side logic. |
| **Icons** | Lucide React | Consistent, lightweight iconography. |
| **Notifications** | Sonner | Toast and notification UI. |
| **Forms** | React Hook Form + Zod | Type-safe form handling and validation. |

### Why This Stack

- **TanStack Start** provides a unified client-server model, type-safe routing, and edge-ready deployment.
- **React Three Fiber** keeps 3D code declarative and composable inside React.
- **GSAP** offers frame-precise scroll-synced animation without React re-render overhead.
- **Zustand** keeps state simple, modular, and easy to persist.
- **Lovable Cloud** removes backend setup friction while providing production-grade PostgreSQL, auth, and serverless functions.
- **Tailwind v4** enables a token-driven design system that is easy to maintain and extend.

---

## Product Vision

GEOverze is a complete ecosystem, not a single feature. Every area of the platform feeds the others.

### Ecosystem Map

| Area | Purpose |
| --- | --- |
| **Home** | The cinematic entry point that communicates what GEOverze is, why it matters, and where to begin. |
| **Let's Play** | The primary destination for browsing, filtering, and launching quizzes and learning games. |
| **GEOlibrary** | A curated collection of learning resources, articles, maps, and educational content. |
| **GEOstore** | Digital and physical products, credits, orders, wishlists, and future merchandise. |
| **Pricing** | Clear membership tiers, subscription options, and premium benefits. |
| **Leaderboards** | Global, country, friend, and seasonal rankings that motivate engagement. |
| **User Profiles** | Achievements, statistics, progress tracking, bookmarks, and activity history. |
| **Creator Tools** | A platform for trusted contributors to build and publish quizzes and learning content. |
| **Admin Dashboard** | Internal tools for user management, moderation, analytics, and site configuration. |
| **Community Features** | Friends, following, comments, notifications, and an activity feed. |

---

## Development Principles

These principles guide every technical decision on the GEOverze platform.

- [x] **Performance first.** Every feature is measured against load time, runtime smoothness, and bundle size.
- [x] **Reusable components.** UI is built from shared, composable components in `src/components/shared/`.
- [x] **Accessibility by default.** Semantic HTML, ARIA attributes, keyboard navigation, and reduced-motion support are required.
- [x] **Mobile-first responsive design.** Layouts work on small screens first and scale up gracefully.
- [x] **Scalable architecture.** Features live in `src/features/<module>/` with their own components, data, and exports.
- [x] **Clean code.** Readable, well-named, and consistently formatted code is prioritized over clever code.
- [x] **Production-ready quality.** Phases are not considered complete until linting, types, performance, and accessibility are verified.
- [x] **Consistent design tokens.** Colors, spacing, shadows, and animations are defined in `src/styles.css` and used everywhere.
- [x] **No unnecessary complexity.** Tools and abstractions are added only when they solve a real problem.

---

## Development Roadmap

The roadmap is organized into sequential phases. Each phase builds on the previous one. Status is tracked with checklists.

### Phase 1 — Foundation & Architecture

- [x] Set up project structure and design tokens.
- [x] Implement shared component library.
- [x] Establish routing, layout shell, and navigation.
- [x] Create placeholder routes for all platform pages.
- [x] Build authentication UI placeholders.
- [x] Integrate the 3D globe and universe background.

**Status:** Completed

### Phase 1.5 — Performance & Production Polish

- [x] Audit and optimize 3D rendering.
- [x] Remove unused dependencies and components.
- [x] Refactor scroll animation for performance.
- [x] Improve accessibility across layout and shared components.
- [x] Resolve lint and formatting issues.

**Status:** Completed

### Phase 1.6 — Architecture & Scalability Review

- [x] Introduce Zustand store architecture.
- [x] Refactor routes into feature-first modules.
- [x] Implement production-grade routing and error handling.
- [x] Add WebGL capability detection and fallback.
- [x] Finalize component and file organization conventions.

**Status:** Completed

### Phase 2 — Home Page Experience & Brand Storytelling

- [ ] Finalize hero messaging and scroll-driven narrative.
- [ ] Implement all home page sections with consistent reveals.
- [ ] Ensure the 3D globe and background remain the focal point.
- [ ] Validate full-page scroll experience across viewports.

**Status:** In Progress

### Phase 3 — Authentication

- [ ] Login
- [ ] Registration
- [ ] Forgot Password
- [ ] Email Verification
- [ ] User Sessions

**Status:** Planned

### Phase 4 — Let's Play

- [ ] Quiz Categories
- [ ] Quiz Browser
- [ ] Search
- [ ] Filters
- [ ] Difficulty Levels
- [ ] Game Modes

**Status:** Planned

### Phase 5 — Quiz Engine

- [ ] Multiple Choice Questions (MCQ)
- [ ] Map Quizzes
- [ ] Flag Quizzes
- [ ] Typing Quizzes
- [ ] Timers
- [ ] Scoring
- [ ] Hints
- [ ] Results

**Status:** Planned

### Phase 6 — User Profiles

- [ ] Achievements
- [ ] Statistics
- [ ] Progress Tracking
- [ ] Bookmarks
- [ ] Activity History

**Status:** Planned

### Phase 7 — Leaderboards

- [ ] Global Rankings
- [ ] Country Rankings
- [ ] Friends Rankings
- [ ] Seasonal Rankings

**Status:** Planned

### Phase 8 — GEOlibrary

- [ ] Learning Resources
- [ ] Articles
- [ ] Maps
- [ ] Educational Content
- [ ] Bookmarks
- [ ] Search

**Status:** Planned

### Phase 9 — GEOstore

- [ ] Digital Products
- [ ] Physical Products
- [ ] Credits
- [ ] Orders
- [ ] Wishlist
- [ ] Future Merchandise

**Status:** Planned

### Phase 10 — Premium Membership

- [ ] Subscriptions
- [ ] Premium Features
- [ ] Billing
- [ ] Member Benefits

**Status:** Planned

### Phase 11 — Payments

- [ ] Payment Gateway
- [ ] Wallet
- [ ] Rewards
- [ ] Credits
- [ ] Transactions
- [ ] Prize Distribution

**Status:** Planned

### Phase 12 — Competitive Features

- [ ] Daily Challenges
- [ ] Tournaments
- [ ] Live Trivia
- [ ] Events
- [ ] Rewards

**Status:** Planned

### Phase 13 — Creator Platform

- [ ] Quiz Builder
- [ ] Publishing Workflow
- [ ] Analytics
- [ ] Moderation
- [ ] Community Content

**Status:** Planned

### Phase 14 — Admin Dashboard

- [ ] User Management
- [ ] Quiz Moderation
- [ ] Store Management
- [ ] Analytics
- [ ] Reports
- [ ] Site Configuration

**Status:** Planned

### Phase 15 — Community Features

- [ ] Friends
- [ ] Following
- [ ] Comments
- [ ] Notifications
- [ ] Activity Feed

**Status:** Planned

### Phase 16 — AI Features

- [ ] Personalized Learning
- [ ] Adaptive Difficulty
- [ ] Recommendations
- [ ] Smart Search
- [ ] AI Assistance

**Status:** Planned

### Phase 17 — Global Expansion

- [ ] Localization
- [ ] Multiple Languages
- [ ] Regional Content
- [ ] International Communities

**Status:** Planned

---

## Future Ideas

The following concepts are not yet planned for development. They are recorded here for future exploration and discussion.

- [ ] Educational partnerships with schools and universities.
- [ ] Travel integrations and geography-based travel inspiration.
- [ ] Official geography competitions and live events.
- [ ] Public API for third-party developers and educators.
- [ ] Native mobile applications for iOS and Android.
- [ ] Desktop applications for classrooms and home use.
- [ ] Offline learning modes for low-connectivity environments.

---

## Project Standards

### Naming Conventions

| Category | Convention | Example |
| --- | --- | --- |
| Components | PascalCase, descriptive | `GlassCard.tsx` |
| Hooks | camelCase, prefixed with `use` | `useScrollProgress.ts` |
| Stores | camelCase, suffixed with `Store` | `authStore.ts` |
| Utilities | camelCase | `cn.ts` |
| Feature folders | kebab-case | `marketing/`, `leaderboard/` |
| Routes | kebab-case matching URL | `forgot-password.tsx` |
| Constants | UPPER_SNAKE_CASE for true constants | `MAX_RETRIES` |

### Folder Organization

```text
src/
  components/
    geoverze/       # 3D globe and universe-specific components
    layout/         # Navbar, Footer, PageShell, UniverseBackground
    shared/         # Reusable UI components and variants
  config/           # Site-wide configuration and navigation
  features/         # Feature-first modules
    <module>/
      components/   # Feature-specific UI
      data/         # Static data, copy, and fixtures
      index.ts      # Public barrel exports
  hooks/            # Shared custom hooks
  lib/              # Utilities and helpers
  routes/           # TanStack Start file-based routes
  stores/           # Zustand stores
  styles.css        # Global design tokens and Tailwind theme
```

### Component Philosophy

- Components are small, focused, and composable.
- Shared components live in `src/components/shared/`.
- Feature-specific components live in `src/features/<module>/components/`.
- Variants are extracted into dedicated files when they cause Fast Refresh warnings.
- Props are typed explicitly; avoid `any`.
- Memoize pure presentation components to prevent unnecessary re-renders.

### Performance Expectations

- Target Lighthouse score of 90+ across all categories.
- Keep initial bundle size reasonable; lazy-load heavy features.
- Pause or throttle 3D rendering when off-screen or hidden.
- Use `requestAnimationFrame` for imperative DOM updates.
- Prefer `IntersectionObserver` over scroll event listeners.

### Accessibility Expectations

- All interactive elements are keyboard accessible.
- Focus states are visible and follow the bronze accent.
- Decorative elements use `aria-hidden`.
- Images include meaningful `alt` text.
- Color contrast meets WCAG 2.1 AA standards.
- Reduced-motion preferences are honored.

### Testing Expectations

- Unit tests for pure utility functions.
- Component tests for critical shared UI.
- End-to-end tests for primary user flows.
- Visual regression checks for the Home page and global layout.

### Documentation Expectations

- Complex components include a short JSDoc comment explaining purpose.
- The roadmap is updated when phases begin, complete, or change.
- New features include a brief note in this document when they enter active development.

---

## Success Metrics

Long-term goals that define a successful GEOverze platform.

| Metric | Target |
| --- | --- |
| **Lighthouse scores** | 90+ in Performance, Accessibility, Best Practices, and SEO. |
| **Core Web Vitals** | LCP < 2.5s, INP < 200ms, CLS < 0.1. |
| **Accessibility** | WCAG 2.1 AA compliance across all user-facing pages. |
| **Modular architecture** | New features can be added without touching unrelated modules. |
| **Scalable infrastructure** | Backend can grow with user base without re-architecture. |
| **Consistent UI** | Every page feels like the same universe. |
| **Learning experience** | Users report geography learning as enjoyable and rewarding. |
| **Global community** | Active, engaged users from multiple countries and regions. |

---

## Living Document

This roadmap is a living document. It will evolve as GEOverze grows, as priorities shift, and as new opportunities emerge.

Updates should preserve the project's mission, design philosophy, and long-term vision. Major changes should be reviewed to ensure they remain aligned with the GEOverze identity.

> *Know Earth. Think Global.*
