/**
 * Sample quiz sets for the engine.
 *
 * Placeholder content: hand-written questions with realistic metadata, no
 * backend. IDs line up with the Let's Play catalog so a hub card can deep-link
 * straight into its set; anything without its own set falls back by category.
 */
import type { QuizSet } from "./types";

const flags: QuizSet = {
  id: "q-flag-blitz",
  title: "Flag Blitz",
  description:
    "Fifty banners, five minutes. Colours, crests and the stories folded into every flag.",
  categoryId: "flags",
  creator: "GEOverze Studio",
  art: "flags",
  difficulty: "Easy",
  minutes: 5,
  language: "English",
  rewards: { xp: 240, credits: 60 },
  highScore: 8,
  bestStreak: 6,
  questions: [
    {
      id: "f1",
      type: "single",
      prompt: "Which country flies this flag?",
      media: { kind: "flag", glyph: "🇯🇵", caption: "A single crimson disc on white" },
      options: [
        { id: "a", label: "Bangladesh" },
        { id: "b", label: "Japan" },
        { id: "c", label: "Palau" },
        { id: "d", label: "South Korea" },
      ],
      answerId: "b",
      explanation:
        "Japan's Nisshōki places a plain crimson sun centred on white. Bangladesh offsets its disc and uses a green field.",
    },
    {
      id: "f2",
      type: "image",
      prompt: "Select the flag of Brazil.",
      options: [
        { id: "a", label: "Brazil", glyph: "🇧🇷", art: "flag-br" },
        { id: "b", label: "Argentina", glyph: "🇦🇷", art: "flag-ar" },
        { id: "c", label: "Portugal", glyph: "🇵🇹", art: "flag-pt" },
        { id: "d", label: "Colombia", glyph: "🇨🇴", art: "flag-co" },
      ],
      answerId: "a",
      explanation:
        "Green field, gold rhombus, blue celestial globe with the motto Ordem e Progresso.",
    },
    {
      id: "f3",
      type: "boolean",
      prompt: "Nepal is the only country in the world without a rectangular flag.",
      answer: true,
      explanation:
        "Nepal's flag is two stacked pennants — the only non-quadrilateral national flag.",
    },
    {
      id: "f4",
      type: "single",
      prompt: "This flag belongs to which Nordic country?",
      media: { kind: "flag", glyph: "🇮🇸", caption: "Blue field, white-edged red cross" },
      options: [
        { id: "a", label: "Norway" },
        { id: "b", label: "Iceland" },
        { id: "c", label: "Finland" },
        { id: "d", label: "Denmark" },
      ],
      answerId: "b",
      explanation: "Iceland inverts Norway's palette: blue field with a white-bordered red cross.",
    },
    {
      id: "f5",
      type: "multiple",
      prompt: "Which of these flags feature a maple, cedar or other tree or leaf?",
      options: [
        { id: "a", label: "Canada" },
        { id: "b", label: "Lebanon" },
        { id: "c", label: "Chile" },
        { id: "d", label: "Eritrea" },
      ],
      answerIds: ["a", "b", "d"],
      explanation:
        "Canada carries a maple leaf, Lebanon a cedar and Eritrea an olive branch wreath. Chile's emblem is a lone star.",
    },
    {
      id: "f6",
      type: "typed",
      prompt: "Name the country whose flag is a plain green field with no other charge.",
      accepted: ["libya"],
      placeholder: "Type a country",
      explanation:
        "Libya flew an all-green flag from 1977 to 2011 — the only single-colour national flag.",
    },
    {
      id: "f7",
      type: "single",
      prompt: "Which flag shows a golden dragon?",
      media: { kind: "flag", glyph: "🇧🇹", caption: "Saffron and orange split field" },
      options: [
        { id: "a", label: "Bhutan" },
        { id: "b", label: "Wales" },
        { id: "c", label: "Malta" },
        { id: "d", label: "Mongolia" },
      ],
      answerId: "a",
      explanation:
        "Bhutan's Druk, the thunder dragon, clutches jewels across a diagonally split field.",
    },
    {
      id: "f8",
      type: "boolean",
      prompt: "The flags of Indonesia and Monaco use the same two colours in the same order.",
      answer: true,
      explanation: "Both are red over white; only the proportions differ.",
    },
    {
      id: "f9",
      type: "image",
      prompt: "Which of these is the flag of South Africa?",
      options: [
        { id: "a", label: "Kenya", glyph: "🇰🇪", art: "flag-ke" },
        { id: "b", label: "South Africa", glyph: "🇿🇦", art: "flag-za" },
        { id: "c", label: "Ghana", glyph: "🇬🇭", art: "flag-gh" },
        { id: "d", label: "Zimbabwe", glyph: "🇿🇼", art: "flag-zw" },
      ],
      answerId: "b",
      explanation: "Six colours in a horizontal Y — the most colours on any current national flag.",
    },
    {
      id: "f10",
      type: "order",
      prompt: "Arrange these flags by the year their current design was adopted.",
      items: ["Denmark", "United States", "Canada", "South Africa"],
      explanation: "Ordering questions arrive with the sequencing engine.",
    },
  ],
};

