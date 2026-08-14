# GEOverze Orbit

Create a dark, premium 3D landing page for GEOverze using React + React Three Fiber + GSAP ScrollTrigger.

Logo & Assets

Use the provided bronze circular logo (GEOverze emblem with globe in the center, “GEOVERSE” on top, “Know Earth” at the bottom, two stars on the sides).

The logo must appear sharp and metallic (bronze + dark metal finish).

Animation Sequence (Scroll-driven only)

Initial state (scroll progress 0%):

The full logo sits in the top-left corner of the viewport (size ≈ 140–160px).

Background is pure black / very dark charcoal.

No other elements visible.

Globe is completely still.

Scroll 1–2 (0% → 40%):

The globe (Earth) detaches from the logo and comes outwards in true 3D.

It grows smoothly until it almost fills the entire screen.

Scroll-linked rotation begins:

As the globe extracts and scales up, it starts a slow, elegant rotation on the Y-axis (horizontal spin).

Rotation amount is directly tied to scroll progress (approximately 0° → 180° during this phase).

Slight additional X-axis tilt (max 8–10°) for cinematic depth.

The rest of the logo (outer ring + text + stars) fades and scales down, remaining fixed in the top-left as a small brand mark.

Soft metallic reflections and realistic Earth textures (Europe/Africa facing camera at the start to match the logo).

Scroll 3 (40% → 70%):

The large 3D globe stays dominant in the center while continuing to rotate.

Rotation intensifies slightly: Y-axis rotation continues (additional ~120–150°), still perfectly linked to scroll progress.

Very subtle continuous idle rotation is mixed in so the globe never feels completely static.

Camera slowly moves closer for a more immersive feel.

Scroll 4 / Final position (70% → 100%):

The 3D globe smoothly slides and settles on the right side of the page (occupying roughly the right 55–60% of the viewport).

Final rotation behavior:

As it moves to the right, the Y-axis rotation continues another ~90–120° and then eases into a gentle, continuous idle rotation (very slow, ~8–12 seconds per full turn).

A soft X-axis and Z-axis micro-rotation is added so the globe feels alive and three-dimensional even after the scroll ends.

Left side of the page remains empty (no content).

Technical Requirements

Use React Three Fiber for the 3D globe.

Globe must look realistic with Earth textures (continents clearly visible).

Material: metallic bronze matching the logo, with soft reflections and subtle roughness.

All rotations must be strictly scroll-linked using GSAP ScrollTrigger (scrub: true) so the rotation feels perfectly synced with the user’s scroll.

Pin the section during the entire animation sequence.

One single full-screen section.

Performance optimized.

Mobile responsive: same rotation logic, just scaled appropriately.

No text content, no buttons, no navigation — pure animation experience only.

Dark elegant background with subtle grain or soft lighting so the bronze globe pops.

Style

Premium, cinematic, high-end 3D feel.

Lighting: soft key light + rim light to enhance the bronze metallic look.

Camera movements should feel cinematic and fluid.

The rotation should feel heavy, premium, and deliberate — never fast or cheap.

Make the entire experience feel expensive and immersive. The globe should physically emerge from the logo, rotate in perfect sync with the scroll, and finally park itself elegantly on the right side while continuing a gentle, living rotation.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/3cfd3abe-6a73-485e-9ad0-670d849a5efa).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
