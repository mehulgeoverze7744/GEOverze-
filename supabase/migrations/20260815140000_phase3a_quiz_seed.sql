-- =============================================================================
-- Phase 3A — Step 2: Seed Existing Playable Quiz Content
--
-- Seeds the 5 existing playable quiz sets and their 50 questions from the
-- static TypeScript source (src/features/quiz/data/quizSets.ts) into the
-- database tables created in Phase 3A Step 1.
--
-- Source of truth: src/features/quiz/data/quizSets.ts (verbatim reproduction)
-- No field has been invented, altered, corrected, or improved.
-- The TypeScript → SQL column mapping is:
--
--   QuizSet.id            → quizzes.id
--   QuizSet.title         → quizzes.title
--   QuizSet.description   → quizzes.description
--   QuizSet.categoryId    → quizzes.category_id
--   QuizSet.creator       → quizzes.creator
--   QuizSet.art           → quizzes.art
--   QuizSet.difficulty    → quizzes.difficulty
--   QuizSet.minutes       → quizzes.minutes
--   QuizSet.language      → quizzes.language
--   QuizSet.rewards.xp    → quizzes.reward_xp
--   QuizSet.rewards.credits → quizzes.reward_credits
--   (is_published = true  for all 5, they are live playable quizzes)
--
--   QuizSet.questions[i].prompt        → quiz_questions.prompt
--   QuizSet.questions[i].explanation   → quiz_questions.explanation
--   QuizSet.questions[i].media         → quiz_questions.media  (JSONB)
--   QuizSet.questions[i].type          → quiz_questions.type   (enum)
--   (type-specific fields mapped per discriminated union — see inline comments)
--
-- Note on the TypeScript question IDs (f1, c1, p1, etc.):
--   These short IDs are NOT globally unique (f1 exists in flags; c1 in countries).
--   The schema has no slug column in quiz_questions. The TypeScript IDs are
--   preserved only in SQL comments for traceability; they are not stored in any
--   database column. The authoritative identity is the UUID primary key.
--
-- Phase 2C safety:
--   - No quiz_attempts rows are modified.
--   - No user_progression rows are modified.
--   - record_quiz_attempt() is not changed.
--   - attempt_id idempotency is not affected.
--   - The FK is added ONLY after verifying all existing quiz_attempts.quiz_id
--     values match the 5 seeded quizzes. Migration HALTS if any mismatch found.
--
-- Idempotency:
--   - quizzes: ON CONFLICT (id) DO NOTHING
--   - quiz_questions: ON CONFLICT (quiz_id, position) DO NOTHING
--   - FK guard: IF NOT EXISTS check before ALTER TABLE
--   Safe to re-run without creating duplicates.
-- =============================================================================


-- =============================================================================
-- 1. public.quizzes — 5 rows
-- =============================================================================

insert into public.quizzes (
  id, title, description, category_id, creator, art,
  difficulty, minutes, language, reward_xp, reward_credits, is_published
)
values
  (
    'q-flag-blitz',
    'Flag Blitz',
    'Fifty banners, five minutes. Colours, crests and the stories folded into every flag.',
    'flags', 'GEOverze Studio', 'flags', 'Easy', 5, 'English', 240, 60, true
  ),
  (
    'q-atlas-sprint',
    'Atlas Sprint',
    'Borders, sizes and populations — a fast lap around every inhabited continent.',
    'countries', 'GEOverze Studio', 'countries', 'Medium', 7, 'English', 320, 80, true
  ),
  (
    'q-capital-cities',
    'Capital Confusion',
    'The obvious, the moved and the ones that catch everybody out.',
    'capitals', 'Mira Osei', 'capitals', 'Hard', 6, 'English', 380, 95, true
  ),
  (
    'q-pin-the-place',
    'Pin the Place',
    'Read the terrain, trust your sense of scale and drop the pin.',
    'maps', 'Cartography Club', 'maps', 'Expert', 9, 'English', 460, 120, true
  ),
  (
    'q-monuments',
    'Monuments & Marvels',
    'Monuments, ruins and skylines from all six inhabited continents.',
    'landmarks', 'Leo Marchetti', 'landmarks', 'Medium', 7, 'English', 300, 75, true
  )
