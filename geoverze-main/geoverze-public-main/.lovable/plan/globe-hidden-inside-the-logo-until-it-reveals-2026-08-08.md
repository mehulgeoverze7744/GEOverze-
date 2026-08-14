# Globe hidden inside the logo until it reveals

Right now the bronze globe is already rendered at full opacity at the start of the hero, sitting behind the emblem at roughly the emblem's size, so it peeks out around the logo. The logo also starts fading immediately. The fix is a small timing/layering change in the two existing hero files — no new components, assets, dependencies or layout changes.

## Behavior after the change

1. At the very start only the GEOverze emblem is visible; the globe is fully invisible and contained within the emblem's footprint.
2. As scroll begins, the globe fades and scales out from inside the emblem while the emblem fades away, so the globe reads as emerging from the logo.
3. From the mid-point onwards, growth, parking on the right, rotation and every existing panel/CTA behavior stay exactly as today.

## Technical changes

`src/components/geoverze/BronzeGlobe.tsx`
- Make the existing material `transparent` and drive `material.opacity` from progress in the existing `useFrame`: 0 until the reveal window opens (~p 0.05), eased to 1 by ~p 0.18. No flash before that.
- Start the emerge scale from a value smaller than the emblem's inner disc so nothing pokes out from behind the logo, then reach the current `bigScale`/`finalScale` values unchanged.

`src/components/geoverze/GlobeScene.tsx`
- Lower `startScale` slightly (emblem inner-disc sized) so the initial sphere is fully covered by the emblem art. All other layout numbers untouched.

`src/features/marketing/components/HomeHero.tsx`
- Keep the emblem fully opaque until the reveal window starts, then fade it on the same curve as the globe (adjust only the existing `t` mapping in the scroll callback).
- Add a `z-10` on the existing emblem wrapper so it paints above the canvas during the covered phase.

Mobile and desktop share the same progress-driven curves, so both behave identically. Reduced-motion (progress jumps to 1) still ends in the current final state.