const countries: QuizSet = {
  id: "q-atlas-sprint",
  title: "Atlas Sprint",
  description: "Borders, sizes and populations — a fast lap around every inhabited continent.",
  categoryId: "countries",
  creator: "GEOverze Studio",
  art: "countries",
  difficulty: "Medium",
  minutes: 7,
  language: "English",
  rewards: { xp: 320, credits: 80 },
  highScore: 7,
  bestStreak: 5,
  questions: [
    {
      id: "c1",
      type: "single",
      prompt: "Which country is the largest by land area?",
      options: [
        { id: "a", label: "Canada" },
        { id: "b", label: "China" },
        { id: "c", label: "Russia" },
        { id: "d", label: "United States" },
      ],
      answerId: "c",
      explanation: "Russia covers about 17.1 million km² — roughly 11% of the planet's land.",
    },
    {
      id: "c2",
      type: "multiple",
      prompt: "Which of these countries are landlocked?",
      options: [
        { id: "a", label: "Bolivia" },
        { id: "b", label: "Nepal" },
        { id: "c", label: "Vietnam" },
        { id: "d", label: "Austria" },
      ],
      answerIds: ["a", "b", "d"],
      explanation: "Vietnam has 3,260 km of coastline; the other three have none.",
    },
    {
      id: "c3",
      type: "boolean",
      prompt: "Turkey lies on two continents.",
      answer: true,
      explanation: "The Bosphorus splits Turkey between Europe and Asia.",
    },
    {
      id: "c4",
      type: "typed",
      prompt: "Which country has the most land neighbours, at fourteen?",
      accepted: ["china", "russia"],
      placeholder: "Type a country",
      explanation: "China and Russia are tied at fourteen land borders each.",
    },
    {
      id: "c5",
      type: "single",
      prompt: "Which country's outline is shown here?",
      media: { kind: "illustration", art: "outline-cl", caption: "A long, narrow strip of coast" },
      options: [
        { id: "a", label: "Chile" },
        { id: "b", label: "Norway" },
        { id: "c", label: "Vietnam" },
        { id: "d", label: "Italy" },
      ],
      answerId: "a",
      explanation: "Chile runs 4,300 km north to south and averages only 177 km wide.",
    },
    {
      id: "c6",
      type: "single",
      prompt: "Which is the smallest sovereign state in the world?",
      options: [
        { id: "a", label: "Monaco" },
        { id: "b", label: "Nauru" },
        { id: "c", label: "Vatican City" },
        { id: "d", label: "San Marino" },
      ],
      answerId: "c",
      explanation: "Vatican City covers 0.49 km² — smaller than most city parks.",
    },
    {
      id: "c7",
      type: "boolean",
      prompt: "Australia is both a country and a continent.",
      answer: true,
      explanation: "It is the only country to occupy an entire continental landmass.",
    },
    {
      id: "c8",
      type: "single",
      prompt: "Which country has the largest population?",
      options: [
        { id: "a", label: "India" },
        { id: "b", label: "China" },
        { id: "c", label: "United States" },
        { id: "d", label: "Indonesia" },
      ],
      answerId: "a",
      explanation: "India passed China in 2023 and now holds the largest population.",
    },
    {
      id: "c9",
      type: "multiple",
      prompt: "Which of these countries sit at least partly above the Arctic Circle?",
      options: [
        { id: "a", label: "Finland" },
        { id: "b", label: "Canada" },
        { id: "c", label: "Estonia" },
        { id: "d", label: "Russia" },
      ],
      answerIds: ["a", "b", "d"],
      explanation: "Estonia's northernmost point sits well south of 66°34′N.",
    },
    {
      id: "c10",
      type: "dragdrop",
      prompt: "Match each country to its continent.",
      items: ["Suriname", "Laos", "Namibia"],
      targets: ["South America", "Asia", "Africa"],
      explanation: "Matching questions arrive with the drag-and-drop engine.",
    },
  ],
};