on conflict (id) do nothing;


-- =============================================================================
-- 2. public.quiz_questions — 50 rows
--
-- INSERT column order used throughout this section:
--   quiz_id, position, type, prompt, explanation, media,
--   options, answer_id, answer_ids, answer_bool,
--   regions, board_art, accepted, placeholder, items, targets
--
-- NULL is written for every column not applicable to the question type:
--   single / image : options, answer_id  (media optional)
--   multiple       : options, answer_ids
--   boolean        : answer_bool
--   map            : regions, board_art, answer_id
--   typed          : accepted  (placeholder optional)
--   order          : items
--   dragdrop       : items, targets
-- =============================================================================


-- ─── q-flag-blitz (10 questions) ─────────────────────────────────────────────

insert into public.quiz_questions (
  quiz_id, position, type, prompt, explanation, media,
  options, answer_id, answer_ids, answer_bool,
  regions, board_art, accepted, placeholder, items, targets
)
values

-- f1: single — media flag glyph 🇯🇵
(
  'q-flag-blitz', 1, 'single',
  'Which country flies this flag?',
  'Japan''s Nisshōki places a plain crimson sun centred on white. Bangladesh offsets its disc and uses a green field.',
  '{"kind":"flag","glyph":"🇯🇵","caption":"A single crimson disc on white"}',
  '[{"id":"a","label":"Bangladesh"},{"id":"b","label":"Japan"},{"id":"c","label":"Palau"},{"id":"d","label":"South Korea"}]',
  'b', NULL, NULL,
  NULL, NULL, NULL, NULL, NULL, NULL
),

-- f2: image — flag tiles with glyph + art
(
  'q-flag-blitz', 2, 'image',
  'Select the flag of Brazil.',
  'Green field, gold rhombus, blue celestial globe with the motto Ordem e Progresso.',
  NULL,
  '[{"id":"a","label":"Brazil","glyph":"🇧🇷","art":"flag-br"},{"id":"b","label":"Argentina","glyph":"🇦🇷","art":"flag-ar"},{"id":"c","label":"Portugal","glyph":"🇵🇹","art":"flag-pt"},{"id":"d","label":"Colombia","glyph":"🇨🇴","art":"flag-co"}]',
  'a', NULL, NULL,
  NULL, NULL, NULL, NULL, NULL, NULL
),

-- f3: boolean
(
  'q-flag-blitz', 3, 'boolean',
  'Nepal is the only country in the world without a rectangular flag.',
  'Nepal''s flag is two stacked pennants — the only non-quadrilateral national flag.',
  NULL,
  NULL, NULL, NULL, true,
  NULL, NULL, NULL, NULL, NULL, NULL
),

-- f4: single — media flag glyph 🇮🇸
(
  'q-flag-blitz', 4, 'single',
  'This flag belongs to which Nordic country?',
  'Iceland inverts Norway''s palette: blue field with a white-bordered red cross.',
  '{"kind":"flag","glyph":"🇮🇸","caption":"Blue field, white-edged red cross"}',
  '[{"id":"a","label":"Norway"},{"id":"b","label":"Iceland"},{"id":"c","label":"Finland"},{"id":"d","label":"Denmark"}]',
  'b', NULL, NULL,
  NULL, NULL, NULL, NULL, NULL, NULL
),

-- f5: multiple
(
  'q-flag-blitz', 5, 'multiple',
  'Which of these flags feature a maple, cedar or other tree or leaf?',
  'Canada carries a maple leaf, Lebanon a cedar and Eritrea an olive branch wreath. Chile''s emblem is a lone star.',
  NULL,
  '[{"id":"a","label":"Canada"},{"id":"b","label":"Lebanon"},{"id":"c","label":"Chile"},{"id":"d","label":"Eritrea"}]',
  NULL, ARRAY['a','b','d'], NULL,
  NULL, NULL, NULL, NULL, NULL, NULL
),

-- f6: typed
(
  'q-flag-blitz', 6, 'typed',
  'Name the country whose flag is a plain green field with no other charge.',
  'Libya flew an all-green flag from 1977 to 2011 — the only single-colour national flag.',
  NULL,
  NULL, NULL, NULL, NULL,
  NULL, NULL, ARRAY['libya'], 'Type a country', NULL, NULL
),

