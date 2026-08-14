# Pricing Page Logo Size

## Goal
Increase the size of the GEOverze logo on the Pricing page so it fills the space up to the surrounding circular ring, while keeping every other page unchanged.

## Current state
- `src/features/pricing/components/OrbitalMark.tsx` renders the logo at the center of the orbital rings.
- The emblem is wrapped in a fixed-size span: `h-28 w-28 md:h-36 md:w-36`.
- The surrounding ring sits at `inset: 40%`, so its outer edge is at 60% of the container width.
- The current fixed emblem is much smaller than that ring, leaving a large empty gap.
- `OrbitalMark` is only used inside `PricingHero`, so it is safe to adjust only this component.

## Change
Edit `src/features/pricing/components/OrbitalMark.tsx`:

- Replace the fixed-size emblem wrapper with a proportional size that reaches the outer ring.
- Keep the logo centered, keep `BrandMark size="fill"`, and keep the ring, orbit, and glow styles untouched.

Example target:

```tsx
<span className="relative flex aspect-square w-[56%] items-center justify-center">
  <BrandMark size="fill" />
</span>
```

The exact percentage may be tuned slightly after preview so the emblem approaches but does not fully obscure the ring.

## Verification
1. Confirm the project still type-checks/builds.
2. Open the Pricing page preview and take a screenshot of the hero area.
3. Confirm the emblem is larger, centered, and reaches near the outer ring.
4. Spot-check the Home page and other routes to confirm the logo size is unchanged elsewhere.

## Scope
- Only `OrbitalMark.tsx` will be modified.
- No new dependencies, no business logic changes, no other routes or components affected.
