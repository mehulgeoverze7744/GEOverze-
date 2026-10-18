/**
 * Authoritative Countries collection (24 new quizzes + existing q-atlas-sprint).
 * Run: node scripts/build-countries-quiz-seed.mjs
 */
export const EXISTING_ATLAS_ID = "q-atlas-sprint";

const S = (prompt, explanation, options, answer_id, media = null) => ({
  type: "single",
  prompt,
  explanation,
  options,
  answer_id,
  media,
});
const M = (prompt, explanation, options, answer_ids) => ({
  type: "multiple",
  prompt,
  explanation,
  options,
  answer_ids,
});
const B = (prompt, explanation, answer_bool) => ({
  type: "boolean",
  prompt,
  explanation,
  answer_bool,
});
const T = (prompt, explanation, accepted, placeholder = "Type a country") => ({
  type: "typed",
  prompt,
  explanation,
  accepted,
  placeholder,
});
const I = (prompt, explanation, options, answer_id) => ({
  type: "image",
  prompt,
  explanation,
  options,
  answer_id,
});
const o = (id, label, glyph) =>
  glyph ? { id, label, glyph } : { id, label };

export const NEW_QUIZZES = [
  {
    id: "q-passport-to-the-planet",
    title: "Passport to the Planet",
    description:
      "A beginner tour of national symbols, continents, and country facts from every inhabited region.",
    difficulty: "Easy",
    minutes: 6,
    reward_xp: 240,
    reward_credits: 60,
    questions: [
      S("Which country is widely associated with the maple leaf as a national emblem?", "Canada's flag and many official emblems feature a red maple leaf.", [o("a", "Canada"), o("b", "Norway"), o("c", "Chile"), o("d", "Japan")], "a"),
      B("Egypt is located primarily on the continent of Africa.", "Most of Egypt is in North Africa; the Sinai Peninsula is in Asia.", true),
      S("Which country is home to the kangaroo as a famous native animal?", "Kangaroos are marsupials native to Australia.", [o("a", "South Africa"), o("b", "Australia"), o("c", "Argentina"), o("d", "India")], "b"),
      T("Name the country where Mount Fuji stands.", "Fuji is Japan's highest peak and a national symbol.", ["japan"]),
      M("Which of these countries use Spanish as an official language?", "Brazil's official language is Portuguese. Mexico, Spain, and Argentina use Spanish.", [o("a", "Mexico"), o("b", "Brazil"), o("c", "Spain"), o("d", "Argentina")], ["a", "c", "d"]),
      S("Table Mountain overlooks a city in which country?", "Table Mountain rises above Cape Town, South Africa.", [o("a", "Kenya"), o("b", "South Africa"), o("c", "Morocco"), o("d", "Portugal")], "b"),
      B("Brazil is a country in South America.", "Brazil is the largest country in South America by both area and population.", true),
      S("Cherry blossoms are a celebrated seasonal symbol of which country?", "Hanami, the viewing of sakura, is closely associated with Japan.", [o("a", "South Korea"), o("b", "China"), o("c", "Japan"), o("d", "Thailand")], "c"),
      S("The kiwi bird is a national emblem of which country?", "The kiwi is endemic to New Zealand and appears on coins and emblems.", [o("a", "New Zealand"), o("b", "Fiji"), o("c", "Ireland"), o("d", "Papua New Guinea")], "a"),
      T("Which country contains the Great Pyramid of Giza?", "The Giza pyramid complex stands on the outskirts of Cairo, Egypt.", ["egypt"]),
    ],
  },
  {
    id: "q-flag-frenzy",
    title: "Flag Frenzy",
    description:
      "Read colours, crosses, and emblems to identify national flags — without repeating Flag Blitz.",
    difficulty: "Easy",
    minutes: 6,
    reward_xp: 240,
    reward_credits: 60,
    questions: [
      I("Which of these is the flag of Kenya?", "Kenya's flag has black, red, and green bands with a Maasai shield and crossed spears.", [o("a", "Kenya", "🇰🇪"), o("b", "Uganda", "🇺🇬"), o("c", "Malawi", "🇲🇼"), o("d", "Ghana", "🇬🇭")], "a"),
      S("A white cross on a red field is the flag of which country?", "Switzerland's square flag is a bold white cross on red.", [o("a", "Denmark"), o("b", "Switzerland"), o("c", "England"), o("d", "Georgia")], "b", { kind: "flag", glyph: "🇨🇭", caption: "White cross on red" }),
      B("Jamaica's flag is black, gold, and green with a saltire (diagonal cross).", "Jamaica's gold saltire divides green and black triangles.", true),
      S("Which country's flag is a plain red circle on a white field?", "Japan's Nisshōki is a crimson disc centred on white. Palau's disc is gold on blue.", [o("a", "Bangladesh"), o("b", "Palau"), o("c", "Japan"), o("d", "Tunisia")], "c"),
      M("Which flags include a cedar, a maple leaf, or a cedar-like tree as a main emblem?", "Canada shows a maple leaf and Lebanon a cedar. Cyprus shows olive branches, not a single tree charge like those two; Chile is a star.", [o("a", "Canada"), o("b", "Lebanon"), o("c", "Chile"), o("d", "Cyprus")], ["a", "b"]),
      I("Select the flag of Sweden.", "Sweden's flag is a yellow Nordic cross on blue.", [o("a", "Sweden", "🇸🇪"), o("b", "Finland", "🇫🇮"), o("c", "Norway", "🇳🇴"), o("d", "Iceland", "🇮🇸")], "a"),
      T("Name the country whose flag is nicknamed the Union Jack.", "The Union Jack is the national flag of the United Kingdom.", ["united kingdom", "uk", "britain", "great britain"]),
      S("Green, white, and orange vertical bands identify which country?", "Ireland's tricolour is green, white, and orange. India's saffron-white-green bands are horizontal.", [o("a", "India"), o("b", "Côte d'Ivoire"), o("c", "Ireland"), o("d", "Italy")], "c"),
      B("The flag of Libya today is a plain green field with no other symbols.", "Libya's current flag is red, black, and green with a white crescent and star. The all-green flag was used 1977–2011.", false),
      S("Which South American flag shows the Sun of May?", "Argentina's white band carries the golden Sun of May.", [o("a", "Chile"), o("b", "Uruguay"), o("c", "Peru"), o("d", "Argentina")], "d"),
    ],
  },
  {
    id: "q-country-shape-safari",
    title: "Country Shape Safari",
    description:
      "Recognise countries from famous outlines and simple relative positions — no unlabeled mystery maps required.",
    difficulty: "Easy",
    minutes: 6,
    reward_xp: 240,
    reward_credits: 60,
    questions: [
      S("Which country is famous for a long, thin outline running along the Pacific?", "Chile stretches more than 4,000 km north–south along South America's west coast.", [o("a", "Peru"), o("b", "Chile"), o("c", "Ecuador"), o("d", "Panama")], "b"),
      S("Which country's outline is often compared to a boot kicking a triangle (Sicily)?", "Italy is the classic 'boot' peninsula in the Mediterranean.", [o("a", "Greece"), o("b", "Spain"), o("c", "Italy"), o("d", "Portugal")], "c"),
      B("Japan is an archipelago — a country made of many islands.", "Japan's main islands include Honshu, Hokkaido, Kyushu, and Shikoku.", true),
      S("Which African country has a distinctive horn-shaped peninsula on the east?", "Somalia occupies the Horn of Africa.", [o("a", "Somalia"), o("b", "Senegal"), o("c", "Namibia"), o("d", "Cameroon")], "a"),
      T("Which large country occupies most of the land north of the contiguous United States?", "Canada shares the world's longest international land border with the United States.", ["canada"]),
      S("Which country is a compact hexagon often used as a classroom map example in Western Europe?", "Metropolitan France is frequently taught as a hexagonal outline.", [o("a", "Poland"), o("b", "France"), o("c", "Germany"), o("d", "Belgium")], "b"),
      M("Which of these countries are archipelagos (made of many islands)?", "Indonesia and the Philippines are major archipelagic states. Mongolia and Botswana are landlocked mainland countries.", [o("a", "Indonesia"), o("b", "Mongolia"), o("c", "Philippines"), o("d", "Botswana")], ["a", "c"]),
      S("Which country sits on the southern tip of Africa, where the Atlantic and Indian oceans meet?", "South Africa occupies the continent's southernmost coast.", [o("a", "Angola"), o("b", "Mozambique"), o("c", "South Africa"), o("d", "Tanzania")], "c"),
      B("India is a peninsula that juts into the Indian Ocean.", "The Indian subcontinent projects south between the Arabian Sea and the Bay of Bengal.", true),
      S("Which country is a long island nation southeast of Australia?", "New Zealand lies across the Tasman Sea from Australia.", [o("a", "New Zealand"), o("b", "Madagascar"), o("c", "Sri Lanka"), o("d", "Taiwan")], "a"),
    ],
  },
  {
    id: "q-capitals-made-easy",
    title: "Capitals Made Easy",
    description:
      "Match well-known countries with their national capitals — a gentle introduction, not a trick-capital exam.",
    difficulty: "Easy",
    minutes: 6,
    reward_xp: 240,
    reward_credits: 60,
    questions: [
      S("What is the capital of France?", "Paris has been France's political capital for centuries.", [o("a", "Lyon"), o("b", "Marseille"), o("c", "Paris"), o("d", "Nice")], "c"),
      S("What is the capital of Kenya?", "Nairobi is Kenya's capital and largest city.", [o("a", "Mombasa"), o("b", "Nairobi"), o("c", "Kampala"), o("d", "Addis Ababa")], "b"),
      T("What is the capital of Japan?", "Tokyo is Japan's capital.", ["tokyo"]),
      S("What is the capital of Canada?", "Ottawa, not Toronto or Vancouver, is the federal capital.", [o("a", "Toronto"), o("b", "Montreal"), o("c", "Vancouver"), o("d", "Ottawa")], "d"),
      B("Brasília is the capital of Brazil.", "The planned city of Brasília became the capital in 1960, replacing Rio de Janeiro.", true),
      S("What is the capital of Egypt?", "Cairo is Egypt's capital on the Nile.", [o("a", "Alexandria"), o("b", "Cairo"), o("c", "Giza"), o("d", "Luxor")], "b"),
      S("What is the capital of Australia?", "Canberra was purpose-built as a compromise between Sydney and Melbourne.", [o("a", "Sydney"), o("b", "Melbourne"), o("c", "Canberra"), o("d", "Perth")], "c"),
      M("Which of these cities are national capitals?", "Rome is Italy's capital and Lima is Peru's. Barcelona and Mumbai are major cities but not national capitals.", [o("a", "Rome"), o("b", "Barcelona"), o("c", "Lima"), o("d", "Mumbai")], ["a", "c"]),
      S("What is the capital of India?", "New Delhi is the national capital territory's seat of government.", [o("a", "Mumbai"), o("b", "Kolkata"), o("c", "New Delhi"), o("d", "Bengaluru")], "c"),
      T("What is the capital of the United Kingdom?", "London is the capital of the United Kingdom.", ["london"]),
    ],
  },
  {
    id: "q-around-the-world-in-10",
    title: "Around the World in 10",
    description:
      "Ten beginner stops mixing countries, capitals, flags, and locations across six continents.",
    difficulty: "Easy",
    minutes: 6,
    reward_xp: 240,
    reward_credits: 60,
    questions: [
      S("Which continent is Nigeria on?", "Nigeria is in West Africa.", [o("a", "Africa"), o("b", "Asia"), o("c", "Europe"), o("d", "South America")], "a"),
      I("Which flag belongs to Mexico?", "Mexico's tricolour is green, white, and red with the coat of arms on the white band.", [o("a", "Italy", "🇮🇹"), o("b", "Mexico", "🇲🇽"), o("c", "Iran", "🇮🇷"), o("d", "Hungary", "🇭🇺")], "b"),
      S("What is the capital of Argentina?", "Buenos Aires is Argentina's capital.", [o("a", "Santiago"), o("b", "Montevideo"), o("c", "Buenos Aires"), o("d", "Lima")], "c"),
      B("Indonesia is in Southeast Asia.", "Indonesia is the world's largest archipelagic country in Southeast Asia.", true),
      T("Name the country whose capital is Nairobi.", "Nairobi is the capital of Kenya.", ["kenya"]),
      S("Which ocean lies east of the United States' Atlantic coast?", "The Atlantic Ocean borders the US East Coast.", [o("a", "Pacific Ocean"), o("b", "Indian Ocean"), o("c", "Atlantic Ocean"), o("d", "Arctic Ocean")], "c"),
      S("Which country is a Nordic nation on the Scandinavian Peninsula?", "Sweden occupies the eastern part of the Scandinavian Peninsula.", [o("a", "Ireland"), o("b", "Sweden"), o("c", "Estonia"), o("d", "Iceland")], "b"),
      M("Which of these are countries in South America?", "Peru and Colombia are in South America. Mexico is in North America; Spain is in Europe.", [o("a", "Peru"), o("b", "Mexico"), o("c", "Colombia"), o("d", "Spain")], ["a", "c"]),
      S("The Great Barrier Reef lies off the coast of which country?", "The reef system is off Queensland, Australia.", [o("a", "Philippines"), o("b", "Australia"), o("c", "Indonesia"), o("d", "Fiji")], "b"),
      B("Morocco is a country in North Africa.", "Morocco sits at Africa's northwest corner, across the Strait of Gibraltar from Spain.", true),
    ],
  },
];