-- f7: single — media flag glyph 🇧🇹
(
  'q-flag-blitz', 7, 'single',
  'Which flag shows a golden dragon?',
  'Bhutan''s Druk, the thunder dragon, clutches jewels across a diagonally split field.',
  '{"kind":"flag","glyph":"🇧🇹","caption":"Saffron and orange split field"}',
  '[{"id":"a","label":"Bhutan"},{"id":"b","label":"Wales"},{"id":"c","label":"Malta"},{"id":"d","label":"Mongolia"}]',
  'a', NULL, NULL,
  NULL, NULL, NULL, NULL, NULL, NULL
),

-- f8: boolean
(
  'q-flag-blitz', 8, 'boolean',
  'The flags of Indonesia and Monaco use the same two colours in the same order.',
  'Both are red over white; only the proportions differ.',
  NULL,
  NULL, NULL, NULL, true,
  NULL, NULL, NULL, NULL, NULL, NULL
),

-- f9: image — flag tiles with glyph + art
(
  'q-flag-blitz', 9, 'image',
  'Which of these is the flag of South Africa?',
  'Six colours in a horizontal Y — the most colours on any current national flag.',
  NULL,
  '[{"id":"a","label":"Kenya","glyph":"🇰🇪","art":"flag-ke"},{"id":"b","label":"South Africa","glyph":"🇿🇦","art":"flag-za"},{"id":"c","label":"Ghana","glyph":"🇬🇭","art":"flag-gh"},{"id":"d","label":"Zimbabwe","glyph":"🇿🇼","art":"flag-zw"}]',
  'b', NULL, NULL,
  NULL, NULL, NULL, NULL, NULL, NULL
),

-- f10: order (placeholder renderer)
(
  'q-flag-blitz', 10, 'order',
  'Arrange these flags by the year their current design was adopted.',
  'Ordering questions arrive with the sequencing engine.',
  NULL,
  NULL, NULL, NULL, NULL,
  NULL, NULL, NULL, NULL,
  ARRAY['Denmark','United States','Canada','South Africa'], NULL
)

on conflict (quiz_id, position) do nothing;


-- ─── q-atlas-sprint (10 questions) ───────────────────────────────────────────

insert into public.quiz_questions (
  quiz_id, position, type, prompt, explanation, media,
  options, answer_id, answer_ids, answer_bool,
  regions, board_art, accepted, placeholder, items, targets
)
values

-- c1: single
(
  'q-atlas-sprint', 1, 'single',
  'Which country is the largest by land area?',
  'Russia covers about 17.1 million km² — roughly 11% of the planet''s land.',
  NULL,
  '[{"id":"a","label":"Canada"},{"id":"b","label":"China"},{"id":"c","label":"Russia"},{"id":"d","label":"United States"}]',
  'c', NULL, NULL,
  NULL, NULL, NULL, NULL, NULL, NULL
),

-- c2: multiple
(
  'q-atlas-sprint', 2, 'multiple',
  'Which of these countries are landlocked?',
  'Vietnam has 3,260 km of coastline; the other three have none.',
  NULL,
  '[{"id":"a","label":"Bolivia"},{"id":"b","label":"Nepal"},{"id":"c","label":"Vietnam"},{"id":"d","label":"Austria"}]',
  NULL, ARRAY['a','b','d'], NULL,
  NULL, NULL, NULL, NULL, NULL, NULL
),

-- c3: boolean
(
  'q-atlas-sprint', 3, 'boolean',
  'Turkey lies on two continents.',
  'The Bosphorus splits Turkey between Europe and Asia.',
  NULL,
  NULL, NULL, NULL, true,
  NULL, NULL, NULL, NULL, NULL, NULL
),

-- c4: typed — two accepted answers
(
  'q-atlas-sprint', 4, 'typed',
  'Which country has the most land neighbours, at fourteen?',
  'China and Russia are tied at fourteen land borders each.',
  NULL,
  NULL, NULL, NULL, NULL,
  NULL, NULL, ARRAY['china','russia'], 'Type a country', NULL, NULL
),

