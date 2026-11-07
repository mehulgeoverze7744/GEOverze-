const BOARD_SRC: Record<string, string> = {
  africa: "/assets/maps/africa.svg",
  "map-africa": "/assets/maps/africa.svg",
  europe: "/assets/maps/europe.svg",
  "map-europe": "/assets/maps/europe.svg",
  asia: "/assets/maps/asia.svg",
  "map-asia": "/assets/maps/asia.svg",
  samerica: "/assets/maps/south-america.svg",
  "south-america": "/assets/maps/south-america.svg",
  "map-samerica": "/assets/maps/south-america.svg",
  oceania: "/assets/maps/oceania.svg",
  "map-oceania": "/assets/maps/oceania.svg",
  world: "/assets/maps/world.svg",
  "map-world": "/assets/maps/world.svg",
};

/** Real map artwork for pin questions. Legacy board keys still resolve. */
export function mapBoardSrc(boardArt: string | undefined | null): string {
  if (!boardArt) return "/assets/maps/world.svg";
  if (boardArt.startsWith("/") || boardArt.startsWith("http")) return boardArt;
  return BOARD_SRC[boardArt] ?? BOARD_SRC[boardArt.replace(/^map-/, "")] ?? "/assets/maps/world.svg";
}
