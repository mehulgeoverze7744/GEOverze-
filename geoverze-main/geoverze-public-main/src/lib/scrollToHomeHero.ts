/** Scrolls the viewport to the Home hero (top of `/`). */
export function scrollToHomeHero(behavior: ScrollBehavior = "smooth") {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.scrollTo({ top: 0, behavior: reduced ? "auto" : behavior });
}