-- c5: single — media illustration
(
  'q-atlas-sprint', 5, 'single',
  'Which country''s outline is shown here?',
  'Chile runs 4,300 km north to south and averages only 177 km wide.',
  '{"kind":"illustration","art":"outline-cl","caption":"A long, narrow strip of coast"}',
  '[{"id":"a","label":"Chile"},{"id":"b","label":"Norway"},{"id":"c","label":"Vietnam"},{"id":"d","label":"Italy"}]',
  'a', NULL, NULL,
  NULL, NULL, NULL, NULL, NULL, NULL
),

-- c6: single
(
  'q-atlas-sprint', 6, 'single',
  'Which is the smallest sovereign state in the world?',
  'Vatican City covers 0.49 km² — smaller than most city parks.',
  NULL,
  '[{"id":"a","label":"Monaco"},{"id":"b","label":"Nauru"},{"id":"c","label":"Vatican City"},{"id":"d","label":"San Marino"}]',
  'c', NULL, NULL,
  NULL, NULL, NULL, NULL, NULL, NULL
),

-- c7: boolean
(
  'q-atlas-sprint', 7, 'boolean',
  'Australia is both a country and a continent.',
  'It is the only country to occupy an entire continental landmass.',
  NULL,
  NULL, NULL, NULL, true,
  NULL, NULL, NULL, NULL, NULL, NULL
),

-- c8: single
(
  'q-atlas-sprint', 8, 'single',
  'Which country has the largest population?',
  'India passed China in 2023 and now holds the largest population.',
  NULL,
  '[{"id":"a","label":"India"},{"id":"b","label":"China"},{"id":"c","label":"United States"},{"id":"d","label":"Indonesia"}]',
  'a', NULL, NULL,
  NULL, NULL, NULL, NULL, NULL, NULL
),

-- c9: multiple
(
  'q-atlas-sprint', 9, 'multiple',
  'Which of these countries sit at least partly above the Arctic Circle?',
  'Estonia''s northernmost point sits well south of 66°34′N.',
  NULL,
  '[{"id":"a","label":"Finland"},{"id":"b","label":"Canada"},{"id":"c","label":"Estonia"},{"id":"d","label":"Russia"}]',
  NULL, ARRAY['a','b','d'], NULL,
  NULL, NULL, NULL, NULL, NULL, NULL
),

-- c10: dragdrop (placeholder renderer)
(
  'q-atlas-sprint', 10, 'dragdrop',
  'Match each country to its continent.',
  'Matching questions arrive with the drag-and-drop engine.',
  NULL,
  NULL, NULL, NULL, NULL,
  NULL, NULL, NULL, NULL,
  ARRAY['Suriname','Laos','Namibia'], ARRAY['South America','Asia','Africa']
)

on conflict (quiz_id, position) do nothing;


-- ─── q-capital-cities (10 questions) ─────────────────────────────────────────

insert into public.quiz_questions (
  quiz_id, position, type, prompt, explanation, media,
  options, answer_id, answer_ids, answer_bool,
  regions, board_art, accepted, placeholder, items, targets
)
values

-- p1: single
(
  'q-capital-cities', 1, 'single',
  'What is the capital of Australia?',
  'Canberra was purpose-built as a compromise between Sydney and Melbourne.',
  NULL,
  '[{"id":"a","label":"Sydney"},{"id":"b","label":"Melbourne"},{"id":"c","label":"Canberra"},{"id":"d","label":"Perth"}]',
  'c', NULL, NULL,
  NULL, NULL, NULL, NULL, NULL, NULL
),

-- p2: typed — three accepted answers (city renamed twice)
(
  'q-capital-cities', 2, 'typed',
  'Name the capital of Kazakhstan.',
  'Renamed Nur-Sultan in 2019 and back to Astana in 2022.',
  NULL,
  NULL, NULL, NULL, NULL,
  NULL, NULL, ARRAY['astana','nur-sultan','nur sultan'], 'Type a city', NULL, NULL
),

-- p3: boolean
(
  'q-capital-cities', 3, 'boolean',
  'Bolivia has two capitals.',
  'Sucre is the constitutional capital; La Paz holds the government.',
  NULL,
  NULL, NULL, NULL, true,
  NULL, NULL, NULL, NULL, NULL, NULL
),