const capitals: QuizSet = {
  id: "q-capital-cities",
  title: "Capital Confusion",
  description: "The obvious, the moved and the ones that catch everybody out.",
  categoryId: "capitals",
  creator: "Mira Osei",
  art: "capitals",
  difficulty: "Hard",
  minutes: 6,
  language: "English",
  rewards: { xp: 380, credits: 95 },
  highScore: 6,
  bestStreak: 4,
  questions: [
    {
      id: "p1",
      type: "single",
      prompt: "What is the capital of Australia?",
      options: [
        { id: "a", label: "Sydney" },
        { id: "b", label: "Melbourne" },
        { id: "c", label: "Canberra" },
        { id: "d", label: "Perth" },
      ],
      answerId: "c",
      explanation: "Canberra was purpose-built as a compromise between Sydney and Melbourne.",
    },
    {
      id: "p2",
      type: "typed",
      prompt: "Name the capital of Kazakhstan.",
      accepted: ["astana", "nur-sultan", "nur sultan"],
      placeholder: "Type a city",
      explanation: "Renamed Nur-Sultan in 2019 and back to Astana in 2022.",
    },
    {
      id: "p3",
      type: "boolean",
      prompt: "Bolivia has two capitals.",
      answer: true,
      explanation: "Sucre is the constitutional capital; La Paz holds the government.",
    },
    {
      id: "p4",
      type: "single",
      prompt: "Which city is the capital of Canada?",
      options: [
        { id: "a", label: "Toronto" },
        { id: "b", label: "Ottawa" },
        { id: "c", label: "Montréal" },
        { id: "d", label: "Vancouver" },
      ],
      answerId: "b",
      explanation: "Queen Victoria selected Ottawa in 1857 as a defensible middle ground.",
    },
    {
      id: "p5",
      type: "multiple",
      prompt: "Which of these are national capitals?",
      options: [
        { id: "a", label: "Naypyidaw" },
        { id: "b", label: "Casablanca" },
        { id: "c", label: "Yamoussoukro" },
        { id: "d", label: "Wellington" },
      ],
      answerIds: ["a", "c", "d"],
      explanation: "Morocco's capital is Rabat, not Casablanca.",
    },
    {
      id: "p6",
      type: "map",
      prompt: "Pin the approximate position of Nairobi.",
      boardArt: "map-africa",
      regions: [
        { id: "a", label: "Dakar", x: 12, y: 42 },
        { id: "b", label: "Cairo", x: 62, y: 16 },
        { id: "c", label: "Nairobi", x: 70, y: 60 },
        { id: "d", label: "Cape Town", x: 48, y: 90 },
      ],
      answerId: "c",
      explanation: "Nairobi sits in East Africa, just south of the equator at 1,795 m elevation.",
    },
    {
      id: "p7",
      type: "single",
      prompt: "Which is the highest capital city in the world by elevation?",
      options: [
        { id: "a", label: "Quito" },
        { id: "b", label: "Bogotá" },
        { id: "c", label: "La Paz" },
        { id: "d", label: "Thimphu" },
      ],
      answerId: "c",
      explanation: "La Paz's administrative seat sits above 3,600 m.",
    },
    {
      id: "p8",
      type: "boolean",
      prompt: "Brasília became the capital of Brazil only in 1960.",
      answer: true,
      explanation: "It replaced Rio de Janeiro as part of a push to develop the interior.",
    },
    {
      id: "p9",
      type: "single",
      prompt: "What is the capital of Türkiye?",
      options: [
        { id: "a", label: "Istanbul" },
        { id: "b", label: "Izmir" },
        { id: "c", label: "Ankara" },
        { id: "d", label: "Bursa" },
      ],
      answerId: "c",
      explanation: "Ankara has been the capital since 1923, though Istanbul is larger.",
    },
    {
      id: "p10",
      type: "typed",
      prompt: "Name the capital of New Zealand.",
      accepted: ["wellington"],
      placeholder: "Type a city",
      explanation: "Wellington is the southernmost capital of any sovereign state.",
    },
  ],
};

