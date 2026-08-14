Footer opacity change

Make the shared footer fully opaque across every page with a minimal, single-file edit.

What we found
- The footer is rendered by a shared component in `src/components/layout/Footer.tsx` and imported once in `src/routes/__root.tsx`, so one change will apply everywhere.
- The `<footer>` element currently has no background color class, so it is transparent and the page background image shows through.
- There are no opacity, backdrop-blur, or glass-effect utilities on the footer element itself.

What we will change
- Add `bg-background` to the `<footer>` className in `src/components/layout/Footer.tsx`.
- This gives the footer the same solid dark background as the page body without changing its border, spacing, layout, typography, or content.

What we will not change
- No other component, route, or stylesheet will be touched.
- No images, animations, hover states, links, or footer content will be modified.
- The newsletter input and social icons keep their existing styling.

Verification
- After the edit, run a local build check and confirm the footer renders as a solid, opaque band over the page background on both desktop and mobile.