-- p4: single — Montréal preserved as UTF-8
(
  'q-capital-cities', 4, 'single',
  'Which city is the capital of Canada?',
  'Queen Victoria selected Ottawa in 1857 as a defensible middle ground.',
  NULL,
  '[{"id":"a","label":"Toronto"},{"id":"b","label":"Ottawa"},{"id":"c","label":"Montréal"},{"id":"d","label":"Vancouver"}]',
  'b', NULL, NULL,
  NULL, NULL, NULL, NULL, NULL, NULL
),

-- p5: multiple
(
  'q-capital-cities', 5, 'multiple',
  'Which of these are national capitals?',
  'Morocco''s capital is Rabat, not Casablanca.',
  NULL,
  '[{"id":"a","label":"Naypyidaw"},{"id":"b","label":"Casablanca"},{"id":"c","label":"Yamoussoukro"},{"id":"d","label":"Wellington"}]',
  NULL, ARRAY['a','c','d'], NULL,
  NULL, NULL, NULL, NULL, NULL, NULL
),

-- p6: map — Africa board, answer_id goes in answer_id column (not regions JSON)
(
  'q-capital-cities', 6, 'map',
  'Pin the approximate position of Nairobi.',
  'Nairobi sits in East Africa, just south of the equator at 1,795 m elevation.',
  NULL,
  NULL, 'c', NULL, NULL,
  '[{"id":"a","label":"Dakar","x":12,"y":42},{"id":"b","label":"Cairo","x":62,"y":16},{"id":"c","label":"Nairobi","x":70,"y":60},{"id":"d","label":"Cape Town","x":48,"y":90}]',
  'map-africa', NULL, NULL, NULL, NULL
),

-- p7: single — Bogotá preserved as UTF-8
(
  'q-capital-cities', 7, 'single',
  'Which is the highest capital city in the world by elevation?',
  'La Paz''s administrative seat sits above 3,600 m.',
  NULL,
  '[{"id":"a","label":"Quito"},{"id":"b","label":"Bogotá"},{"id":"c","label":"La Paz"},{"id":"d","label":"Thimphu"}]',
  'c', NULL, NULL,
  NULL, NULL, NULL, NULL, NULL, NULL
),

-- p8: boolean
(
  'q-capital-cities', 8, 'boolean',
  'Brasília became the capital of Brazil only in 1960.',
  'It replaced Rio de Janeiro as part of a push to develop the interior.',
  NULL,
  NULL, NULL, NULL, true,
  NULL, NULL, NULL, NULL, NULL, NULL
),

-- p9: single — Türkiye preserved as UTF-8
(
  'q-capital-cities', 9, 'single',
  'What is the capital of Türkiye?',
  'Ankara has been the capital since 1923, though Istanbul is larger.',
  NULL,
  '[{"id":"a","label":"Istanbul"},{"id":"b","label":"Izmir"},{"id":"c","label":"Ankara"},{"id":"d","label":"Bursa"}]',
  'c', NULL, NULL,
  NULL, NULL, NULL, NULL, NULL, NULL
),

-- p10: typed
(
  'q-capital-cities', 10, 'typed',
  'Name the capital of New Zealand.',
  'Wellington is the southernmost capital of any sovereign state.',
  NULL,
  NULL, NULL, NULL, NULL,
  NULL, NULL, ARRAY['wellington'], 'Type a city', NULL, NULL
)

on conflict (quiz_id, position) do nothing;


-- ─── q-pin-the-place (10 questions) ──────────────────────────────────────────

insert into public.quiz_questions (
  quiz_id, position, type, prompt, explanation, media,
  options, answer_id, answer_ids, answer_bool,
  regions, board_art, accepted, placeholder, items, targets
)
values

-- m1: map — Europe board
(
  'q-pin-the-place', 1, 'map',
  'Pin the Strait of Gibraltar.',
  'A 13 km gap between Spain and Morocco linking the Atlantic to the Mediterranean.',
  NULL,
  NULL, 'a', NULL, NULL,
  '[{"id":"a","label":"Strait of Gibraltar","x":18,"y":78},{"id":"b","label":"Bosphorus","x":74,"y":66},{"id":"c","label":"Øresund","x":48,"y":20},{"id":"d","label":"English Channel","x":30,"y":34}]',
  'map-europe', NULL, NULL, NULL, NULL
),