const maps: QuizSet = {
  id: "q-pin-the-place",
  title: "Pin the Place",
  description: "Read the terrain, trust your sense of scale and drop the pin.",
  categoryId: "maps",
  creator: "Cartography Club",
  art: "maps",
  difficulty: "Expert",
  minutes: 9,
  language: "English",
  rewards: { xp: 460, credits: 120 },
  highScore: 5,
  bestStreak: 4,
  questions: [
    {
      id: "m1",
      type: "map",
      prompt: "Pin the Strait of Gibraltar.",
      boardArt: "map-europe",
      regions: [
        { id: "a", label: "Strait of Gibraltar", x: 18, y: 78 },
        { id: "b", label: "Bosphorus", x: 74, y: 66 },
        { id: "c", label: "Øresund", x: 48, y: 20 },
        { id: "d", label: "English Channel", x: 30, y: 34 },
      ],
      answerId: "a",
      explanation:
        "A 13 km gap between Spain and Morocco linking the Atlantic to the Mediterranean.",
    },
    {
      id: "m2",
      type: "map",
      prompt: "Pin the Great Barrier Reef.",
      boardArt: "map-oceania",
      regions: [
        { id: "a", label: "Perth coast", x: 14, y: 62 },
        { id: "b", label: "Great Barrier Reef", x: 74, y: 30 },
        { id: "c", label: "Tasmania", x: 66, y: 90 },
        { id: "d", label: "Gulf of Carpentaria", x: 56, y: 14 },
      ],
      answerId: "b",
      explanation: "It runs 2,300 km along Queensland's north-east coast.",
    },
    {
      id: "m3",
      type: "single",
      prompt: "Which projection famously exaggerates the size of Greenland?",
      media: { kind: "map", art: "projection", caption: "A rectangular world grid" },
      options: [
        { id: "a", label: "Mercator" },
        { id: "b", label: "Robinson" },
        { id: "c", label: "Winkel tripel" },
        { id: "d", label: "Mollweide" },
      ],
      answerId: "a",
      explanation: "Mercator preserves angles, so area distorts sharply toward the poles.",
    },
    {
      id: "m4",
      type: "boolean",
      prompt: "Lines of longitude converge at the poles.",
      answer: true,
      explanation: "Meridians meet at both poles; parallels never meet.",
    },
    {
      id: "m5",
      type: "map",
      prompt: "Pin the Amazon Basin.",
      boardArt: "map-samerica",
      regions: [
        { id: "a", label: "Atacama", x: 26, y: 62 },
        { id: "b", label: "Amazon Basin", x: 56, y: 28 },
        { id: "c", label: "Patagonia", x: 38, y: 88 },
        { id: "d", label: "Pampas", x: 44, y: 72 },
      ],
      answerId: "b",
      explanation: "The basin drains roughly 7 million km² across nine countries.",
    },
    {
      id: "m6",
      type: "typed",
      prompt: "What is the 0° line of longitude called?",
      accepted: ["prime meridian", "greenwich meridian"],
      placeholder: "Type your answer",
      explanation: "The Prime Meridian runs through Greenwich, London.",
    },
    {
      id: "m7",
      type: "single",
      prompt: "A contour line on a topographic map joins points of equal…",
      options: [
        { id: "a", label: "Elevation" },
        { id: "b", label: "Temperature" },
        { id: "c", label: "Rainfall" },
        { id: "d", label: "Pressure" },
      ],
      answerId: "a",
      explanation: "Closely spaced contours indicate steep ground.",
    },
    {
      id: "m8",
      type: "multiple",
      prompt: "Which of these are true of a 1:25,000 map?",
      options: [
        { id: "a", label: "1 cm on the map is 250 m on the ground" },
        { id: "b", label: "It is a larger scale than 1:250,000" },
        { id: "c", label: "It covers more area than 1:250,000 on the same sheet" },
        { id: "d", label: "It shows more detail than 1:250,000" },
      ],
      answerIds: ["a", "b", "d"],
      explanation: "Larger scale means more detail over less ground.",
    },
    {
      id: "m9",
      type: "map",
      prompt: "Pin the Himalaya range.",
      boardArt: "map-asia",
      regions: [
        { id: "a", label: "Ural Mountains", x: 22, y: 22 },
        { id: "b", label: "Himalaya", x: 46, y: 60 },
        { id: "c", label: "Japanese archipelago", x: 84, y: 44 },
        { id: "d", label: "Arabian Peninsula", x: 16, y: 68 },
      ],
      answerId: "b",
      explanation: "The range arcs 2,400 km across five countries.",
    },
    {
      id: "m10",
      type: "boolean",
      prompt: "On most modern maps, north is oriented to the top of the sheet.",
      answer: true,
      explanation: "A convention, not a rule — medieval maps often placed east at the top.",
    },
  ],
};

