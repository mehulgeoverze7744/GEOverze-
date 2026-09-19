import type { ArticleBlock } from "../articles";

export const EUROPE_MICROSTATES_INTRO: readonly ArticleBlock[] = [
  {
    kind: "paragraph",
    text: 'Europe\'s political map contains a handful of countries so small that they can disappear into the spaces between their larger neighbours. Yet their size tells only part of the story. Vatican City, Monaco, San Marino, Liechtenstein, Malta and Andorra are not simply "small countries" — they are six distinct answers to the question of how a territory remains sovereign when empires, unions and borders shift around it.',
  },
  {
    kind: "paragraph",
    text: "Some survived behind mountains. Others survived through diplomacy, dynastic continuity, religious importance or strategic geography. Their histories reveal how physical setting and political circumstance interacted: geography could protect or expose; institutions could outlast rulers; and neighbours could absorb a state — or decide that leaving it alone was the cheaper option.",
  },
  {
    kind: "paragraph",
    text: "This GEOlibrary feature examines all six in depth. Malta is far larger than Vatican City or Monaco, yet still ranks among Europe's smallest states. Andorra's co-principality looks unusual on paper but made sense in medieval Pyrenean politics. What unites the group is not a single survival formula, but a shared lesson: sovereignty has never depended on area alone.",
  },
  {
    kind: "paragraph",
    text: "Read on for country profiles, comparative geography, timelines and the factors that helped these microstates endure — then test what you remember in Let's Play, where many of the same places appear in Countries questions.",
  },
  {
    kind: "heading",
    id: "what-is-a-microstate",
    text: "What is a microstate?",
  },
  {
    kind: "paragraph",
    text: 'A microstate is generally understood as an exceptionally small sovereign state — usually tiny in territory, population, or both. There is no universal legal threshold in international law: the term is analytical, not a formal category. A "small state" might still cover tens of thousands of square kilometres; a European microstate often fits inside a single metropolitan region.',
  },
  {
    kind: "paragraph",
    text: "Population and area do not move in lockstep. Monaco's land area is roughly two square kilometres, yet it hosts tens of thousands of residents and workers. Vatican City's population is measured in hundreds, while Malta's exceeds half a million. Comparing microstates therefore requires looking at capital cities, government type and location — not km² alone.",
  },
  {
    kind: "paragraph",
    text: "Geographic position matters as much as size. A coastal cliff, a mountain ridge or a seat inside Rome can define what a state becomes. The six countries in this article illustrate how different combinations of terrain, history and diplomacy produced six very different outcomes from similarly small footprints.",
  },
  {
    kind: "callout",
    variant: "key-idea",
    text: "Small territory does not necessarily mean small historical importance.",
  },
  {
    kind: "heading",
    id: "six-at-a-glance",
    text: "The six states at a glance",
  },
  {
    kind: "stateGlance",
    title: "Six sovereign states compared",
    states: [
      {
        name: "Vatican City",
        fields: [
          { label: "Area", value: "≈ 0.44 km²" },
          { label: "Capital", value: "Vatican City" },
          { label: "Location", value: "Enclave within Rome, Italy" },
          { label: "Government", value: "Elective monarchy (Holy See)" },
          {
            label: "Distinctive feature",
            value: "World's smallest state; centre of Catholic Church",
          },
        ],
      },
      {
        name: "Monaco",
        fields: [
          { label: "Area", value: "≈ 2.02 km²" },
          { label: "Capital", value: "Monaco (Monaco-Ville quarter)" },
          { label: "Location", value: "Mediterranean / French Riviera" },
          { label: "Government", value: "Constitutional monarchy" },
          { label: "Distinctive feature", value: "Grimaldi dynasty; dense coastal city-state" },
        ],
      },
      {
        name: "San Marino",
        fields: [
          { label: "Area", value: "≈ 61 km²" },
          { label: "Capital", value: "City of San Marino" },
          { label: "Location", value: "Apennines, surrounded by Italy" },
          { label: "Government", value: "Parliamentary republic" },
          { label: "Distinctive feature", value: "Mount Titano; long republican continuity" },
        ],
      },
      {
        name: "Liechtenstein",
        fields: [
          { label: "Area", value: "≈ 160 km²" },
          { label: "Capital", value: "Vaduz" },
          { label: "Location", value: "Upper Rhine valley; Austria & Switzerland" },
          { label: "Government", value: "Constitutional monarchy" },
          { label: "Distinctive feature", value: "Alpine principality; financial services" },
        ],
      },
      {
        name: "Malta",
        fields: [
          { label: "Area", value: "≈ 316 km²" },
          { label: "Capital", value: "Valletta" },
          { label: "Location", value: "Central Mediterranean archipelago" },
          { label: "Government", value: "Parliamentary republic" },
          { label: "Distinctive feature", value: "7,000+ years of settlement; strategic harbours" },
        ],
      },
      {
        name: "Andorra",
        fields: [
          { label: "Area", value: "≈ 468 km²" },
          { label: "Capital", value: "Andorra la Vella" },
          { label: "Location", value: "Pyrenees; France & Spain" },
          { label: "Government", value: "Parliamentary co-principality" },
          { label: "Distinctive feature", value: "Two co-princes; mountain tourism" },
        ],
      },
    ],
  },
];