-- m2: map — Oceania board
(
  'q-pin-the-place', 2, 'map',
  'Pin the Great Barrier Reef.',
  'It runs 2,300 km along Queensland''s north-east coast.',
  NULL,
  NULL, 'b', NULL, NULL,
  '[{"id":"a","label":"Perth coast","x":14,"y":62},{"id":"b","label":"Great Barrier Reef","x":74,"y":30},{"id":"c","label":"Tasmania","x":66,"y":90},{"id":"d","label":"Gulf of Carpentaria","x":56,"y":14}]',
  'map-oceania', NULL, NULL, NULL, NULL
),

-- m3: single — media map art
(
  'q-pin-the-place', 3, 'single',
  'Which projection famously exaggerates the size of Greenland?',
  'Mercator preserves angles, so area distorts sharply toward the poles.',
  '{"kind":"map","art":"projection","caption":"A rectangular world grid"}',
  '[{"id":"a","label":"Mercator"},{"id":"b","label":"Robinson"},{"id":"c","label":"Winkel tripel"},{"id":"d","label":"Mollweide"}]',
  'a', NULL, NULL,
  NULL, NULL, NULL, NULL, NULL, NULL
),

-- m4: boolean
(
  'q-pin-the-place', 4, 'boolean',
  'Lines of longitude converge at the poles.',
  'Meridians meet at both poles; parallels never meet.',
  NULL,
  NULL, NULL, NULL, true,
  NULL, NULL, NULL, NULL, NULL, NULL
),

-- m5: map — South America board
(
  'q-pin-the-place', 5, 'map',
  'Pin the Amazon Basin.',
  'The basin drains roughly 7 million km² across nine countries.',
  NULL,
  NULL, 'b', NULL, NULL,
  '[{"id":"a","label":"Atacama","x":26,"y":62},{"id":"b","label":"Amazon Basin","x":56,"y":28},{"id":"c","label":"Patagonia","x":38,"y":88},{"id":"d","label":"Pampas","x":44,"y":72}]',
  'map-samerica', NULL, NULL, NULL, NULL
),

-- m6: typed — two accepted answers
(
  'q-pin-the-place', 6, 'typed',
  'What is the 0° line of longitude called?',
  'The Prime Meridian runs through Greenwich, London.',
  NULL,
  NULL, NULL, NULL, NULL,
  NULL, NULL, ARRAY['prime meridian','greenwich meridian'], 'Type your answer', NULL, NULL
),

-- m7: single — Unicode ellipsis in prompt preserved
(
  'q-pin-the-place', 7, 'single',
  'A contour line on a topographic map joins points of equal…',
  'Closely spaced contours indicate steep ground.',
  NULL,
  '[{"id":"a","label":"Elevation"},{"id":"b","label":"Temperature"},{"id":"c","label":"Rainfall"},{"id":"d","label":"Pressure"}]',
  'a', NULL, NULL,
  NULL, NULL, NULL, NULL, NULL, NULL
),

-- m8: multiple — long option labels with colons preserved
(
  'q-pin-the-place', 8, 'multiple',
  'Which of these are true of a 1:25,000 map?',
  'Larger scale means more detail over less ground.',
  NULL,
  '[{"id":"a","label":"1 cm on the map is 250 m on the ground"},{"id":"b","label":"It is a larger scale than 1:250,000"},{"id":"c","label":"It covers more area than 1:250,000 on the same sheet"},{"id":"d","label":"It shows more detail than 1:250,000"}]',
  NULL, ARRAY['a','b','d'], NULL,
  NULL, NULL, NULL, NULL, NULL, NULL
),

-- m9: map — Asia board
(
  'q-pin-the-place', 9, 'map',
  'Pin the Himalaya range.',
  'The range arcs 2,400 km across five countries.',
  NULL,
  NULL, 'b', NULL, NULL,
  '[{"id":"a","label":"Ural Mountains","x":22,"y":22},{"id":"b","label":"Himalaya","x":46,"y":60},{"id":"c","label":"Japanese archipelago","x":84,"y":44},{"id":"d","label":"Arabian Peninsula","x":16,"y":68}]',
  'map-asia', NULL, NULL, NULL, NULL
),

