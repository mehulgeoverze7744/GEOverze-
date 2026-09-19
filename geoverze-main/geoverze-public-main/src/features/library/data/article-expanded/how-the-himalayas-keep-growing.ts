import type { ArticleBlock } from "@/features/library/data/articles";
import { editorialClosing } from "@/features/library/lib/article-content-utils";

export const BLOCKS: readonly ArticleBlock[] = [
  // Block 1
  {
    kind: "paragraph",
    text: "Fifty million years ago the Indian subcontinent was an island, drifting north across the Tethys Ocean. It hit Eurasia at a speed geologists call catastrophic — roughly 15 cm a year by tectonic standards — and because both plates were thick continental crust, neither could subduct cleanly beneath the other. Everything went up. The result is the highest continuous mountain range on Earth, still growing, still shaking, still shaping the weather patterns that feed a billion people downstream. The Himalayas are not a backdrop to Asian geography: they are its author.",
  },

  // Block 2
  { kind: "heading", id: "tethys-ocean", text: "The ocean that used to be there" },
  // Block 3
  {
    kind: "paragraph",
    text: "The Tethys Sea was a shallow tropical ocean that separated Gondwana from Laurasia for hundreds of millions of years. Marine sediments deposited on its floor were compressed, folded and pushed skyward when the plates collided — which is why fossilised sea creatures, including ammonites and crinoids, turn up in Himalayan limestone at 5,000 metres. The summit rocks of Everest itself are Ordovician limestone, laid down underwater roughly 450 million years ago. This geological story — ocean floor becoming mountaintop — is one of the most dramatic demonstrations of plate tectonics visible anywhere on Earth's surface.",
  },
  // Block 4
  {
    kind: "callout",
    variant: "geography-note",
    text: "Marine limestone at 8,849 metres: the Qomolangma Formation at Everest's summit preserves shallow-water fossils from the Tethys Sea, making the world's highest point one of the most dramatic examples of tectonic uplift ever documented.",
  },
  // Block 5
  {
    kind: "image",
    art: "article-himalaya-north-face",
    externalSrc:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Everest_North_Face_toward_Base_Camp_Tibet_Luca_Galuzzi_2006.jpg/1280px-Everest_North_Face_toward_Base_Camp_Tibet_Luca_Galuzzi_2006.jpg",
    caption:
      "Mount Everest's north face from the Tibetan Plateau — summit limestone began as seafloor sediment.",
    credit: "Luca Galuzzi / Wikimedia Commons / CC BY-SA 2.5",
  },

  // Block 6
  {
    kind: "heading",
    id: "collision-mechanics",
    text: "Why the collision produced mountains rather than trenches",
  },
  // Block 7
  {
    kind: "paragraph",
    text: "When oceanic crust meets continental crust, the denser oceanic plate typically subducts — sinks beneath the other — creating a trench and a chain of volcanoes on the overriding plate. The Pacific Ring of Fire runs on this mechanism. The Himalayas are different because India and Eurasia are both continental, comparably buoyant. When they met, neither could sink. The crust buckled, thickened and piled upward, creating the root of the mountain range extending deep into the mantle as well as the peaks visible from space.",
  },
  // Block 8
  {
    kind: "facts",
    title: "Collision by the numbers",
    facts: [
      { label: "Convergence rate today", value: "~45 mm / year" },
      { label: "Net uplift rate", value: "~5 mm / year (after erosion)" },
      { label: "Collision began", value: "~50 million years ago" },
      { label: "Crustal thickness under Tibet", value: "~70 km (double global average)" },
      { label: "Highest peak (2020 survey)", value: "8,848.86 m — Everest" },
      { label: "Peaks above 8,000 m", value: "14, all in the Himalayan–Karakoram arc" },
    ],
  },

  // Block 9
  { kind: "heading", id: "indian-plate-motion", text: "The Indian plate's long journey north" },
  // Block 10
  {
    kind: "paragraph",
    text: "India was once part of the supercontinent Gondwana, which began breaking up around 180 million years ago. The Indian plate detached roughly 120 million years ago and drifted north at what, by tectonic standards, was remarkable speed — initially around 15–20 cm per year, slowing to the present 4–5 cm per year as the collision began to resist further movement. The trace of this journey is preserved in a chain of volcanic islands that trailed the plate northward, remnants of which now form the Lakshadweep archipelago and the Chagos-Maldive-Laccadive Ridge. Where India finally met Eurasia, the collision left a geological scar known as the Indus-Yarlung Suture Zone — a band of mashed oceanic rock running along the northern margin of the Himalayas that marks the former edge of the Tethys Ocean floor.",
  },
  // Block 11
  {
    kind: "callout",
    variant: "key-idea",
    text: "The Indus-Yarlung Suture Zone is the seam of the collision — a narrow belt of ophiolite (former ocean floor), mélange, and deformed sediment running from the upper Indus valley in the west to the Yarlung Tsangpo gorge in the east. It is the most precisely located continental collision zone on Earth.",
  },

  // Block 12
  { kind: "heading", id: "erosion-balance", text: "The war between uplift and erosion" },
  // Block 13
  {
    kind: "paragraph",
    text: "The Himalayas gain roughly 5 mm of net elevation per year — but that is after erosion takes its share. The monsoon rivers draining the southern slopes carry more sediment to the ocean than any other fluvial system on Earth. The Ganges–Brahmaputra system alone delivers around a billion tonnes of eroded Himalayan material to the Bay of Bengal annually, building the world's largest delta system across Bangladesh and West Bengal. The range is simultaneously growing and being dismantled, with the balance tipped marginally in favour of growth for now.",
  },
  // Block 14
  {
    kind: "callout",
    variant: "did-you-know",
    text: "The Himalayan rivers are older than the mountains themselves. The Indus and Brahmaputra were flowing before the collision elevated the range, and they have maintained their courses by cutting down through rising rock as fast as the mountains grew — a process called antecedent drainage.",
  },

  // Block 15
  { kind: "heading", id: "great-rivers", text: "The rivers born in the Himalayas" },
  // Block 16
  {
    kind: "paragraph",
    text: "No mountain range on Earth feeds as many great rivers as the Himalayas and the broader Hindu Kush-Himalayan (HKH) system. The rivers that originate here serve nearly 2 billion people and irrigate the most densely populated river basins in the world. They flow in every direction from the range: south to the Bay of Bengal and Arabian Sea, east to the Pacific, and — in the case of the Indus — west across Pakistan to the Arabian Sea. Their seasonal regimes are intimately tied to Himalayan glaciers and snowpack, meaning that what happens on the mountain determines what flows through the plains downstream.",
  },
  // Block 17
  {
    kind: "paragraph",
    text: "The Indus rises on the Tibetan Plateau near Mount Kailash and flows 3,180 km westward through the Karakoram, then south through Pakistan to the Arabian Sea. Pakistan's agriculture is almost entirely dependent on it; without the Indus and its tributaries, the Punjab — meaning 'five rivers' — would be desert. The Ganges rises from the Gangotri Glacier in Uttarakhand and travels 2,525 km southeast to the Bay of Bengal, passing through one of Earth's most densely populated corridors. It is sacred in Hinduism and culturally central to four countries. The Brahmaputra takes the most dramatic course: it rises just east of the Indus source on the Tibetan Plateau, flows east for 1,600 km across Tibet as the Yarlung Tsangpo, then makes a sharp hairpin turn around the world's deepest gorge at Namcha Barwa (7,782 m) and plunges southward into Arunachal Pradesh before entering Bangladesh.",
  },
  // Block 18
  {
    kind: "facts",
    title: "Major rivers originating in the Hindu Kush-Himalayan system",
    facts: [
      {
        label: "Indus",
        value: "3,180 km; feeds Pakistan, India (Punjab); basin pop. ~215 million",
      },
      { label: "Ganges", value: "2,525 km; sacred river; basin pop. ~500 million" },
      {
        label: "Brahmaputra / Yarlung Tsangpo",
        value: "2,900 km; highest river discharge in Asia",
      },
      { label: "Yangtze", value: "6,300 km; rises on Tibetan Plateau; longest river in Asia" },
      { label: "Mekong", value: "4,350 km; rises in Tibet; feeds Southeast Asia" },
      { label: "Irrawaddy", value: "2,170 km; Myanmar's main artery; rises in eastern Himalayas" },
      { label: "Salween (Nu Jiang)", value: "2,815 km; Tibet to Gulf of Martaban" },
    ],
  },
  // Block 19
  {
    kind: "image",
    art: "article-gangotri-glacier",
    externalSrc:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Gangotri_Glacier.jpg/1280px-Gangotri_Glacier.jpg",
    caption:
      "Gangotri Glacier in Uttarakhand — the principal source of the Ganges, which has retreated over 22 km since 1780.",
    credit: "Wikimedia Commons / CC BY-SA 3.0",
  },

  // Block 20
  { kind: "heading", id: "monsoon-wall", text: "The wall that makes the monsoon" },
  // Block 21
  {
    kind: "paragraph",
    text: "The Himalayas do not just exist as geography — they actively create climate. The range blocks cold, dry air from Central Asia from reaching the Indian subcontinent in winter. In summer, the barrier forces moist air from the Bay of Bengal and Arabian Sea to rise rapidly, cooling and dumping rainfall on the southern slopes. The Indian Summer Monsoon, which delivers over 70 percent of South Asia's annual rainfall in four months, is a direct consequence of this wall of rock. Without the Himalayas, the Indian subcontinent would resemble the Sahara in its moisture patterns.",
  },
  // Block 22
  {
    kind: "image",
    art: "article-monsoon-clouds-himalaya",
    externalSrc:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Monsoon_clouds_over_Darjeeling.jpg/1280px-Monsoon_clouds_over_Darjeeling.jpg",
    caption:
      "Monsoon clouds banked against the foothills of the eastern Himalayas near Darjeeling.",
    credit: "Wikimedia Commons / Public Domain",
  },
  // Block 23
  {
    kind: "paragraph",
    text: "On the northern side of the range, the story is reversed. The Tibetan Plateau — elevated to over 4,500 m by the same tectonic forces that built the Himalayas — lies in a rain shadow so profound that average annual precipitation across much of Tibet is under 300 mm, comparable to a desert. The city of Lhasa receives around 450 mm per year, most of it in summer. The contrast between the lush tea gardens of Darjeeling on the southern slopes and the arid plateau 50 km to the north is one of the most extreme vegetation transitions anywhere on Earth, entirely created by a single ridge of rock.",
  },
  // Block 24
  {
    kind: "callout",
    variant: "geography-note",
    text: "The Tibetan Plateau — covering 2.5 million km² at an average elevation above 4,500 m — is sometimes called the Third Pole for its ice volume and climatic importance. Its heating by the sun in summer creates a low-pressure cell that draws the South Asian monsoon northward, amplifying the rainfall on the Himalayan southern slopes.",
  },

  // Block 25
  { kind: "heading", id: "himalayan-glaciers", text: "Glaciers: the water towers of Asia" },
  // Block 26
  {
    kind: "paragraph",
    text: "The Himalayan region holds approximately 15,000 glaciers covering around 33,000 km² — the largest glaciated area outside the polar regions. These glaciers act as seasonal reservoirs: accumulating snow in winter and releasing melt in the dry months just before monsoon onset, when river flows would otherwise be at their lowest. The Indus, which crosses the driest parts of Pakistan, depends on Karakoram glacier melt for up to 40 percent of its summer flow. As warming accelerates glacier retreat, the short-term effect is increased melt and higher river flow; the longer-term prospect is reduced storage and highly seasonal — unreliable — flow.",
  },
  // Block 27
  {
    kind: "paragraph",
    text: "The broader Hindu Kush-Himalayan (HKH) region — including the Karakoram, Hindu Kush, Pamir, Kunlun, and Tien Shan ranges — contains around 60,000 glaciers covering 60,000 km², making it the largest concentration of glacial ice outside the polar regions. This mass has shrunk at an accelerating rate since the 1970s. The IPCC's 2019 Special Report on the Ocean and Cryosphere in a Changing Climate found that the HKH region has lost approximately 40 percent of its ice area in the past 50 years. Glacial retreat creates a dangerous transitional period: as melt accelerates, rivers carry more water temporarily, but behind retreating glaciers, hundreds of glacial lakes are forming. When those natural ice-and-rock dams fail, they release glacial lake outburst floods (GLOFs) — walls of water that have killed thousands across Nepal, Pakistan and India.",
  },
  // Block 28
  {
    kind: "callout",
    variant: "by-the-numbers",
    text: "The Gangotri Glacier — source of the Ganges — has retreated approximately 22 km since 1780, with retreat accelerating from an average of 22 m/year in the 1970s to over 30 m/year since 2000. The Siachen Glacier in the Karakoram, the world's longest non-polar glacier at 76 km, has thinned by up to 50 m since the 1970s.",
  },
  // Block 29
  {
    kind: "timeline",
    title: "Selected observations of Himalayan change",
    events: [
      {
        date: "1953",
        text: "First ascent of Everest by Hillary and Tenzing; early glacier surveys begin.",
      },
      {
        date: "1970s",
        text: "Systematic satellite monitoring establishes baseline glacier extent across the HKH region.",
      },
      {
        date: "2000s",
        text: "GRACE satellite data shows net mass loss from Himalayan glaciers accelerating significantly.",
      },
      {
        date: "2015",
        text: "Nepal earthquake (Mw 7.8) triggers hundreds of avalanches and GLOFs; 8,900 deaths.",
      },
      {
        date: "2019",
        text: "IPCC Special Report on Cryosphere warns of cascading water-security risks for 2 billion people.",
      },
      {
        date: "2023",
        text: "Gangotri Glacier has retreated ~22 km since 1780; retreat rate has doubled since 1990.",
      },
      {
        date: "2024",
        text: "New survey confirms Everest summit elevation at 8,848.86 m, resolving earlier discrepancies.",
      },
    ],
  },
  // Block 30
  {
    kind: "image",
    art: "article-himalaya-range-panorama",
    externalSrc:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/Himalaya_composite.jpg/1280px-Himalaya_composite.jpg",
    caption:
      "The Himalayan range seen from the south — ten of the world's fourteen 8,000 m peaks lie in this arc.",
    credit: "Wikimedia Commons / Public Domain",
  },

  // Block 31
  { kind: "heading", id: "mount-everest", text: "Mount Everest: life in the death zone" },
  // Block 32
  {
    kind: "paragraph",
    text: "Everest is known by three names. In English it bears the name of Sir George Everest, the Surveyor General of India who led the Great Trigonometrical Survey — though Everest himself, in an act of professional modesty unusual for the era, tried to prevent the mountain being named after him. Tibetans call it Qomolangma, variously translated as 'Goddess Mother of Mountains' or 'Holy Mother', a name used in Chinese maps as well. Nepal uses Sagarmāthā, meaning 'forehead of the sky' or 'goddess of the universe', and it gives its name to the national park surrounding the mountain. Above 8,000 metres lies what climbers call the death zone — where atmospheric pressure is less than one-third of sea level, and the human body cannot acclimatise, only deteriorate. Without supplementary oxygen, most people lose consciousness within hours; even with it, every climber on a summit bid is in a physiological emergency.",
  },
  // Block 33
  {
    kind: "paragraph",
    text: "The climbing calendar is dictated entirely by weather. The main summit window is in May, during the brief period between the cold and jet-stream winds of winter and the monsoon that arrives in June and blankets the mountain in storm. A secondary window of two to three weeks exists in September–October, after the monsoon withdraws. In a typical year, fewer than 300 people reach the summit in May; some years the jet stream refuses to lift and nobody reaches the top at all. The first ascent on 29 May 1953 was by Edmund Hillary of New Zealand and Tenzing Norgay Sherpa of Nepal, climbing the southeast ridge via the South Col — a route that remains the most popular today. By 2024 the summit had been reached approximately 11,000 times, with over 300 deaths on the mountain.",
  },
  // Block 34
  {
    kind: "facts",
    title: "Mount Everest key facts",
    facts: [
      { label: "Summit elevation (2020 official)", value: "8,848.86 m (Nepal-China joint survey)" },
      { label: "Tibetan / Chinese name", value: "Qomolangma ('Goddess Mother of Mountains')" },
      { label: "Nepali name", value: "Sagarmāthā ('Forehead of the sky')" },
      { label: "First ascent", value: "29 May 1953 — Hillary and Tenzing Norgay" },
      { label: "Death zone altitude", value: "Above 8,000 m — less than 33% sea-level oxygen" },
      { label: "Typical summit window", value: "Late April – late May (pre-monsoon)" },
      { label: "Total recorded ascents (to 2024)", value: "~11,000+ by ~6,000 individuals" },
    ],
  },

  // Block 35
  { kind: "heading", id: "fourteen-eight-thousanders", text: "The fourteen eight-thousanders" },
  // Block 36
  {
    kind: "paragraph",
    text: "There are exactly fourteen mountains on Earth that exceed 8,000 metres — the so-called 'death zone' altitude above which humans cannot acclimatise indefinitely. All fourteen lie in the Himalayan-Karakoram arc, and ten of them are in Nepal or on the Nepal-Tibet border. Climbing all fourteen became mountaineering's most prestigious quest after Reinhold Messner of Italy completed the set in 1986, and by 2024 around 45 people had done so. The second-highest, K2 (8,611 m) in the Karakoram, is widely considered the most technically difficult and dangerous, with a historical death-to-summit ratio of around one in four. Annapurna I (8,091 m) held the worst fatality ratio until improvements in equipment and rescue logistics in the 2000s began to shift the statistics.",
  },
  // Block 37
  {
    kind: "list",
    items: [
      "Everest (8,848.86 m) — Nepal/China; highest on Earth.",
      "K2 (8,611 m) — Pakistan/China (Karakoram); most technically demanding.",
      "Kangchenjunga (8,586 m) — Nepal/India; third highest; rarely climbed from the Indian side.",
      "Lhotse (8,516 m) — Nepal/China; shares Everest's south face.",
      "Makalu (8,485 m) — Nepal/China; steep pyramid shape; technically demanding.",
      "Cho Oyu (8,201 m) — Nepal/China; the most frequently climbed 8,000-metre peak.",
      "Dhaulagiri I (8,167 m) — Nepal; first ascent 1960.",
      "Manaslu (8,163 m) — Nepal; first climbed by a Japanese expedition 1956.",
      "Nanga Parbat (8,126 m) — Pakistan; the 'Killer Mountain', near-vertical Rupal Face.",
      "Annapurna I (8,091 m) — Nepal; first 8,000-metre peak ever climbed (1950, French team).",
    ],
  },
  // Block 38
  { kind: "heading", id: "everest-measurement", text: "How tall is Everest, exactly?" },
  // Block 39
  {
    kind: "paragraph",
    text: "Everest's official height has changed multiple times as measurement technology improved. The 1856 Survey of India calculated 8,840 m using theodolites from observation posts in the Indian plains — a remarkable result with equipment of that era. GPS surveys in the late twentieth century converged on 8,848 m. A joint Nepal–China survey completed in 2020, using GNSS receivers at the summit and correcting for the snow cap's depth, settled on 8,848.86 m — about 86 cm higher than the previous official figure. The measurement itself took six climbers to the summit in difficult conditions to plant a GNSS pole.",
  },

  // Block 40
  { kind: "heading", id: "himalayan-biodiversity", text: "Life at the roof of the world" },
  // Block 38
  {
    kind: "paragraph",
    text: "The ecological gradient from the Himalayan foothills to the alpine zone is among the most dramatic on Earth, compressing subtropical, temperate, subalpine, alpine and nival zones into a vertical span of a few thousand metres. The eastern Himalayas — from Nepal through Bhutan and into Arunachal Pradesh — form one of the world's 36 biodiversity hotspots identified by Conservation International. The region's rhododendron forests alone contain over 600 species, from tree-sized specimens at 2,000 m to knee-high ground-hugging shrubs at 4,500 m. The Terai belt at the mountain's foot supports Bengal tigers, Asian elephants, and one-horned rhinoceroses in the same latitude as northern Spain.",
  },
  // Block 39
  {
    kind: "list",
    items: [
      "Snow leopard (Panthera uncia) — ranges 3,000–5,500 m; IUCN Vulnerable; estimated 4,000–6,500 individuals globally.",
      "Red panda (Ailurus fulgens) — found 2,200–4,800 m in rhododendron-bamboo forests; IUCN Endangered.",
      "Himalayan tahr (Hemitragus jemlahicus) — wild goat relative; cliff-dweller at 2,500–5,000 m.",
      "Bar-headed goose (Anser indicus) — migrates over the Himalayas at over 8,000 m; highest-flying bird during migration.",
      "Himalayan monal (Lophophorus impejanus) — national bird of Nepal; iridescent pheasant at 2,400–4,500 m.",
      "Tibetan antelope (chiru) — Pantholops hodgsonii; formerly hunted to near-extinction for shahtoosh shawls.",
    ],
  },
  // Block 40
  {
    kind: "image",
    art: "article-snow-leopard-himalaya",
    externalSrc:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/Schneeleopard_1.jpg/1280px-Schneeleopard_1.jpg",
    caption:
      "The snow leopard ranges across the Himalayas and Central Asian ranges — IUCN Vulnerable with around 4,000–6,500 individuals remaining.",
    credit: "Wikimedia Commons / CC BY-SA 2.5",
  },

  // Block 41
  { kind: "heading", id: "human-settlements", text: "Peoples of the high Himalayas" },
  // Block 42
  {
    kind: "paragraph",
    text: "The Tibetan Plateau and Himalayan valleys have been inhabited for at least 30,000 years, with continuous occupation from the time of the last glacial maximum. The Tibetan people developed a culture centred on pastoralism, Buddhism, and trade across the mountain passes — the same high-altitude corridors that served as arteries for the Silk Road's southern branches. Lhasa, at 3,650 m, is the world's highest city of over a million people and was for centuries the seat of the Dalai Lama's theocratic government. The Potala Palace, built from the 17th century onwards on a rocky ridge above the city, remains the most iconic architectural expression of Himalayan civilisation.",
  },
  // Block 43
  {
    kind: "paragraph",
    text: "The Sherpa people of the Solo-Khumbu region in Nepal have become synonymous with Himalayan mountaineering — so much so that 'sherpa' has passed into general English as a word for a guide or logistics expert. Sherpas migrated from Tibet into Nepal roughly 500 years ago and settled at altitudes between 3,000 and 4,800 m, farming potatoes (introduced from South America in the 19th century), herding yaks, and trading. Their physiological adaptation to altitude is partly genetic: Sherpas carry a variant of the EPAS1 gene — sometimes called the 'superathlete gene' — that allows their haemoglobin levels to remain low while their cells extract oxygen with unusual efficiency. This adaptation, selected over generations of high-altitude living, is absent in lowland populations and largely absent even in Andean highlanders.",
  },
  // Block 44
  {
    kind: "callout",
    variant: "did-you-know",
    text: "The EPAS1 gene variant found in Sherpas and Tibetan highlanders appears to have been acquired through interbreeding with Denisovans — a separate human species that lived in Asia and went extinct roughly 40,000 years ago. The Himalayan altitude adaptation is thus partly inherited from an ancient human relative.",
  },
  // Block 45
  {
    kind: "image",
    art: "article-potala-palace-lhasa",
    externalSrc:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Potala_palace_34.jpg/1280px-Potala_palace_34.jpg",
    caption:
      "The Potala Palace in Lhasa, Tibet — seat of Dalai Lama governance for three centuries, at 3,650 m elevation.",
    credit: "Wikimedia Commons / CC BY-SA 3.0",
  },

  // Block 46
  { kind: "heading", id: "seismic-risk", text: "The earthquake machine" },
  // Block 47
  {
    kind: "paragraph",
    text: "Active compression means active faulting. The Himalayan front is one of the world's most seismically hazardous zones, with a demonstrated capacity for magnitude 8+ earthquakes along the Main Frontal Thrust. The 2015 Nepal earthquake (magnitude 7.8) killed nearly 9,000 people and caused measurable surface deformation across thousands of square kilometres. Kathmandu sits in a sediment-filled valley that amplifies seismic waves — the same geology that trapped a prehistoric lake now traps earthquake energy. Geophysicists calculate that strain is accumulating in locked segments of the fault at a rate that implies large earthquakes are a question of when, not if.",
  },
  // Block 48
  {
    kind: "callout",
    variant: "by-the-numbers",
    text: "The 2015 Nepal earthquake released energy equivalent to roughly 20,000 Hiroshima bombs and shifted Kathmandu 3 metres southward and 1 metre upward in under two minutes. GPS monitoring networks recorded the displacement in real time.",
  },
  // Block 49
  {
    kind: "paragraph",
    text: "The April 2015 Gorkha earthquake struck on a Saturday morning when many rural residents were outdoors — limiting the death toll compared to what a weekday quake might have caused. Still, nearly 9,000 people died and 22,000 were injured. Around 600,000 structures were destroyed or damaged, and whole hillside villages in the Gorkha and Langtang districts were obliterated by earthquake-triggered avalanches. Palaeoseismological evidence — trenches dug across fault scarps — shows that the same Main Himalayan Thrust has produced magnitude 8.0+ events repeatedly over the past millennium, including a great earthquake in 1505 and another in 1934. The Kathmandu Valley's lake sediments, up to 600 m deep, act as a resonance bowl that amplifies ground shaking to levels far above what occurs on bedrock.",
  },

  // Block 50
  { kind: "heading", id: "climate-crisis-himalayas", text: "The Himalayas and the climate crisis" },
  // Block 51
  {
    kind: "paragraph",
    text: "The Hindu Kush-Himalayan region is warming at roughly 0.3°C per decade — faster than the global average. For nearly 2 billion people who depend on HKH rivers for drinking water, irrigation and hydropower, this is not an abstract statistic. In the near term, accelerating glacial melt is inflating river flows — a counter-intuitive abundance that is itself destabilising: the Indus floods of 2022, which submerged one-third of Pakistan, were supercharged by glacial melt coinciding with extreme monsoon rainfall. The longer-term prospect is what glaciologists call 'peak water': once glaciers shrink past a critical mass, annual melt volumes begin to decline, and rivers fed primarily by ice rather than rainfall will deliver less water than today.",
  },
  // Block 52
  {
    kind: "paragraph",
    text: "Permafrost thaw is an additional hazard receiving less attention than glaciers. At elevations above 4,000 m, much of the mountain terrain is underlain by permafrost that binds slopes together. As temperatures rise, this frozen glue melts, destabilising hillsides that have been stable for thousands of years. The result is an increasing frequency of rock and debris falls with no seismic trigger — slopes simply becoming too warm to hold together. Glacial lake outburst floods (GLOFs) represent a third category of growing hazard: as glaciers retreat, they leave behind moraine dams holding lakes of meltwater; when those dams fail — from seepage, overtopping, or seismic shock — the resulting flood can travel hundreds of kilometres downstream in hours.",
  },
  {
    kind: "callout",
    variant: "key-idea",
    text: "The Hindu Kush-Himalayan system is sometimes called the 'Water Tower of Asia'. Its glaciers, snowpack, and permafrost store freshwater for rivers that serve nearly 2 billion people across 16 countries. The stability of that system determines food and water security for one-quarter of humanity.",
  },
  {
    kind: "dualCompare",
    title: "Two sides of the same mountain: Nepal vs Tibet",
    leftTitle: "Southern (Nepal) side",
    leftItems: [
      "Annual rainfall 1,500–3,000 mm on foothills (monsoon driven)",
      "Tropical and subtropical forests below 2,000 m",
      "Dense human settlement; Kathmandu Valley at 1,400 m",
      "Most 8,000-metre peaks approached from south",
      "Teahouse trekking culture; Everest Base Camp on this side",
    ],
    rightTitle: "Northern (Tibetan) side",
    rightItems: [
      "Annual rainfall under 300 mm — high-altitude desert",
      "Treeless steppe and alpine meadow dominate",
      "Tibetan Plateau at 4,500 m average — 'roof of the world'",
      "Everest north face historically attempted from Tibet",
      "Pastoral nomad yak-herding culture",
    ],
  },

  { kind: "heading", id: "mountain-comparison", text: "The world's great mountain ranges" },
  {
    kind: "facts",
    title: "World's highest peaks by range",
    facts: [
      { label: "Everest — Himalayas (Nepal/China)", value: "8,848.86 m — highest on Earth" },
      {
        label: "K2 — Karakoram (Pakistan/China)",
        value: "8,611 m — most dangerous, ~1 in 4 fatality ratio",
      },
      { label: "Aconcagua — Andes (Argentina)", value: "6,961 m — highest peak outside Asia" },
      { label: "Denali — Alaska Range (USA)", value: "6,190 m — highest in North America" },
      { label: "Kilimanjaro — East Africa (Tanzania)", value: "5,895 m — highest in Africa" },
      {
        label: "Mont Blanc — Alps (France/Italy)",
        value: "4,808 m — highest in Europe (excl. Caucasus)",
      },
      {
        label: "Elbrus — Caucasus (Russia)",
        value: "5,642 m — highest in Europe by broader definition",
      },
    ],
  },
  {
    kind: "table",
    title: "World's major mountain ranges compared",
    columns: ["Range", "Highest Peak", "Length (km)", "Highest Elevation", "Formation age"],
    rows: [
      ["Himalayas (inc. Karakoram)", "Everest", "2,400", "8,848.86 m", "~50 million years ago"],
      ["Andes", "Aconcagua", "7,000", "6,961 m", "~25 million years ago"],
      ["Alps", "Mont Blanc", "1,200", "4,808 m", "~35 million years ago"],
      ["Rocky Mountains", "Mount Elbert", "4,800", "4,401 m", "~80 million years ago"],
      ["Atlas", "Toubkal", "2,500", "4,167 m", "~65 million years ago"],
      ["Ural Mountains", "Mount Narodnaya", "2,500", "1,895 m", "~300 million years ago"],
      ["Great Dividing Range", "Mount Kosciuszko", "3,500", "2,228 m", "~380 million years ago"],
    ],
  },
  // Block 56
  {
    kind: "timeline",
    title: "From Gondwana to today: the making of the Himalayas",
    events: [
      {
        date: "~180 million years ago",
        text: "Gondwana supercontinent begins breaking up; Indian plate begins to separate.",
      },
      {
        date: "~120 million years ago",
        text: "Indian plate fully detaches and begins northward drift, initially at ~15–20 cm/year.",
      },
      {
        date: "~66 million years ago",
        text: "India crosses the equator; the Tethys Ocean begins to close.",
      },
      {
        date: "~50–55 million years ago",
        text: "India-Eurasia collision begins; crust buckles and the first Himalayan uplift starts.",
      },
      {
        date: "~25 million years ago",
        text: "Tibetan Plateau reaches substantial elevation; Asian monsoon begins to intensify.",
      },
      {
        date: "~5–10 million years ago",
        text: "Himalayas reach near-modern heights; major rivers establish antecedent courses.",
      },
      {
        date: "~30,000 years ago",
        text: "Earliest human settlements on the Tibetan Plateau despite glacial conditions.",
      },
      {
        date: "1856",
        text: "Survey of India computes Everest's height at 8,840 m from the plains of India.",
      },
      {
        date: "1953",
        text: "First summit of Everest; systematic scientific study of the range begins.",
      },
      {
        date: "Present",
        text: "Himalayas rise ~5 mm/year net; glaciers retreating; 2 billion people depend on HKH rivers.",
      },
    ],
  },

  // Block 57–60: editorialClosing (4 blocks)
  ...editorialClosing({
    conclusion:
      "The Himalayas are not a static backdrop to Asian geography. They are a collision that has not stopped, a wall that creates the monsoon, a reservoir that stores winter snow for summer rivers, and a fault system that periodically resets the landscape. Every measurement of the range — height, ice volume, erosion rate — is a reading of an ongoing process, not a fixed fact. Understanding them means understanding why two billion people live where they do, farm what they farm, and face the water insecurities that are reshaping the subcontinent.",
    remember:
      "The Himalayas grow because India is still moving north at 45 mm per year. Net annual uplift is about 5 mm after erosion. The summit limestone of Everest is marine sediment from a closed ocean. The range's glaciers feed rivers serving nearly 2 billion people — and they are retreating.",
    quizTopic: "mountain ranges and physical geography",
  }),
];
