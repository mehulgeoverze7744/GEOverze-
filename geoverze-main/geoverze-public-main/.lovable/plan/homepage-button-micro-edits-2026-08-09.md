# Homepage button micro-edits

Make only the two smallest Tailwind edits in `src/features/marketing/components/HomeHero.tsx` to the two homepage CTA buttons.

## Edits

1. "Let's Play" button
   - Change `Link` from `items-start` to `items-center`.
   - Remove the hidden arrow `<span>` (`→`).
   - Add `text-[1.37rem]` to the `Link` (about 75% larger than the current `0.78rem` button text).
   - The existing `font-bold uppercase tracking-[0.2em]` stays, so the text remains bold and centered.

2. "Watch Demo" button
   - Change `variant="dark"` to `variant="solid"` so it matches the "Let's Play" colour/gradient exactly.
   - Add `text-[0.7rem]` to the inner `span` (roughly 50% of the new "Let's Play" size).
   - Keep the same `font-cta` font style and existing uppercase/tracking/bold classes.

## Scope guardrails

- Only edit the two button blocks inside `HomeHero.tsx`.
- No new components, no new files, no image/asset changes, no layout or navigation changes, no homepage redesign.
- After editing, verify the page still renders and the buttons work (hover, click, modal).
