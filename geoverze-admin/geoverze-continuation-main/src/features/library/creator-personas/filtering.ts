import type { LibraryCreatorPersona, CreatorPersonaFilterState } from "./types";

export function matchesCreatorSearch(persona: LibraryCreatorPersona, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return (
    persona.displayName.toLowerCase().includes(q) ||
    persona.handle.toLowerCase().includes(q) ||
    persona.role.toLowerCase().includes(q) ||
    persona.bio.toLowerCase().includes(q) ||
    persona.location.toLowerCase().includes(q)
  );
}

export function filterCreatorPersonas(
  personas: readonly LibraryCreatorPersona[],
  query: string,
  filters: CreatorPersonaFilterState,
): LibraryCreatorPersona[] {
  return personas.filter((persona) => {
    if (!matchesCreatorSearch(persona, query)) return false;
    if (filters.verified === "yes" && !persona.verified) return false;
    if (filters.verified === "no" && persona.verified) return false;
    return true;
  });
}