-- m10: boolean
(
  'q-pin-the-place', 10, 'boolean',
  'On most modern maps, north is oriented to the top of the sheet.',
  'A convention, not a rule — medieval maps often placed east at the top.',
  NULL,
  NULL, NULL, NULL, true,
  NULL, NULL, NULL, NULL, NULL, NULL
)

on conflict (quiz_id, position) do nothing;


-- ─── q-monuments (10 questions) ──────────────────────────────────────────────

insert into public.quiz_questions (
  quiz_id, position, type, prompt, explanation, media,
  options, answer_id, answer_ids, answer_bool,
  regions, board_art, accepted, placeholder, items, targets
)
values

-- l1: single — media image art
(
  'q-monuments', 1, 'single',
  'In which country would you find Machu Picchu?',
  'The 15th-century Inca citadel sits 2,430 m above sea level in Peru.',
  '{"kind":"image","art":"machu","caption":"Terraced stonework on a ridge"}',
  '[{"id":"a","label":"Bolivia"},{"id":"b","label":"Peru"},{"id":"c","label":"Ecuador"},{"id":"d","label":"Chile"}]',
  'b', NULL, NULL,
  NULL, NULL, NULL, NULL, NULL, NULL
),

-- l2: image — landmark tiles with art (no glyph for landmarks)
(
  'q-monuments', 2, 'image',
  'Select the landmark that stands in Agra, India.',
  'Commissioned by Shah Jahan in 1632 as a mausoleum for Mumtaz Mahal.',
  NULL,
  '[{"id":"a","label":"Taj Mahal","art":"taj"},{"id":"b","label":"Angkor Wat","art":"angkor"},{"id":"c","label":"Borobudur","art":"borobudur"},{"id":"d","label":"Petra","art":"petra"}]',
  'a', NULL, NULL,
  NULL, NULL, NULL, NULL, NULL, NULL
),

-- l3: boolean — answer is FALSE (not true)
(
  'q-monuments', 3, 'boolean',
  'The Great Wall of China is a single continuous wall.',
  'It is a network of walls and fortifications built across many dynasties.',
  NULL,
  NULL, NULL, NULL, false,
  NULL, NULL, NULL, NULL, NULL, NULL
),

-- l4: typed
(
  'q-monuments', 4, 'typed',
  'Name the ancient rock-cut city in southern Jordan.',
  'Petra was the Nabataean capital, carved into rose-coloured sandstone.',
  NULL,
  NULL, NULL, NULL, NULL,
  NULL, NULL, ARRAY['petra'], 'Type a landmark', NULL, NULL
),

-- l5: single
(
  'q-monuments', 5, 'single',
  'Which city is home to the Sagrada Família?',
  'Gaudí''s basilica has been under construction in Barcelona since 1882.',
  NULL,
  '[{"id":"a","label":"Madrid"},{"id":"b","label":"Lisbon"},{"id":"c","label":"Barcelona"},{"id":"d","label":"Valencia"}]',
  'c', NULL, NULL,
  NULL, NULL, NULL, NULL, NULL, NULL
),

-- l6: multiple — Chichén Itzá preserved as UTF-8 in JSONB
(
  'q-monuments', 6, 'multiple',
  'Which of these landmarks are in Africa?',
  'Chichén Itzá is on Mexico''s Yucatán Peninsula.',
  NULL,
  '[{"id":"a","label":"Pyramids of Giza"},{"id":"b","label":"Victoria Falls"},{"id":"c","label":"Chichén Itzá"},{"id":"d","label":"Lalibela rock churches"}]',
  NULL, ARRAY['a','b','d'], NULL,
  NULL, NULL, NULL, NULL, NULL, NULL
),

