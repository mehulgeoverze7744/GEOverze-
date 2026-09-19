import type { ArticleBlock } from "@/features/library/data/articles";
import { editorialClosing } from "@/features/library/lib/article-content-utils";

export const BLOCKS: readonly ArticleBlock[] = [
  {
    kind: "paragraph",
    text: "A language that crosses a border carries with it a history. Sometimes it is the history of conquest — Spanish arriving in the Americas, English arriving in India, French arriving in West Africa. Sometimes it is the history of migration — Arabic spreading along trade routes, Swahili growing from coastal commerce, Portuguese carried by sailors across three continents. Sometimes it is the history of a religious text — Classical Arabic, Latin, Sanskrit — whose reach outlasted the empires that spread them. The map of languages that cross the most borders is, at its core, a map of power: who expanded, who dominated, who was absorbed, and whose tongue became the instrument of administration across other peoples' territories.",
  },

  { kind: "heading", id: "arabic", text: "Arabic: One Language, Many Voices" },
  {
    kind: "paragraph",
    text: "Arabic is listed as official or co-official in 22 countries, stretching from Mauritania on the Atlantic coast of Africa to Oman on the Arabian Sea — a horizontal band of Arabic-speaking states covering approximately 13 million square kilometres. With over 400 million speakers, Arabic is the fifth most spoken language in the world. But this figure obscures a fundamental complexity: Arabic is better understood as a family of related varieties than as a single language. Modern Standard Arabic (Fusha) — the formal written and broadcast register — is an artificially maintained norm descending from Classical Arabic, the language of the Quran. No community speaks Modern Standard Arabic natively. What people speak at home and in markets are regional dialects that have diverged so substantially over fourteen centuries that a speaker from Casablanca and a speaker from Muscat can struggle to communicate in their respective native registers.",
  },
  {
    kind: "paragraph",
    text: "Linguists group Arabic dialects into at least five major families: Maghrebi (Morocco, Algeria, Tunisia, Libya), Egyptian, Levantine (Syria, Lebanon, Jordan, Palestine), Gulf, and Iraqi. The differences among them are not merely pronunciation — vocabulary, grammar, and idiom diverge significantly. Egyptian Arabic occupies a special position: as the dialect most widely broadcast through Egyptian cinema and television since the 1950s, it has achieved a degree of pan-Arab comprehension that other dialects lack. A Yemeni and a Moroccan meeting for the first time will often code-switch toward Egyptian register to find common ground. The unifying force that holds this diverse family under a single label is the Quran, whose Classical Arabic is learned in schools and mosques across all 22 countries as the prestige written standard.",
  },
  {
    kind: "image",
    art: "article-arabic-speaking-world",
    externalSrc:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/Arabic_speaking_world.svg/1280px-Arabic_speaking_world.svg.png",
    caption:
      "The Arabic-speaking world — 22 countries across North Africa and the Middle East share Arabic as an official language, though spoken dialects diverge substantially across the region.",
    credit: "Wikimedia Commons / Public Domain",
  },
  {
    kind: "callout",
    variant: "history-note",
    text: "The spread of Arabic is one of the fastest linguistic expansions in recorded history. Within a century of the Prophet Muhammad's death in 632 CE, Arabic had spread from the Arabian Peninsula to the Atlantic coast of Spain in the west and to Central Asia in the east — carried by Islamic conquest, administration, and the prestige of Quranic literacy rather than by population movement alone.",
  },

  { kind: "heading", id: "spanish", text: "Spanish: 500 Million Speakers, Remarkable Unity" },
  {
    kind: "paragraph",
    text: "Spanish is official in 21 countries across four continents — all but one (Spain) in Latin America — and is spoken by approximately 500 million people as a first language, making it the second most spoken language in the world by native speakers. Its spread is inseparable from the timing of Iberian expansion: the Reconquista — the Christian reconquest of the Iberian Peninsula from Moorish rule — was completed in 1492, the same year Christopher Columbus sailed west under Spanish sponsorship and made landfall in the Caribbean. Over the following century, Spanish conquistadors moved across Central and South America, installing Spanish as the language of empire, administration, law, and the Church. Indigenous languages — Nahuatl, Quechua, Aymara, Mapuche, and hundreds more — were suppressed, marginalised, or reduced to regional use as Spanish became the language of social advancement.",
  },
  {
    kind: "paragraph",
    text: "What distinguishes Spanish from Arabic — the other great colonial language of the medieval world — is the degree of mutual intelligibility it has maintained across its geographic range. A speaker from Buenos Aires and a speaker from Mexico City can hold a full conversation with relatively minor accommodation. The colonial period compressed the time during which regional varieties could diverge; the spread of radio and television in the twentieth century further standardised pronunciation and vocabulary. Regional accents and vocabulary differ — 'car' is 'coche' in Spain, 'carro' in Venezuela, 'auto' in Chile and Argentina — but the underlying grammar and core vocabulary remain shared. This functional unity across 20 sovereign nations and 19 million square kilometres has no real parallel among widely dispersed languages.",
  },
  {
    kind: "callout",
    variant: "did-you-know",
    text: "The United States has more Spanish speakers than Spain itself. Approximately 62 million people in the USA speak Spanish — the second largest Spanish-speaking population of any country in the world, after Mexico. Spanish is now the second most studied language globally, and demographic projections suggest the USA could become the world's largest Spanish-speaking country by 2050.",
  },

  { kind: "heading", id: "french", text: "French: The Most Countries of Any Language" },
  {
    kind: "paragraph",
    text: "French holds a record that often surprises: it is official or co-official in 29 countries — more than any other language in the world. The Organisation internationale de la Francophonie (OIF), which links French-speaking countries and communities, has 88 member and observer states. French is spoken on every inhabited continent: in Europe (France, Belgium, Switzerland, Luxembourg, Monaco), North America (Canada, Haiti), South America (French Guiana), Africa (29 sub-Saharan countries), Oceania (French Polynesia, New Caledonia, Vanuatu), and the Indian Ocean (Réunion, Madagascar, Comoros). The geographic reach is a direct legacy of French colonial expansion in the seventeenth through twentieth centuries.",
  },
  {
    kind: "paragraph",
    text: "Today, the most striking demographic fact about French is that the majority of its speakers live in Africa, not Europe. Sub-Saharan Africa alone accounts for over 60 percent of all Francophone speakers worldwide, and this share is growing rapidly as African populations expand. In countries like the Democratic Republic of Congo — the world's largest Francophone country by population — French is the official language of government and education but is spoken natively by only a small educated minority; the majority speak it as a second or third language alongside hundreds of indigenous languages. The DRC alone has over 250 indigenous languages, making French indispensable as a cross-ethnic communication medium. By 2060, Africa is projected to account for 85 percent of French speakers globally.",
  },
  {
    kind: "image",
    art: "article-francophonie-map",
    externalSrc:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Francophonie_map_2014.png/1280px-Francophonie_map_2014.png",
    caption:
      "Member states and observers of the Organisation internationale de la Francophonie — French is official or co-official in 29 countries across five continents.",
    credit: "Wikimedia Commons / Public Domain",
  },
  {
    kind: "callout",
    variant: "history-note",
    text: "The Académie Française, founded in 1635 by Cardinal Richelieu, is the world's oldest national language authority and the official guardian of the French language. It has 40 members — called 'Immortals' — who are typically literary figures, scientists, and public intellectuals. The Académie issues official French-language equivalents for foreign terms: 'logiciel' (software), 'courriel' (email), 'baladeur' (Walkman). Its rulings are advisory, not legally binding, but carry significant cultural weight in France and French-speaking institutions.",
  },

  { kind: "heading", id: "english", text: "English: The Colonial Default" },
  {
    kind: "paragraph",
    text: "English is official or co-official in approximately 58 countries — fewer than French but covering a wider geographic spread of influence, particularly in the former British Empire territories across Asia, Africa, the Pacific, and the Caribbean. Unlike French or Spanish, English was never the most widely spoken language in the world by native speakers — that distinction belongs to Mandarin, which has always had more native speakers. English achieved its position as the dominant global language through a combination of factors: the British Empire at its peak covered a quarter of the world's land surface, installing English as the language of administration, law, courts, and education across territories from India to Canada to Australia. After 1945, the economic, cultural, and military dominance of the United States — itself an English-speaking nation — reinforced the language's global position in business, science, diplomacy, and popular culture.",
  },
  {
    kind: "paragraph",
    text: "English's global dominance is self-reinforcing today in ways that have little to do with political power. Scientific publications are overwhelmingly written in English; the fraction of peer-reviewed papers published in English exceeds 80 percent in most natural sciences. International aviation communication is entirely in English, required by ICAO (International Civil Aviation Organization) since the 1950s. International maritime communication uses English as the standard. Software and the internet were built largely by English-speaking developers and encoded English-language conventions. Learning English provides access to a disproportionate share of global economic opportunity, which creates continued demand for English-language education even in countries that have no historical connection to Britain or the United States.",
  },
  {
    kind: "callout",
    variant: "by-the-numbers",
    text: "English has approximately 380 million native speakers — third globally, after Mandarin (920 million) and Spanish (500 million). But English has the most second-language speakers of any language in the world, with estimates ranging from 600 million to over 1 billion. Total English speakers, including second-language users, likely exceed 1.5 billion.",
  },

  { kind: "heading", id: "portuguese", text: "Portuguese: Two Hemispheres, One Language" },
  {
    kind: "paragraph",
    text: "Portuguese is official in nine countries across four continents: Portugal itself; Brazil (the world's fifth-largest country by area); Angola, Mozambique, Guinea-Bissau, Cape Verde, São Tomé and Príncipe, and Equatorial Guinea in Africa; and Timor-Leste in Southeast Asia. The nine countries together form the Community of Portuguese Language Countries (CPLP), a cultural and political organisation founded in 1996. Brazil dominates by population: with over 215 million speakers, it accounts for roughly 80 percent of all Portuguese speakers worldwide, making Brazilian Portuguese the demographically dominant form of the language despite Portugal being its historical origin. Portuguese became a global language through maritime exploration: Vasco da Gama's 1498 route to India, Pedro Álvares Cabral's 1500 landfall in Brazil, and the establishment of Portuguese trading posts across the Indian Ocean, West Africa, and Southeast Asia.",
  },
  {
    kind: "paragraph",
    text: "Brazilian and European Portuguese have diverged significantly over five centuries of separation. The differences are similar in magnitude to those between American and British English — and Portuguese-language linguists debate whether they have diverged far enough to be considered separate languages. Key differences include vocabulary (particularly in technology and everyday objects), pronunciation (European Portuguese has more reduced vowels and faster speech), and grammar (Brazilians use clitic pronouns differently; colloquial Brazilian uses 'você' where European Portuguese uses 'tu'). The two varieties are mutually intelligible in written form, but spoken Brazilian and spoken European Portuguese can require adjustment from listeners on either side. The seven PALOP (African Portuguese Language Countries) countries add additional diversity: their varieties blend Portuguese with indigenous African languages in distinctive ways.",
  },

  { kind: "heading", id: "russian", text: "Russian: The Soviet Lingua Franca" },
  {
    kind: "paragraph",
    text: "Russian is officially recognised in four countries: Russia, Belarus, Kazakhstan, and Kyrgyzstan. But this figure dramatically understates its actual reach. Russian is widely spoken, formally taught, and practically necessary for business and government in all 15 successor states of the Soviet Union, including Ukraine, Moldova, Georgia, Armenia, Azerbaijan, Uzbekistan, Tajikistan, Turkmenistan, and the Baltic states. Soviet language policy — Russification — systematically promoted Russian as the administrative language of the USSR over seven decades, requiring it as a second language in all Soviet schools, using it as the exclusive language of the military, and ensuring that advancement in science, technology, and government required Russian fluency. By 1991, when the Soviet Union dissolved, Russian was the lingua franca of an enormous geographic area.",
  },
  {
    kind: "paragraph",
    text: "Since 1991, Russian's reach has been declining. The Baltic states (Estonia, Latvia, Lithuania) joined the EU and NATO and have progressively reduced the official status of Russian, promoting their national languages. Ukraine's relationship with Russian has become explicitly political: after Russia's annexation of Crimea in 2014 and the full-scale invasion in 2022, Ukrainian identity and the Ukrainian language have reasserted themselves with urgency. In Central Asia, Uzbekistan, Tajikistan, and Turkmenistan have replaced Russian with their national languages in many administrative contexts, though Russian remains practically necessary for inter-republic commerce and in many technical fields. Russian is still spoken by approximately 170 million people as a native language and understood by perhaps 200 million more as a second language across the post-Soviet space — a geographic footprint that no formal official-language count captures.",
  },
  {
    kind: "callout",
    variant: "geography-note",
    text: "Russian is official in only 4 countries but is spoken across a contiguous geographic zone covering 11 time zones and more than 20 million square kilometres — roughly the same as the entire surface of the Moon. No other language in the world is a functional daily language across a comparable continuous land area.",
  },

  { kind: "heading", id: "swahili", text: "Swahili: Africa's Great Connector" },
  {
    kind: "paragraph",
    text: "Swahili (Kiswahili) is spoken across a broader geographic footprint than almost any other African language, functioning as an official or widely used language in at least 14 countries: Tanzania, Kenya, Uganda, Rwanda, Burundi, the DRC, Comoros, Mozambique, Malawi, Zambia, Zimbabwe, South Sudan, Somalia, and with growing presence in Ethiopia and Madagascar. The African Union recognised Swahili as one of its official working languages in 2004, and it is estimated to be spoken — at some level of proficiency — by 200 to 250 million people, though native speakers number only around 20 million. Swahili is unusual among cross-border languages in that its wide spread was not primarily the result of conquest: it was the organic product of trade.",
  },
  {
    kind: "paragraph",
    text: "Linguistically, Swahili is a Bantu language — part of the Niger-Congo family — but its vocabulary reflects the full history of Indian Ocean trade. Arabic loanwords account for roughly 20 to 25 percent of everyday Swahili vocabulary: words for trade, religion, time, and administration (duka = shop, saa = hour, dini = religion, serikali = government). There are Persian, Portuguese, Gujarati, and English layers too, each deposited by successive waves of Indian Ocean commercial contact. The Swahili coast — stretching from the Somali coast south through Kenya, Tanzania, and Mozambique — was the contact zone where Bantu-speaking farmers, Arab traders, Persian merchants, and Indian Gujarat merchants met and created something new. What made Swahili a pan-African language in the modern era, however, was a deliberate political choice: post-independence Tanzania and Kenya both promoted Swahili rather than their many indigenous languages or the colonial English as the language of national unity.",
  },
  {
    kind: "image",
    art: "article-swahili-coast",
    externalSrc:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Lamu_Old_Town_aerial.jpg/1280px-Lamu_Old_Town_aerial.jpg",
    caption:
      "Lamu Old Town, Kenya — a UNESCO World Heritage Site and historic centre of Swahili culture, where Arabic, Persian, and Bantu languages met the Indian Ocean trade network.",
    credit: "Wikimedia Commons / CC BY 2.0",
  },

  { kind: "heading", id: "languages-table", text: "Top Cross-Border Languages at a Glance" },
  {
    kind: "table",
    title: "Major cross-border languages: countries, speakers, and reach (2024)",
    columns: [
      "Language",
      "Official Countries",
      "Continents",
      "Native Speakers",
      "Total Speakers (incl. L2)",
      "Primary Spread Mechanism",
    ],
    rows: [
      [
        "English",
        "58",
        "6",
        "~380 million",
        "~1.5 billion",
        "British Empire + US cultural dominance",
      ],
      ["French", "29", "5", "~80 million", "~320 million", "French colonial empire"],
      ["Arabic", "22", "2", "~310 million", "~420 million", "Islamic expansion + Arab empires"],
      ["Spanish", "21", "4", "~500 million", "~590 million", "Spanish colonial empire in Americas"],
      ["Portuguese", "9", "4", "~250 million", "~280 million", "Portuguese maritime empire"],
      [
        "Russian",
        "4 (official)",
        "2 (functional)",
        "~170 million",
        "~370 million",
        "Soviet Union / Russification",
      ],
      [
        "Swahili",
        "~14 (functional)",
        "1",
        "~20 million",
        "~230 million",
        "Indian Ocean trade + post-colonial policy",
      ],
      [
        "Malay/Indonesian",
        "4",
        "1",
        "~80 million",
        "~270 million",
        "Maritime trade + political unification",
      ],
      ["Dutch", "5", "3", "~24 million", "~30 million", "Dutch colonial empire"],
      ["German", "6", "2", "~95 million", "~130 million", "Central European influence + diaspora"],
    ],
  },

  {
    kind: "heading",
    id: "borders-split-languages",
    text: "When Borders Split Language Communities",
  },
  {
    kind: "paragraph",
    text: "Colonial borders — particularly the straight lines drawn across Africa at the 1884–85 Berlin Conference — divided existing language communities with no regard for linguistic, ethnic, or cultural geography. The Kurds are the most cited example globally: an estimated 30 to 40 million Kurds form one of the world's largest ethnic and linguistic groups without a sovereign state. Kurdish speakers are distributed across Turkey (15–20 million), Iran (8–12 million), Iraq (6–8 million), and Syria (2–3 million), in a historical homeland that colonial and post-Ottoman borders divided among four states — none of which initially recognised Kurdish as an official language and several of which actively suppressed it. Kurdish itself divides into several distinct dialects — Kurmanji (dominant in Turkey, Syria, and northern Iraq), Sorani (dominant in southern Iraqi Kurdistan and Iran), and Zazaki and Gorani — reflecting the long period of geographic separation.",
  },
  {
    kind: "paragraph",
    text: "The Pashtuns of Afghanistan and Pakistan form another community split by a colonial line: the Durand Line, drawn by British India in 1893, which Pakistan inherited and Afghanistan has never officially recognised. Approximately 40 to 50 million Pashtuns live on either side of this border, speaking Pashto as their mother tongue in a region where the border has historically been crossed with minimal enforcement. The Berber (Amazigh) peoples of North Africa speak a family of related languages across Morocco, Algeria, Tunisia, Libya, Mali, Niger, and beyond — historically unrecognised by Arabic-dominant North African states but increasingly formalised since the 2000s (Morocco recognised Amazigh as co-official in its 2011 constitution). The Macedonian language is claimed by Bulgaria as a dialect of Bulgarian, by Greece as non-existent, and by North Macedonia as a separate Slavic language — a political dispute over linguistic identity that has no purely linguistic resolution.",
  },
  {
    kind: "callout",
    variant: "geography-note",
    text: "The Durand Line separating Afghanistan and Pakistan was drawn by British India in 1893 to define the frontier of British colonial influence — not to reflect the distribution of Pashtun communities. Afghanistan has never formally accepted the line, and the border today runs through the middle of Pashtun territory, separating families and tribes that have historically shared a single cultural and linguistic identity.",
  },
  {
    kind: "image",
    art: "article-kurdish-homeland-map",
    externalSrc:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Kurdish-inhabited_area_by_CIA_%281992%29.jpg/1280px-Kurdish-inhabited_area_by_CIA_%281992%29.jpg",
    caption:
      "Kurdish-inhabited areas across Turkey, Iraq, Iran, and Syria — the Kurdish people represent one of the world's largest ethnic groups without a sovereign state, their homeland divided among four countries.",
    credit: "Wikimedia Commons / Public Domain (CIA, 1992)",
  },

  {
    kind: "heading",
    id: "mutual-intelligibility",
    text: "Mutual Intelligibility: Language or Dialect?",
  },
  {
    kind: "paragraph",
    text: "The distinction between a language and a dialect has no linguistic definition that holds universally. The line is political. Linguist Max Weinreich's 1945 remark — 'a language is a dialect with an army and a navy' — remains the most accurate description of how the distinction is made in practice. Two speech varieties may be mutually intelligible yet be called separate languages for political reasons; conversely, two varieties may be mutually incomprehensible yet be grouped as dialects of the same language for political reasons. Norwegian and Swedish are mutually intelligible but considered separate languages because Norway and Sweden are separate countries. Mandarin and Cantonese are both called 'Chinese' but speakers cannot understand each other in speech, only in writing through shared characters.",
  },
  {
    kind: "paragraph",
    text: "The clearest example of political language division in recent history is Serbo-Croatian. Until the 1990s, Serbo-Croatian was recognised as a single language with two main variants, spoken across Yugoslavia. With the dissolution of Yugoslavia, Serbian, Croatian, Bosnian, and Montenegrin were declared separate languages by the respective newly independent states. Linguistically, the four standards are almost identical — they share grammar, core vocabulary, and are mutually intelligible to a degree that exceeds, for example, British and American English. The differences are primarily lexical choices (where one standard prefers an international term, another prefers a native construction) and alphabets (Serbian and Montenegrin use Cyrillic as well as Latin; Croatian and Bosnian use only Latin). The same process applies to Hindi and Urdu, which are spoken on a dialect continuum across northern India and Pakistan but written in different scripts (Devanagari and Nastaliq) and officially categorised as separate national languages.",
  },
  {
    kind: "callout",
    variant: "did-you-know",
    text: "Norwegian, Swedish, and Danish are sometimes called a dialect continuum: speakers of each can understand the others reasonably well, particularly in written form. Yet they are classified as three separate languages because they are the national languages of three sovereign states. Meanwhile, the Scandinavian languages diverge less from each other than do the various dialects of Arabic — but Arabic is called one language and the Scandinavian tongues three.",
  },

  { kind: "heading", id: "language-death", text: "Language Death and Endangerment" },
  {
    kind: "paragraph",
    text: "Of the approximately 7,000 languages spoken in the world today, UNESCO's Atlas of the World's Languages in Danger classifies around 40 percent as endangered. 'Endangered' ranges from 'vulnerable' — still spoken by children but restricted in certain domains — to 'critically endangered' — known only to grandparents who no longer use the language daily with their own children. The distribution is extremely uneven: half of the world's languages are spoken by fewer than 10,000 people, and roughly 350 languages are spoken by more than one million. A handful of languages — Mandarin, English, Spanish, Hindi, Arabic, Portuguese, Bengali, Russian, French — collectively have the majority of all speakers. The 6,000+ remaining languages share a small and shrinking fraction.",
  },
  {
    kind: "paragraph",
    text: "The rate of language loss has been estimated at one language extinction approximately every two weeks. Each extinction eliminates a unique system for classifying experience — different grammatical categories, conceptual distinctions, ecological vocabularies, and oral knowledge systems that may encode centuries of observation about local environments, medicines, navigation, and history. The loss is sometimes called a 'silent extinction crisis' because it lacks the visual immediacy of species extinction and the political advocates that threatened species can attract. Language revitalisation efforts — intensive immersion schools, community language nests, digital documentation, legal recognition — have achieved genuine success in a small number of cases (Welsh, Māori, Hawaiian), providing models but also illustrating how much sustained institutional investment is required.",
  },
  {
    kind: "callout",
    variant: "did-you-know",
    text: "Papua New Guinea has over 840 living languages in a country of roughly 10 million people — approximately one language per 12,000 residents. This density of linguistic diversity results from the country's mountainous topography, which isolated communities in separate valleys over thousands of years and allowed languages to diverge independently. Papua New Guinea alone accounts for over 12 percent of all languages currently spoken on Earth.",
  },

  {
    kind: "heading",
    id: "colonial-language-timeline",
    text: "The Spread of Colonial Languages: A Timeline",
  },
  {
    kind: "timeline",
    title: "Major milestones in the global spread of colonial languages",
    events: [
      {
        date: "1415",
        text: "Portugal captures Ceuta, beginning its African expansion. Portuguese begins spreading along the West African coast through trade.",
      },
      {
        date: "1492",
        text: "Spain completes the Reconquista and Columbus reaches the Caribbean; Spanish begins its rapid spread across the Americas.",
      },
      {
        date: "1498",
        text: "Vasco da Gama reaches India via the Cape of Good Hope; Portuguese trading posts established across the Indian Ocean.",
      },
      {
        date: "1534",
        text: "France establishes its first North American colony in Canada; French expansion into the Americas and later Africa begins.",
      },
      {
        date: "1600s",
        text: "English colonisation of North America, the Caribbean, and India establishes English as an administrative language across future British territories.",
      },
      {
        date: "1750–1850",
        text: "British Empire expands across India, Southeast Asia, Australasia, and East and West Africa; English becomes the language of administration in territories with hundreds of millions of speakers.",
      },
      {
        date: "1884–85",
        text: "Berlin Conference divides Africa among European powers with borders that split language communities and installed European languages as administrative defaults.",
      },
      {
        date: "1945–1975",
        text: "African and Asian independence movements. Former colonies retain colonial languages as official languages despite ethnic and linguistic diversity. English and French entrench as post-colonial defaults.",
      },
      {
        date: "2000s",
        text: "Internet, social media, and global commerce accelerate English dominance in digital communication while providing new platforms for indigenous language content.",
      },
    ],
  },

  { kind: "heading", id: "language-stats", text: "Language Statistics" },
  {
    kind: "facts",
    title: "Global language facts",
    facts: [
      { label: "Total living languages (Ethnologue 2024)", value: "~7,168" },
      { label: "Languages spoken by fewer than 1,000 people", value: "~2,700 (38%)" },
      { label: "Endangered languages (UNESCO classification)", value: "~2,900 (40%)" },
      { label: "Languages with no written form", value: "~3,000" },
      { label: "Estimated language extinctions per 2 weeks", value: "1 language lost" },
      { label: "Countries with only 1 official language", value: "~180" },
      { label: "Countries with 3 or more official languages", value: "~50" },
      { label: "Most linguistically diverse country", value: "Papua New Guinea (840+ languages)" },
    ],
  },

  { kind: "heading", id: "planned-languages", text: "Planned Languages: The Esperanto Experiment" },
  {
    kind: "paragraph",
    text: "Esperanto was created in 1887 by Ludwig Lazarus Zamenhof, a Polish ophthalmologist who grew up in Białystok — a city with Polish, Russian, German, and Jewish communities in constant friction. Zamenhof believed that linguistic misunderstanding was a significant contributor to ethnic and national conflict and that a neutral, easy-to-learn international language could reduce it. His creation drew vocabulary from Romance and Germanic languages, with a regular, learnable grammar designed to be mastered quickly by speakers of any European language. The name 'Esperanto' means 'one who hopes' in the language itself. Estimates of current Esperanto speakers range from 1 to 2 million, across roughly 120 countries — a remarkable number for a language with no country, no army, and no colonial history behind it.",
  },
  {
    kind: "paragraph",
    text: "Esperanto's failure to displace English as the international language of communication illustrates an important point about language spread: critical mass matters more than simplicity. By the time Esperanto had its most active growth period in the early twentieth century, English was already entrenched as the language of global trade, science, and communication through British colonial and commercial infrastructure. Learning Esperanto opened doors to a community of Esperanto speakers; learning English opened doors to global business, science, and media. The economic incentive was asymmetric. Proposals for other planned languages — Interlingua, Ido, Volapük, Basic English — all encountered the same fundamental problem: a language's value comes not from its elegance but from the number of people who already speak it. English, for all its irregularities, was already there.",
  },
  {
    kind: "callout",
    variant: "did-you-know",
    text: "Esperanto is the only constructed language with a sizeable number of native speakers — children raised in bilingual families where both parents speak Esperanto who have learned it from birth. Estimates put native Esperanto speakers at between 200 and 2,000 worldwide. The language has a disproportionately large literary output: approximately 25,000 books have been written in Esperanto, including original literature, translations of world classics, and a complete Wikipedia edition with over 300,000 articles.",
  },

  { kind: "heading", id: "code-switching", text: "Code-Switching at Borders" },
  {
    kind: "paragraph",
    text: "Where languages meet regularly, hybrid varieties emerge — not as corruption or degradation, but as natural linguistic creativity. Spanglish, spoken across the US-Mexico borderlands and in cities with large Hispanic populations, blends Spanish and English in ways that follow consistent grammatical patterns: 'Voy a parkear el carro' (I'm going to park the car), or mid-sentence switches at clause boundaries that code-switching researchers have shown follow systematic rules. Spanglish is not simply English with Spanish words, or vice versa — it is a legitimate mixed code with its own conventions, used by bilingual speakers who have full command of both component languages and choose to blend them for expressivity, solidarity, or communicative efficiency.",
  },
  {
    kind: "callout",
    variant: "key-idea",
    text: "Code-switching — the practice of alternating between two or more languages within a single conversation — is a sign of linguistic competence, not deficiency. Speakers who code-switch are navigating complex social cues about identity, solidarity, and context. Hinglish (Hindi + English) in India, Singlish (English + Mandarin + Malay + Tamil) in Singapore, and Taglish (Tagalog + English) in the Philippines are all legitimate linguistic varieties with millions of speakers and growing cultural prestige.",
  },

  { kind: "heading", id: "language-national-identity", text: "Language as National Identity" },
  {
    kind: "paragraph",
    text: "Languages are among the most politically charged instruments of national identity. The revival of Hebrew as a spoken language in the late nineteenth and early twentieth centuries — transforming a language used primarily in prayer and scholarship into the everyday language of a nation — is one of the most remarkable achievements in linguistic history. Eliezer Ben-Yehuda, the principal architect of Modern Hebrew, moved to Palestine in 1881 and refused to speak any other language, even at home; his son Ben-Zion was the first native speaker of Modern Hebrew in centuries. The language revival was inseparable from the Zionist national project: Hebrew united Jewish immigrants from dozens of countries, none of whom shared a common mother tongue, under a single linguistic identity.",
  },
  {
    kind: "paragraph",
    text: "Language suppression has been a tool of assimilation and political control throughout history. Welsh was actively suppressed in schools under the Welsh Not system from the early nineteenth century — children caught speaking Welsh at school were made to wear a wooden plaque ('Welsh Not') and the child wearing it at the end of the day was punished. Māori in New Zealand was similarly discouraged in schools; by the 1970s, the language was at severe risk of extinction. Revitalisation programmes launched in the 1980s — Kōhanga Reo (language nests) for pre-school children immersed entirely in Māori — have reversed the trend; today approximately 185,000 people speak Māori. Kurdish in Turkey was banned from broadcasting, education, and publication for most of the twentieth century, and Kurdish-language media was only permitted from 2002 onward as part of EU accession negotiations.",
  },
  {
    kind: "callout",
    variant: "history-note",
    text: "The revival of Hebrew is unique in the history of language: it is the only case of a language with no native speakers being revived as the everyday spoken language of an entire community. Most language revivals aim to maintain or expand the number of speakers of a language that still has some native speakers; Hebrew had to be reconstructed from written sources and adapted to modern life, inventing thousands of words for concepts that did not exist in Biblical or Talmudic texts.",
  },

  { kind: "heading", id: "colonial-legacy", text: "The Colonial Language Legacy Today" },
  {
    kind: "paragraph",
    text: "Post-independence language politics across Africa and Asia revealed the depth of the dilemma that colonial languages created. In most former colonies, no single indigenous language was spoken by enough of the population to function as a unifying national language without privileging one ethnic group over others. Choosing an indigenous language would always mean choosing one ethnic community's language over hundreds of others — a politically explosive decision in newly independent, ethnically diverse states. The colonial language, for all its association with foreign domination, was at least ethnically neutral between the competing groups. Swahili in Tanzania was one of the rare exceptions: Julius Nyerere promoted it explicitly as a politically neutral alternative to both English and to any particular tribal language, and it succeeded in part because it was already widely spoken as a trade language before independence.",
  },
  {
    kind: "callout",
    variant: "geography-note",
    text: "Ethiopia is one of very few African countries that was never colonised (except for the brief Italian occupation 1936–41) and consequently never had a European language imposed as its administrative default. Amharic functions as the working language of the federal government, written in the unique Ge'ez script. But Ethiopia has over 80 languages, and the federal system recognises regional languages — including Oromo (the largest), Somali, Tigrinya, and Afar — as official in their respective regions.",
  },

  {
    kind: "image",
    art: "article-language-families-world",
    externalSrc:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/Human_Language_Families_%28wikicolors%29.png/1280px-Human_Language_Families_%28wikicolors%29.png",
    caption:
      "The world's major language families — approximately 7,000 languages are grouped into about 140 language families, with Indo-European, Sino-Tibetan, and Niger-Congo being the three largest by speaker count.",
    credit: "Wikimedia Commons / CC BY-SA 3.0",
  },

  ...editorialClosing({
    conclusion:
      "Official language status is a map of political power as much as linguistic geography. English and French cross the most borders because empires installed them as institutional languages in territories where they were spoken by a tiny minority, and the colonial infrastructure made them sticky even after independence. Arabic and Spanish follow the contours of historical religious and military expansion. Russian extends across time zones through Soviet policy. Swahili spread through trade and survived as a post-colonial choice. The languages with the most native speakers — Mandarin, Hindi — cross fewer formal borders because their speakers concentrated rather than dispersed. Understanding which language crosses a border, and why, is understanding a chapter of political history.",
    remember:
      "English is official in 58 countries — the most of any language. French is official in 29 countries — more sovereign states than any other language. Arabic covers 22 countries but spoken dialects diverge significantly. Mandarin has more native speakers (~920 million) than any other language but holds official status in far fewer countries because its expansion was demographic rather than colonial.",
    quizTopic: "languages and cultural geography",
  }),

  {
    kind: "crossLinks",
    title: "Related articles",
    links: [
      {
        label: "The straightest borders on Earth",
        href: "/geolibrary/article/the-straightest-borders-on-earth",
        description:
          "How geometric colonial borders divided language communities now spread across several countries.",
      },
      {
        label: "Reading a flag in thirty seconds",
        href: "/geolibrary/article/reading-a-flag-in-thirty-seconds",
        description:
          "Flags and languages are parallel systems of national identity that rarely perfectly align.",
      },
      {
        label: "What a currency tells you about a country",
        href: "/geolibrary/article/what-a-currency-tells-you-about-a-country",
        description:
          "Currency unions, like language spheres, reveal the geography of shared political trust.",
      },
    ],
  },
];