const landmarks: QuizSet = {
  id: "q-monuments",
  title: "Monuments & Marvels",
  description: "Monuments, ruins and skylines from all six inhabited continents.",
  categoryId: "landmarks",
  creator: "Leo Marchetti",
  art: "landmarks",
  difficulty: "Medium",
  minutes: 7,
  language: "English",
  rewards: { xp: 300, credits: 75 },
  highScore: 7,
  bestStreak: 5,
  questions: [
    {
      id: "l1",
      type: "single",
      prompt: "In which country would you find Machu Picchu?",
      media: { kind: "image", art: "machu", caption: "Terraced stonework on a ridge" },
      options: [
        { id: "a", label: "Bolivia" },
        { id: "b", label: "Peru" },
        { id: "c", label: "Ecuador" },
        { id: "d", label: "Chile" },
      ],
      answerId: "b",
      explanation: "The 15th-century Inca citadel sits 2,430 m above sea level in Peru.",
    },
    {
      id: "l2",
      type: "image",
      prompt: "Select the landmark that stands in Agra, India.",
      options: [
        { id: "a", label: "Taj Mahal", art: "taj" },
        { id: "b", label: "Angkor Wat", art: "angkor" },
        { id: "c", label: "Borobudur", art: "borobudur" },
        { id: "d", label: "Petra", art: "petra" },
      ],
      answerId: "a",
      explanation: "Commissioned by Shah Jahan in 1632 as a mausoleum for Mumtaz Mahal.",
    },
    {
      id: "l3",
      type: "boolean",
      prompt: "The Great Wall of China is a single continuous wall.",
      answer: false,
      explanation: "It is a network of walls and fortifications built across many dynasties.",
    },
    {
      id: "l4",
      type: "typed",
      prompt: "Name the ancient rock-cut city in southern Jordan.",
      accepted: ["petra"],
      placeholder: "Type a landmark",
      explanation: "Petra was the Nabataean capital, carved into rose-coloured sandstone.",
    },
    {
      id: "l5",
      type: "single",
      prompt: "Which city is home to the Sagrada Família?",
      options: [
        { id: "a", label: "Madrid" },
        { id: "b", label: "Lisbon" },
        { id: "c", label: "Barcelona" },
        { id: "d", label: "Valencia" },
      ],
      answerId: "c",
      explanation: "Gaudí's basilica has been under construction in Barcelona since 1882.",
    },
    {
      id: "l6",
      type: "multiple",
      prompt: "Which of these landmarks are in Africa?",
      options: [
        { id: "a", label: "Pyramids of Giza" },
        { id: "b", label: "Victoria Falls" },
        { id: "c", label: "Chichén Itzá" },
        { id: "d", label: "Lalibela rock churches" },
      ],
      answerIds: ["a", "b", "d"],
      explanation: "Chichén Itzá is on Mexico's Yucatán Peninsula.",
    },
    {
      id: "l7",
      type: "single",
      prompt: "The Christ the Redeemer statue overlooks which city?",
      media: { kind: "image", art: "redeemer", caption: "An outstretched figure above a bay" },
      options: [
        { id: "a", label: "São Paulo" },
        { id: "b", label: "Rio de Janeiro" },
        { id: "c", label: "Salvador" },
        { id: "d", label: "Buenos Aires" },
      ],
      answerId: "b",
      explanation: "It stands 30 m tall atop Corcovado above Rio de Janeiro.",
    },
    {
      id: "l8",
      type: "boolean",
      prompt: "The Colosseum in Rome could hold more than 50,000 spectators.",
      answer: true,
      explanation: "Estimates run from 50,000 to 80,000 at capacity.",
    },
    {
      id: "l9",
      type: "map",
      prompt: "Pin the location of the Pyramids of Giza.",
      boardArt: "map-africa",
      regions: [
        { id: "a", label: "Marrakesh", x: 12, y: 22 },
        { id: "b", label: "Giza", x: 60, y: 16 },
        { id: "c", label: "Lagos", x: 26, y: 56 },
        { id: "d", label: "Zanzibar", x: 72, y: 66 },
      ],
      answerId: "b",
      explanation: "The plateau sits on the west bank of the Nile, on Cairo's edge.",
    },
    {
      id: "l10",
      type: "single",
      prompt: "Which landmark is the tallest structure in the world?",
      options: [
        { id: "a", label: "Shanghai Tower" },
        { id: "b", label: "Burj Khalifa" },
        { id: "c", label: "Merdeka 118" },
        { id: "d", label: "Tokyo Skytree" },
      ],
      answerId: "b",
      explanation: "The Burj Khalifa reaches 828 m in Dubai.",
    },
  ],
};

export const QUIZ_SETS: readonly QuizSet[] = [flags, countries, capitals, maps, landmarks];

const byId = new Map(QUIZ_SETS.map((set) => [set.id, set]));
const byCategory = new Map(QUIZ_SETS.map((set) => [set.categoryId, set]));

export const DEFAULT_QUIZ_ID = flags.id;

/**
 * Resolve a playable set from a hub quiz id or a category id. Sets that have no
 * hand-written questions yet fall back to the closest category, then to Flags,
 * so no entry point can ever dead-end.
 */
export function resolveQuizSet(key?: string | undefined): QuizSet {
  if (!key) return flags;
  return byId.get(key) ?? byCategory.get(key) ?? flags;
}

export function hasOwnSet(key: string): boolean {
  return byId.has(key);
}