-- l7: single — media image art; São Paulo, Rio de Janeiro preserved as UTF-8
(
  'q-monuments', 7, 'single',
  'The Christ the Redeemer statue overlooks which city?',
  'It stands 30 m tall atop Corcovado above Rio de Janeiro.',
  '{"kind":"image","art":"redeemer","caption":"An outstretched figure above a bay"}',
  '[{"id":"a","label":"São Paulo"},{"id":"b","label":"Rio de Janeiro"},{"id":"c","label":"Salvador"},{"id":"d","label":"Buenos Aires"}]',
  'b', NULL, NULL,
  NULL, NULL, NULL, NULL, NULL, NULL
),

-- l8: boolean
(
  'q-monuments', 8, 'boolean',
  'The Colosseum in Rome could hold more than 50,000 spectators.',
  'Estimates run from 50,000 to 80,000 at capacity.',
  NULL,
  NULL, NULL, NULL, true,
  NULL, NULL, NULL, NULL, NULL, NULL
),

-- l9: map — Africa board
(
  'q-monuments', 9, 'map',
  'Pin the location of the Pyramids of Giza.',
  'The plateau sits on the west bank of the Nile, on Cairo''s edge.',
  NULL,
  NULL, 'b', NULL, NULL,
  '[{"id":"a","label":"Marrakesh","x":12,"y":22},{"id":"b","label":"Giza","x":60,"y":16},{"id":"c","label":"Lagos","x":26,"y":56},{"id":"d","label":"Zanzibar","x":72,"y":66}]',
  'map-africa', NULL, NULL, NULL, NULL
),

-- l10: single
(
  'q-monuments', 10, 'single',
  'Which landmark is the tallest structure in the world?',
  'The Burj Khalifa reaches 828 m in Dubai.',
  NULL,
  '[{"id":"a","label":"Shanghai Tower"},{"id":"b","label":"Burj Khalifa"},{"id":"c","label":"Merdeka 118"},{"id":"d","label":"Tokyo Skytree"}]',
  'b', NULL, NULL,
  NULL, NULL, NULL, NULL, NULL, NULL
)

on conflict (quiz_id, position) do nothing;


-- =============================================================================
-- 3. FK SAFETY CHECK — verify quiz_attempts compatibility
--
-- Before adding the FK, ensure every quiz_id value in the existing
-- quiz_attempts table has a matching row in the just-seeded quizzes table.
--
-- If any mismatch is found, this DO block raises an exception and the entire
-- migration is halted. No attempt records are touched either way.
-- =============================================================================

do $$
declare
  v_unmatched_count integer;
  v_unmatched_ids   text;
begin
  select count(*) into v_unmatched_count
  from (
    select distinct a.quiz_id
    from   public.quiz_attempts a
    where  not exists (
      select 1 from public.quizzes q where q.id = a.quiz_id
    )
  ) mismatches;

  if v_unmatched_count > 0 then
    select string_agg(distinct a.quiz_id, ', ' order by a.quiz_id)
    into   v_unmatched_ids
    from   public.quiz_attempts a
    where  not exists (
      select 1 from public.quizzes q where q.id = a.quiz_id
    );

    raise exception
      'Phase 3A Step 2 halted: % quiz_id value(s) in quiz_attempts have '
      'no matching row in public.quizzes — [%]. '
      'Seed the missing quiz(zes) before adding the FK. '
      'No attempt records have been modified.',
      v_unmatched_count, v_unmatched_ids;
  end if;

  -- All quiz_ids in quiz_attempts match seeded quizzes. Log it.
  raise notice 'FK safety check passed — all quiz_attempts.quiz_id values accounted for.';
end;
$$;


-- =============================================================================
-- 4. Add FK: quiz_attempts.quiz_id → quizzes.id
--
-- ON DELETE RESTRICT prevents deleting a quiz that has attempt history,
-- protecting the integrity of all Phase 2C progression records.
--
-- Wrapped in an idempotency guard (IF NOT EXISTS) so re-running is safe.
-- =============================================================================

do $$ begin
  if not exists (
    select 1
    from   pg_constraint
    where  conname    = 'quiz_attempts_quiz_id_fkey'
      and  conrelid   = 'public.quiz_attempts'::regclass
  ) then
    alter table public.quiz_attempts
      add constraint quiz_attempts_quiz_id_fkey
      foreign key (quiz_id)
      references public.quizzes(id)
      on delete restrict;
  end if;
end $$;
