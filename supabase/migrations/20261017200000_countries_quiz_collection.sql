-- =============================================================================
-- Countries collection: 24 new published quizzes + 240 questions.
-- Atlas Sprint (q-atlas-sprint) is already seeded and is intentionally omitted.
--
-- Idempotency:
--   quizzes: ON CONFLICT (id) DO NOTHING
--   quiz_questions: ON CONFLICT (quiz_id, position) DO NOTHING
-- Does not modify quiz_attempts, user_progression, or existing Atlas Sprint rows.
-- =============================================================================

insert into public.quizzes (
  id, title, description, category_id, creator, art,
  difficulty, minutes, language, reward_xp, reward_credits, is_published
)
values
  (
    'q-passport-to-the-planet',
    'Passport to the Planet',
    'A beginner circuit through national symbols, simple country facts, and the places that appear on a first passport stamp.',
    'countries', 'GEOverze Studio', 'countries',
    'Easy', 6, 'English', 240, 60, true
  ),
  (
    'q-flag-frenzy',
    'Flag Frenzy',
    'Learn the colours, crosses, and emblems that make national flags easy to tell apart.',
    'countries', 'GEOverze Studio', 'countries',
    'Easy', 6, 'English', 240, 60, true
  ),
  (
    'q-country-shape-safari',
    'Country Shape Safari',
    'Train your eye on the outlines and positions that make countries recognizable on a blank map.',
    'countries', 'GEOverze Studio', 'countries',
    'Easy', 6, 'English', 240, 60, true
  ),
  (
    'q-capitals-made-easy',
    'Capitals Made Easy',
    'Match well-known countries with the capitals learners meet first — no trick cities, just solid pairs.',
    'countries', 'GEOverze Studio', 'countries',
    'Easy', 6, 'English', 240, 60, true
  ),
  (
    'q-around-the-world-in-10',
    'Around the World in 10',
    'A mixed starter tour: one continent hop after another through countries, capitals, flags, and locations.',
    'countries', 'GEOverze Studio', 'countries',
    'Easy', 6, 'English', 240, 60, true
  ),
  (
    'q-island-hopping',
    'Island Hopping',
    'Visit island nations and archipelagos — from the Caribbean to the Pacific and the Indian Ocean.',
    'countries', 'GEOverze Studio', 'countries',
    'Easy', 6, 'English', 240, 60, true
  ),
  (
    'q-border-detectives',
    'Border Detectives',
    'Practise straightforward neighbour pairs and the seas that sit between countries.',
    'countries', 'GEOverze Studio', 'countries',
    'Easy', 6, 'English', 240, 60, true
  ),
  (
    'q-guess-the-country',
    'Guess the Country',
    'Use a handful of clear clues — food, wildlife, language, or location — to name the country.',
    'countries', 'GEOverze Studio', 'countries',
    'Easy', 6, 'English', 240, 60, true
  ),
  (
    'q-national-wonders',
    'National Wonders',
    'Connect famous natural landmarks to the countries that protect and claim them.',
    'countries', 'GEOverze Studio', 'countries',
    'Easy', 6, 'English', 240, 60, true
  ),
  (
    'q-seven-continents-challenge',
    'The Seven Continents Challenge',
    'Place countries on the right continent and spot the odd region out.',
    'countries', 'GEOverze Studio', 'countries',
    'Easy', 6, 'English', 240, 60, true
  ),
  (
    'q-country-or-not',
    'Country or Not?',
    'Tell sovereign countries apart from cities, territories, and regions that only sound like countries.',
    'countries', 'GEOverze Studio', 'countries',
    'Easy', 6, 'English', 240, 60, true
  ),
  (
    'q-rivers-lakes-nations',
    'Rivers, Lakes & Nations',
    'Follow famous rivers and lakes to the countries they flow through or sit beside.',
    'countries', 'GEOverze Studio', 'countries',
    'Easy', 6, 'English', 240, 60, true
  ),
  (
    'q-world-neighbourhood',
    'The World Neighbourhood',
    'Learn who lives next door: land neighbours, surrounding seas, and nearby island partners.',
    'countries', 'GEOverze Studio', 'countries',
    'Easy', 6, 'English', 240, 60, true
  ),
  (
    'q-famous-places-famous-countries',
    'Famous Places, Famous Countries',
    'Match monuments and famous sites to the countries that hold them.',
    'countries', 'GEOverze Studio', 'countries',
    'Easy', 6, 'English', 240, 60, true
  ),
  (
    'q-world-geography-warmup',
    'World Geography Warm-Up',
    'A mixed easy set to lock in countries, capitals, flags, continents, and simple borders.',
    'countries', 'GEOverze Studio', 'countries',
    'Easy', 6, 'English', 240, 60, true
  ),
  (
    'q-borderline-genius',
    'Borderline Genius',
    'Work through trickier neighbour sets, triple points, and countries that almost surround their neighbours.',
    'countries', 'GEOverze Studio', 'countries',
    'Medium', 7, 'English', 320, 80, true
  ),
  (
    'q-countries-capital-confusion',
    'Capital Confusion',
    'Look past the biggest city. These capitals are planned, shared, or simply not the place most travellers name first.',
    'countries', 'GEOverze Studio', 'countries',
    'Medium', 7, 'English', 320, 80, true
  ),
  (
    'q-flags-beyond-the-obvious',
    'Flags Beyond the Obvious',
    'Separate lookalike banners and read the small emblems that tell similar flags apart.',
    'countries', 'GEOverze Studio', 'countries',
    'Medium', 7, 'English', 320, 80, true
  ),
  (
    'q-global-explorers-trial',
    'The Global Explorer''s Trial',
    'An intermediate mixed paper: islands, inland seas, tricky borders, and country clues that need more than one fact.',
    'countries', 'GEOverze Studio', 'countries',
    'Medium', 7, 'English', 320, 80, true
  ),
  (
    'q-cartographers-gauntlet',
    'Cartographer''s Gauntlet',
    'Read awkward outlines, exclaves, and positions that only make sense when you keep the whole map in your head.',
    'countries', 'GEOverze Studio', 'countries',
    'Hard', 8, 'English', 400, 100, true
  ),
  (
    'q-enclave-enigma',
    'The Enclave Enigma',
    'Study countries inside countries, coastal slivers, and territories that do not touch the state they belong to.',
    'countries', 'GEOverze Studio', 'countries',
    'Hard', 8, 'English', 400, 100, true
  ),
  (
    'q-microstate-mastermind',
    'Microstate Mastermind',
    'Tiny sovereign states: their capitals, neighbours, and the facts that keep them from blending together.',
    'countries', 'GEOverze Studio', 'countries',
    'Hard', 8, 'English', 400, 100, true
  ),
  (
    'q-latitude-longitude-elite',
    'Latitude & Longitude Elite',
    'Use hemispheres and approximate coordinates to place countries — no fake precision, just defensible positions.',
    'countries', 'GEOverze Studio', 'countries',
    'Hard', 8, 'English', 400, 100, true
  ),
  (
    'q-the-final-atlas',
    'The Final Atlas',
    'A last mixed paper: microstates, less obvious capitals, awkward borders, and positions serious atlas readers should know.',
    'countries', 'GEOverze Studio', 'countries',
    'Hard', 8, 'English', 400, 100, true
  )
on conflict (id) do nothing;

-- ─── q-passport-to-the-planet (10 questions) ─────────────────────────────────────────
insert into public.quiz_questions (
  quiz_id, position, type, prompt, explanation, media,
  options, answer_id, answer_ids, answer_bool,
  regions, board_art, accepted, placeholder, items, targets
)
values
(
  'q-passport-to-the-planet', 1, 'single',
  'Which country is widely known for the maple leaf as a national emblem?',
  'Canada adopted the maple leaf as its official emblem on the 1965 flag.',
  NULL,
  '[{"id":"a","label":"Mexico"},{"id":"b","label":"Canada"},{"id":"c","label":"Switzerland"},{"id":"d","label":"Lebanon"}]',
  'b', NULL, NULL,
  NULL, NULL, NULL, NULL, NULL, NULL
),
(
  'q-passport-to-the-planet', 2, 'boolean',
  'Kenya is a country on the continent of Africa.',
  'Kenya lies in East Africa on the Indian Ocean.',
  NULL,
  NULL,
  NULL, NULL, true,
  NULL, NULL, NULL, NULL, NULL, NULL
),
(
  'q-passport-to-the-planet', 3, 'single',
  'The kangaroo is a famous national animal of which country?',
  'Kangaroos are native marsupials and a long-standing Australian national symbol.',
  NULL,
  '[{"id":"a","label":"South Africa"},{"id":"b","label":"India"},{"id":"c","label":"Australia"},{"id":"d","label":"Argentina"}]',
  'c', NULL, NULL,
  NULL, NULL, NULL, NULL, NULL, NULL
),
(
  'q-passport-to-the-planet', 4, 'typed',
  'Name the country where Mount Fuji stands.',
  'Mount Fuji is Japan''s highest peak and a national symbol.',
  NULL,
  NULL,
  NULL, NULL, NULL,
  NULL, NULL, ARRAY['japan'], 'Type your answer', NULL, NULL
),
(
  'q-passport-to-the-planet', 5, 'multiple',
  'Which of these countries use Spanish as an official language?',
  'Spanish is official in Mexico and Argentina. Brazil''s official language is Portuguese; Angola''s is Portuguese.',
  NULL,
  '[{"id":"a","label":"Mexico"},{"id":"b","label":"Brazil"},{"id":"c","label":"Argentina"},{"id":"d","label":"Angola"}]',
  NULL, ARRAY['a','c'], NULL,
  NULL, NULL, NULL, NULL, NULL, NULL
),
(
  'q-passport-to-the-planet', 6, 'single',
  'Table Mountain overlooks a major city in which country?',
  'Table Mountain rises above Cape Town in South Africa.',
  NULL,
  '[{"id":"a","label":"Morocco"},{"id":"b","label":"South Africa"},{"id":"c","label":"Chile"},{"id":"d","label":"New Zealand"}]',
  'b', NULL, NULL,
  NULL, NULL, NULL, NULL, NULL, NULL
),
(
  'q-passport-to-the-planet', 7, 'boolean',
  'Brazil is located in South America.',
  'Brazil occupies a large share of eastern South America.',
  NULL,
  NULL,
  NULL, NULL, true,
  NULL, NULL, NULL, NULL, NULL, NULL
),
(
  'q-passport-to-the-planet', 8, 'single',
  'Cherry blossoms are a celebrated seasonal symbol of which country?',
  'Hanami cherry-blossom viewing is a famous Japanese tradition.',
  NULL,
  '[{"id":"a","label":"South Korea"},{"id":"b","label":"China"},{"id":"c","label":"Japan"},{"id":"d","label":"Vietnam"}]',
  'c', NULL, NULL,
  NULL, NULL, NULL, NULL, NULL, NULL
),
(
  'q-passport-to-the-planet', 9, 'single',
  'The kiwi bird is a national emblem of which country?',
  'The flightless kiwi is unique to New Zealand and appears on coins and emblems.',
  NULL,
  '[{"id":"a","label":"Australia"},{"id":"b","label":"New Zealand"},{"id":"c","label":"Papua New Guinea"},{"id":"d","label":"Fiji"}]',
  'b', NULL, NULL,
  NULL, NULL, NULL, NULL, NULL, NULL
),
(
  'q-passport-to-the-planet', 10, 'typed',
  'Which country is home to the Great Pyramid of Giza?',
  'The Giza pyramid complex stands on the Giza Plateau in Egypt.',
  NULL,
  NULL,
  NULL, NULL, NULL,
  NULL, NULL, ARRAY['egypt'], 'Type your answer', NULL, NULL
)
on conflict (quiz_id, position) do nothing;

-- ─── q-flag-frenzy (10 questions) ─────────────────────────────────────────
insert into public.quiz_questions (
  quiz_id, position, type, prompt, explanation, media,
  options, answer_id, answer_ids, answer_bool,
  regions, board_art, accepted, placeholder, items, targets
)
values
(
  'q-flag-frenzy', 1, 'image',
  'Which country flies this flag?',
  'Canada''s flag is a red maple leaf between two red bars on white.',
  '{"kind":"flag","glyph":"🇨🇦","caption":"A red maple leaf on white with red bars"}',
  '[{"id":"a","label":"Switzerland","glyph":"🇨🇭"},{"id":"b","label":"Canada","glyph":"🇨🇦"},{"id":"c","label":"Peru","glyph":"🇵🇪"},{"id":"d","label":"Austria","glyph":"🇦🇹"}]',
  'b', NULL, NULL,
  NULL, NULL, NULL, NULL, NULL, NULL
),
(
  'q-flag-frenzy', 2, 'single',
  'A white cross on a red square field is the flag of which country?',
  'Switzerland''s square civil flag is a bold white cross on red.',
  NULL,
  '[{"id":"a","label":"Denmark"},{"id":"b","label":"Switzerland"},{"id":"c","label":"Georgia"},{"id":"d","label":"Tonga"}]',
  'b', NULL, NULL,
  NULL, NULL, NULL, NULL, NULL, NULL
),
(
  'q-flag-frenzy', 3, 'boolean',
  'Jamaica''s national flag contains no red, white, or blue.',
  'Jamaica uses gold, green, and black — a rare palette among national flags.',
  NULL,
  NULL,
  NULL, NULL, true,
  NULL, NULL, NULL, NULL, NULL, NULL
),
(
  'q-flag-frenzy', 4, 'image',
  'Select the flag of Ghana.',
  'Ghana''s flag is red, gold, and green with a black star.',
  '{"kind":"flag","glyph":"🇬🇭","caption":"Horizontal tricolour with a black star"}',
  '[{"id":"a","label":"Senegal","glyph":"🇸🇳"},{"id":"b","label":"Ghana","glyph":"🇬🇭"},{"id":"c","label":"Cameroon","glyph":"🇨🇲"},{"id":"d","label":"Guinea","glyph":"🇬🇳"}]',
  'b', NULL, NULL,
  NULL, NULL, NULL, NULL, NULL, NULL
),
(
  'q-flag-frenzy', 5, 'multiple',
  'Which flags include a Nordic cross?',
  'Sweden and Norway use the offset Nordic cross. Italy and Japan do not.',
  NULL,
  '[{"id":"a","label":"Sweden"},{"id":"b","label":"Italy"},{"id":"c","label":"Norway"},{"id":"d","label":"Japan"}]',
  NULL, ARRAY['a','c'], NULL,
  NULL, NULL, NULL, NULL, NULL, NULL
),
(
  'q-flag-frenzy', 6, 'single',
  'A green field with a red maple is not a national flag. Which country actually uses a cedar tree?',
  'Lebanon''s flag places a green cedar between red stripes.',
  NULL,
  '[{"id":"a","label":"Canada"},{"id":"b","label":"Lebanon"},{"id":"c","label":"Cyprus"},{"id":"d","label":"Norfolk Island"}]',
  'b', NULL, NULL,
  NULL, NULL, NULL, NULL, NULL, NULL
),
(
  'q-flag-frenzy', 7, 'typed',
  'Name the country whose current flag is a plain red circle on white.',
  'Japan''s Nisshōki is a crimson disc centred on a white field.',
  NULL,
  NULL,
  NULL, NULL, NULL,
  NULL, NULL, ARRAY['japan'], 'Type your answer', NULL, NULL
),
(
  'q-flag-frenzy', 8, 'boolean',
  'The flag of Botswana features a black stripe edged in white on a light-blue field.',
  'Botswana''s design represents rain, racial cooperation, and the black stripe of its people.',
  NULL,
  NULL,
  NULL, NULL, true,
  NULL, NULL, NULL, NULL, NULL, NULL
),
(
  'q-flag-frenzy', 9, 'single',
  'Which South American flag is a sun-face on a white-blue triband?',
  'Argentina''s Sol de Mayo sits on the white stripe between two light-blue bands.',
  NULL,
  '[{"id":"a","label":"Uruguay"},{"id":"b","label":"Argentina"},{"id":"c","label":"Paraguay"},{"id":"d","label":"Chile"}]',
  'b', NULL, NULL,
  NULL, NULL, NULL, NULL, NULL, NULL
),
(
  'q-flag-frenzy', 10, 'image',
  'Which of these is the flag of India?',
  'India''s flag is saffron, white, and green with a navy Ashoka Chakra.',
  '{"kind":"flag","glyph":"🇮🇳","caption":"Saffron-white-green tricolour"}',
  '[{"id":"a","label":"Ireland","glyph":"🇮🇪"},{"id":"b","label":"India","glyph":"🇮🇳"},{"id":"c","label":"Niger","glyph":"🇳🇪"},{"id":"d","label":"Côte d''Ivoire","glyph":"🇨🇮"}]',
  'b', NULL, NULL,
  NULL, NULL, NULL, NULL, NULL, NULL
)
on conflict (quiz_id, position) do nothing;

-- ─── q-country-shape-safari (10 questions) ─────────────────────────────────────────
insert into public.quiz_questions (
  quiz_id, position, type, prompt, explanation, media,
  options, answer_id, answer_ids, answer_bool,
  regions, board_art, accepted, placeholder, items, targets
)
values
(
  'q-country-shape-safari', 1, 'single',
  'Which country is famous for a long, narrow north–south strip along the Pacific?',
  'Chile follows the Andes for thousands of kilometres with a thin coastal plain.',
  NULL,
  '[{"id":"a","label":"Italy"},{"id":"b","label":"Vietnam"},{"id":"c","label":"Chile"},{"id":"d","label":"Norway"}]',
  'c', NULL, NULL,
  NULL, NULL, NULL, NULL, NULL, NULL
),
(
  'q-country-shape-safari', 2, 'single',
  'Which country''s mainland outline is often compared to a high-heeled boot?',
  'Italy’s peninsula and the islands of Sicily and Sardinia form the classic boot.',
  NULL,
  '[{"id":"a","label":"Greece"},{"id":"b","label":"Italy"},{"id":"c","label":"Portugal"},{"id":"d","label":"Croatia"}]',
  'b', NULL, NULL,
  NULL, NULL, NULL, NULL, NULL, NULL
),
(
  'q-country-shape-safari', 3, 'boolean',
  'Madagascar is an island country off the southeast coast of Africa.',
  'Madagascar lies in the Indian Ocean, separated from Mozambique by the Mozambique Channel.',
  NULL,
  NULL,
  NULL, NULL, true,
  NULL, NULL, NULL, NULL, NULL, NULL
),
(
  'q-country-shape-safari', 4, 'single',
  'Which large country occupies most of the land north of the contiguous United States?',
  'Canada shares the world''s longest international land border with the United States.',
  NULL,
  '[{"id":"a","label":"Greenland"},{"id":"b","label":"Canada"},{"id":"c","label":"Russia"},{"id":"d","label":"Alaska"}]',
  'b', NULL, NULL,
  NULL, NULL, NULL, NULL, NULL, NULL
),
(
  'q-country-shape-safari', 5, 'typed',
  'Name the country that occupies the entire Australian continent.',
  'Australia is the only country that is also a continental landmass.',
  NULL,
  NULL,
  NULL, NULL, NULL,
  NULL, NULL, ARRAY['australia'], 'Type your answer', NULL, NULL
),
(
  'q-country-shape-safari', 6, 'single',
  'Which African country has a distinctive horn-shaped peninsula on the Indian Ocean?',
  'Somalia occupies the Horn of Africa.',
  NULL,
  '[{"id":"a","label":"Somalia"},{"id":"b","label":"Yemen"},{"id":"c","label":"Oman"},{"id":"d","label":"Eritrea"}]',
  'a', NULL, NULL,
  NULL, NULL, NULL, NULL, NULL, NULL
),
(
  'q-country-shape-safari', 7, 'multiple',
  'Which of these countries are islands or archipelagos with no land border?',
  'Japan and New Zealand are island states. Denmark and Malaysia have mainland territory with land borders.',
  NULL,
  '[{"id":"a","label":"Japan"},{"id":"b","label":"Denmark"},{"id":"c","label":"New Zealand"},{"id":"d","label":"Malaysia"}]',
  NULL, ARRAY['a','c'], NULL,
  NULL, NULL, NULL, NULL, NULL, NULL
),
(
  'q-country-shape-safari', 8, 'single',
  'The outline of India is often described as a peninsula pointing toward which ocean?',
  'The Indian Peninsula tapers south into the Indian Ocean.',
  NULL,
  '[{"id":"a","label":"Atlantic Ocean"},{"id":"b","label":"Arctic Ocean"},{"id":"c","label":"Indian Ocean"},{"id":"d","label":"Pacific Ocean"}]',
  'c', NULL, NULL,
  NULL, NULL, NULL, NULL, NULL, NULL
),
(
  'q-country-shape-safari', 9, 'boolean',
  'The United Kingdom is separated from mainland Europe by water.',
  'The English Channel and North Sea separate Great Britain from the European mainland.',
  NULL,
  NULL,
  NULL, NULL, true,
  NULL, NULL, NULL, NULL, NULL, NULL
),
(
  'q-country-shape-safari', 10, 'single',
  'Which country forms most of the Iberian Peninsula together with Spain?',
  'Portugal occupies the western Atlantic side of the Iberian Peninsula.',
  NULL,
  '[{"id":"a","label":"France"},{"id":"b","label":"Portugal"},{"id":"c","label":"Morocco"},{"id":"d","label":"Andorra"}]',
  'b', NULL, NULL,
  NULL, NULL, NULL, NULL, NULL, NULL
)
on conflict (quiz_id, position) do nothing;

-- ─── q-capitals-made-easy (10 questions) ─────────────────────────────────────────
insert into public.quiz_questions (
  quiz_id, position, type, prompt, explanation, media,
  options, answer_id, answer_ids, answer_bool,
  regions, board_art, accepted, placeholder, items, targets
)
values
(
  'q-capitals-made-easy', 1, 'single',
  'What is the capital of France?',
  'Paris has been France''s political capital for centuries.',
  NULL,
  '[{"id":"a","label":"Lyon"},{"id":"b","label":"Marseille"},{"id":"c","label":"Paris"},{"id":"d","label":"Nice"}]',
  'c', NULL, NULL,
  NULL, NULL, NULL, NULL, NULL, NULL
),
(
  'q-capitals-made-easy', 2, 'single',
  'What is the capital of Japan?',
  'Tokyo is Japan''s capital and largest metropolitan area.',
  NULL,
  '[{"id":"a","label":"Osaka"},{"id":"b","label":"Kyoto"},{"id":"c","label":"Tokyo"},{"id":"d","label":"Nagoya"}]',
  'c', NULL, NULL,
  NULL, NULL, NULL, NULL, NULL, NULL
),
(
  'q-capitals-made-easy', 3, 'typed',
  'What is the capital of Kenya?',
  'Nairobi is Kenya''s capital and largest city.',
  NULL,
  NULL,
  NULL, NULL, NULL,
  NULL, NULL, ARRAY['nairobi'], 'Type your answer', NULL, NULL
),
(
  'q-capitals-made-easy', 4, 'single',
  'What is the capital of Canada?',
  'Ottawa, in Ontario, is the federal capital — not Toronto or Montreal.',
  NULL,
  '[{"id":"a","label":"Toronto"},{"id":"b","label":"Ottawa"},{"id":"c","label":"Vancouver"},{"id":"d","label":"Montreal"}]',
  'b', NULL, NULL,
  NULL, NULL, NULL, NULL, NULL, NULL
),
(
  'q-capitals-made-easy', 5, 'boolean',
  'Cairo is the capital of Egypt.',
  'Cairo on the Nile is Egypt''s capital and largest city.',
  NULL,
  NULL,
  NULL, NULL, true,
  NULL, NULL, NULL, NULL, NULL, NULL
),
(
  'q-capitals-made-easy', 6, 'single',
  'What is the capital of Brazil?',
  'Brasília was inaugurated in 1960 as Brazil''s planned inland capital.',
  NULL,
  '[{"id":"a","label":"Rio de Janeiro"},{"id":"b","label":"São Paulo"},{"id":"c","label":"Brasília"},{"id":"d","label":"Salvador"}]',
  'c', NULL, NULL,
  NULL, NULL, NULL, NULL, NULL, NULL
),
(
  'q-capitals-made-easy', 7, 'single',
  'What is the capital of Australia?',
  'Canberra was chosen as a compromise between Sydney and Melbourne.',
  NULL,
  '[{"id":"a","label":"Sydney"},{"id":"b","label":"Melbourne"},{"id":"c","label":"Canberra"},{"id":"d","label":"Perth"}]',
  'c', NULL, NULL,
  NULL, NULL, NULL, NULL, NULL, NULL
),
(
  'q-capitals-made-easy', 8, 'multiple',
  'Which of these cities are national capitals?',
  'Nairobi and Tokyo are capitals. Johannesburg and Istanbul are major cities but not national capitals.',
  NULL,
  '[{"id":"a","label":"Nairobi"},{"id":"b","label":"Johannesburg"},{"id":"c","label":"Tokyo"},{"id":"d","label":"Istanbul"}]',
  NULL, ARRAY['a','c'], NULL,
  NULL, NULL, NULL, NULL, NULL, NULL
),
(
  'q-capitals-made-easy', 9, 'single',
  'What is the capital of India?',
  'New Delhi is the seat of India''s national government.',
  NULL,
  '[{"id":"a","label":"Mumbai"},{"id":"b","label":"Kolkata"},{"id":"c","label":"New Delhi"},{"id":"d","label":"Bengaluru"}]',
  'c', NULL, NULL,
  NULL, NULL, NULL, NULL, NULL, NULL
),
(
  'q-capitals-made-easy', 10, 'typed',
  'What is the capital of Mexico?',
  'Mexico City is Mexico''s capital and one of the world''s largest urban areas.',
  NULL,
  NULL,
  NULL, NULL, NULL,
  NULL, NULL, ARRAY['mexico city','ciudad de mexico','ciudad de méxico'], 'Type your answer', NULL, NULL
)
on conflict (quiz_id, position) do nothing;

-- ─── q-around-the-world-in-10 (10 questions) ─────────────────────────────────────────
insert into public.quiz_questions (
  quiz_id, position, type, prompt, explanation, media,
  options, answer_id, answer_ids, answer_bool,
  regions, board_art, accepted, placeholder, items, targets
)
values
(
  'q-around-the-world-in-10', 1, 'single',
  'Which country is both in Europe and famous for fjords along its west coast?',
  'Norway''s west coast is cut by deep glacial fjords.',
  NULL,
  '[{"id":"a","label":"Sweden"},{"id":"b","label":"Finland"},{"id":"c","label":"Norway"},{"id":"d","label":"Poland"}]',
  'c', NULL, NULL,
  NULL, NULL, NULL, NULL, NULL, NULL
),
(
  'q-around-the-world-in-10', 2, 'image',
  'This flag belongs to which country?',
  'South Korea''s Taegeukgi shows a red-blue taegeuk and four trigrams.',
  '{"kind":"flag","glyph":"🇰🇷","caption":"White field with a red-blue circle"}',
  '[{"id":"a","label":"North Korea"},{"id":"b","label":"South Korea"},{"id":"c","label":"Japan"},{"id":"d","label":"China"}]',
  'b', NULL, NULL,
  NULL, NULL, NULL, NULL, NULL, NULL
),
(
  'q-around-the-world-in-10', 3, 'typed',
  'Name a country whose capital is Accra.',
  'Accra is the capital of Ghana on the Gulf of Guinea.',
  NULL,
  NULL,
  NULL, NULL, NULL,
  NULL, NULL, ARRAY['ghana'], 'Type your answer', NULL, NULL
),
(
  'q-around-the-world-in-10', 4, 'single',
  'Which country is the largest in South America by area?',
  'Brazil is the fifth-largest country on Earth and the largest in South America.',
  NULL,
  '[{"id":"a","label":"Argentina"},{"id":"b","label":"Brazil"},{"id":"c","label":"Peru"},{"id":"d","label":"Colombia"}]',
  'b', NULL, NULL,
  NULL, NULL, NULL, NULL, NULL, NULL
),
(
  'q-around-the-world-in-10', 5, 'boolean',
  'New Zealand is in Oceania.',
  'New Zealand is an island country in the southwestern Pacific, part of Oceania.',
  NULL,
  NULL,
  NULL, NULL, true,
  NULL, NULL, NULL, NULL, NULL, NULL
),
(
  'q-around-the-world-in-10', 6, 'single',
  'Which African country has Lagos as its largest city and Abuja as its capital?',
  'Nigeria moved its capital from Lagos to planned Abuja in 1991.',
  NULL,
  '[{"id":"a","label":"Ghana"},{"id":"b","label":"Nigeria"},{"id":"c","label":"Cameroon"},{"id":"d","label":"Benin"}]',
  'b', NULL, NULL,
  NULL, NULL, NULL, NULL, NULL, NULL
),
(
  'q-around-the-world-in-10', 7, 'multiple',
  'Which countries border the Pacific Ocean?',
  'Chile and Japan have Pacific coasts. Botswana and Hungary are landlocked.',
  NULL,
  '[{"id":"a","label":"Chile"},{"id":"b","label":"Botswana"},{"id":"c","label":"Japan"},{"id":"d","label":"Hungary"}]',
  NULL, ARRAY['a','c'], NULL,
  NULL, NULL, NULL, NULL, NULL, NULL
),
(
  'q-around-the-world-in-10', 8, 'single',
  'The Andes run along the western side of which continent?',
  'The Andes are the principal mountain chain of South America.',
  NULL,
  '[{"id":"a","label":"Africa"},{"id":"b","label":"Asia"},{"id":"c","label":"South America"},{"id":"d","label":"Europe"}]',
  'c', NULL, NULL,
  NULL, NULL, NULL, NULL, NULL, NULL
),
(
  'q-around-the-world-in-10', 9, 'single',
  'Which European country is shaped like a boot in the Mediterranean?',
  'Italy projects into the central Mediterranean.',
  NULL,
  '[{"id":"a","label":"Spain"},{"id":"b","label":"Greece"},{"id":"c","label":"Italy"},{"id":"d","label":"Albania"}]',
  'c', NULL, NULL,
  NULL, NULL, NULL, NULL, NULL, NULL
),
(
  'q-around-the-world-in-10', 10, 'typed',
  'Name the country whose capital is Bangkok.',
  'Bangkok is the capital of Thailand.',
  NULL,
  NULL,
  NULL, NULL, NULL,
  NULL, NULL, ARRAY['thailand'], 'Type your answer', NULL, NULL
)
on conflict (quiz_id, position) do nothing;

-- ─── q-island-hopping (10 questions) ─────────────────────────────────────────
insert into public.quiz_questions (
  quiz_id, position, type, prompt, explanation, media,
  options, answer_id, answer_ids, answer_bool,
  regions, board_art, accepted, placeholder, items, targets
)
values
(
  'q-island-hopping', 1, 'single',
  'Which island country lies southeast of India and is teardrop-shaped?',
  'Sri Lanka lies in the Indian Ocean off India''s southern tip.',
  NULL,
  '[{"id":"a","label":"Maldives"},{"id":"b","label":"Sri Lanka"},{"id":"c","label":"Mauritius"},{"id":"d","label":"Seychelles"}]',
  'b', NULL, NULL,
  NULL, NULL, NULL, NULL, NULL, NULL
),
(
  'q-island-hopping', 2, 'boolean',
  'Cuba is an island country in the Caribbean.',
  'Cuba is the largest island in the Caribbean and a sovereign state.',
  NULL,
  NULL,
  NULL, NULL, true,
  NULL, NULL, NULL, NULL, NULL, NULL
),
(
  'q-island-hopping', 3, 'single',
  'Honolulu is the capital of a U.S. state, not a country. Which Pacific country has Suva as its capital?',
  'Suva is the capital of Fiji.',
  NULL,
  '[{"id":"a","label":"Tonga"},{"id":"b","label":"Samoa"},{"id":"c","label":"Fiji"},{"id":"d","label":"Vanuatu"}]',
  'c', NULL, NULL,
  NULL, NULL, NULL, NULL, NULL, NULL
),
(
  'q-island-hopping', 4, 'typed',
  'Name the island country whose capital is Reykjavík.',
  'Reykjavík is the capital of Iceland.',
  NULL,
  NULL,
  NULL, NULL, NULL,
  NULL, NULL, ARRAY['iceland'], 'Type your answer', NULL, NULL
),
(
  'q-island-hopping', 5, 'single',
  'Which country is an archipelago of more than 7,000 islands in Southeast Asia?',
  'The Philippines is an archipelagic state in the western Pacific.',
  NULL,
  '[{"id":"a","label":"Indonesia"},{"id":"b","label":"Philippines"},{"id":"c","label":"Malaysia"},{"id":"d","label":"Japan"}]',
  'b', NULL, NULL,
  NULL, NULL, NULL, NULL, NULL, NULL
),
(
  'q-island-hopping', 6, 'multiple',
  'Which of these are sovereign island countries?',
  'Jamaica and Malta are sovereign island states. Hawaii is a U.S. state; Sicily is part of Italy.',
  NULL,
  '[{"id":"a","label":"Jamaica"},{"id":"b","label":"Hawaii"},{"id":"c","label":"Malta"},{"id":"d","label":"Sicily"}]',
  NULL, ARRAY['a','c'], NULL,
  NULL, NULL, NULL, NULL, NULL, NULL
),
(
  'q-island-hopping', 7, 'single',
  'Which Indian Ocean country is a chain of low-lying coral atolls?',
  'The Maldives is a chain of atolls southwest of India and Sri Lanka.',
  NULL,
  '[{"id":"a","label":"Sri Lanka"},{"id":"b","label":"Maldives"},{"id":"c","label":"Comoros"},{"id":"d","label":"Madagascar"}]',
  'b', NULL, NULL,
  NULL, NULL, NULL, NULL, NULL, NULL
),
(
  'q-island-hopping', 8, 'boolean',
  'Japan is an island country with no land borders.',
  'Japan''s four main islands and many smaller ones are surrounded by sea.',
  NULL,
  NULL,
  NULL, NULL, true,
  NULL, NULL, NULL, NULL, NULL, NULL
),
(
  'q-island-hopping', 9, 'single',
  'Port-au-Prince is the capital of which Caribbean country?',
  'Port-au-Prince is the capital of Haiti, which shares Hispaniola with the Dominican Republic.',
  NULL,
  '[{"id":"a","label":"Dominican Republic"},{"id":"b","label":"Haiti"},{"id":"c","label":"Jamaica"},{"id":"d","label":"Bahamas"}]',
  'b', NULL, NULL,
  NULL, NULL, NULL, NULL, NULL, NULL
),
(
  'q-island-hopping', 10, 'typed',
  'Name the large island country off Africa''s southeast coast.',
  'Madagascar is the large island east of Mozambique.',
  NULL,
  NULL,
  NULL, NULL, NULL,
  NULL, NULL, ARRAY['madagascar'], 'Type your answer', NULL, NULL
)
on conflict (quiz_id, position) do nothing;

-- ─── q-border-detectives (10 questions) ─────────────────────────────────────────
insert into public.quiz_questions (
  quiz_id, position, type, prompt, explanation, media,
  options, answer_id, answer_ids, answer_bool,
  regions, board_art, accepted, placeholder, items, targets
)
values
(
  'q-border-detectives', 1, 'single',
  'Which country shares a long land border with the United States to the south?',
  'Mexico and the United States share a lengthy land border from the Pacific to the Gulf of Mexico.',
  NULL,
  '[{"id":"a","label":"Canada"},{"id":"b","label":"Mexico"},{"id":"c","label":"Cuba"},{"id":"d","label":"Guatemala"}]',
  'b', NULL, NULL,
  NULL, NULL, NULL, NULL, NULL, NULL
),
(
  'q-border-detectives', 2, 'single',
  'France shares a land border with which of these countries?',
  'France borders Spain across the Pyrenees. Portugal only borders Spain.',
  NULL,
  '[{"id":"a","label":"Portugal"},{"id":"b","label":"Spain"},{"id":"c","label":"Ireland"},{"id":"d","label":"Morocco"}]',
  'b', NULL, NULL,
  NULL, NULL, NULL, NULL, NULL, NULL
),
(
  'q-border-detectives', 3, 'boolean',
  'Kenya and Tanzania share a land border.',
  'The two East African countries meet along a well-known land frontier that includes the Serengeti–Maasai Mara region.',
  NULL,
  NULL,
  NULL, NULL, true,
  NULL, NULL, NULL, NULL, NULL, NULL
),
(
  'q-border-detectives', 4, 'typed',
  'Name one country that shares a land border with Portugal.',
  'Portugal''s only land neighbour is Spain.',
  NULL,
  NULL,
  NULL, NULL, NULL,
  NULL, NULL, ARRAY['spain'], 'Type your answer', NULL, NULL
),
(
  'q-border-detectives', 5, 'single',
  'Which country lies immediately north of South Africa and is landlocked?',
  'Botswana sits north of South Africa, inland from the Namibian and South African coasts.',
  NULL,
  '[{"id":"a","label":"Mozambique"},{"id":"b","label":"Botswana"},{"id":"c","label":"Madagascar"},{"id":"d","label":"Lesotho"}]',
  'b', NULL, NULL,
  NULL, NULL, NULL, NULL, NULL, NULL
),
(
  'q-border-detectives', 6, 'multiple',
  'Which countries share a land border with China?',
  'India and Russia border China. The Philippines and Japan are separated from China by sea.',
  NULL,
  '[{"id":"a","label":"India"},{"id":"b","label":"Philippines"},{"id":"c","label":"Russia"},{"id":"d","label":"Japan"}]',
  NULL, ARRAY['a','c'], NULL,
  NULL, NULL, NULL, NULL, NULL, NULL
),
(
  'q-border-detectives', 7, 'single',
  'Uruguay sits on the Atlantic coast between Argentina and which other country?',
  'Uruguay lies between Argentina and Brazil.',
  NULL,
  '[{"id":"a","label":"Chile"},{"id":"b","label":"Paraguay"},{"id":"c","label":"Brazil"},{"id":"d","label":"Peru"}]',
  'c', NULL, NULL,
  NULL, NULL, NULL, NULL, NULL, NULL
),
(
  'q-border-detectives', 8, 'boolean',
  'Australia shares a land border with New Zealand.',
  'Australia and New Zealand are separated by the Tasman Sea.',
  NULL,
  NULL,
  NULL, NULL, false,
  NULL, NULL, NULL, NULL, NULL, NULL
),
(
  'q-border-detectives', 9, 'single',
  'Which sea lies between Saudi Arabia and Egypt?',
  'The Red Sea separates Egypt''s Sinai/African coast from the Arabian Peninsula.',
  NULL,
  '[{"id":"a","label":"Black Sea"},{"id":"b","label":"Red Sea"},{"id":"c","label":"Caspian Sea"},{"id":"d","label":"Baltic Sea"}]',
  'b', NULL, NULL,
  NULL, NULL, NULL, NULL, NULL, NULL
),
(
  'q-border-detectives', 10, 'typed',
  'Name a country that borders both Canada and Mexico. (There is only one.)',
  'The United States is the only country that borders both.',
  NULL,
  NULL,
  NULL, NULL, NULL,
  NULL, NULL, ARRAY['united states','usa','united states of america','the united states'], 'Type your answer', NULL, NULL
)
on conflict (quiz_id, position) do nothing;

-- ─── q-guess-the-country (10 questions) ─────────────────────────────────────────
insert into public.quiz_questions (
  quiz_id, position, type, prompt, explanation, media,
  options, answer_id, answer_ids, answer_bool,
  regions, board_art, accepted, placeholder, items, targets
)
values
(
  'q-guess-the-country', 1, 'single',
  'Clues: Andes, Machu Picchu, and Spanish as an official language. Which country?',
  'Peru contains Machu Picchu and a long Andean spine.',
  NULL,
  '[{"id":"a","label":"Bolivia"},{"id":"b","label":"Peru"},{"id":"c","label":"Ecuador"},{"id":"d","label":"Colombia"}]',
  'b', NULL, NULL,
  NULL, NULL, NULL, NULL, NULL, NULL
),
(
  'q-guess-the-country', 2, 'single',
  'Clues: Nile River, Sahara, and a capital called Cairo. Which country?',
  'Egypt''s settled land follows the Nile through the Sahara.',
  NULL,
  '[{"id":"a","label":"Sudan"},{"id":"b","label":"Egypt"},{"id":"c","label":"Libya"},{"id":"d","label":"Ethiopia"}]',
  'b', NULL, NULL,
  NULL, NULL, NULL, NULL, NULL, NULL
),
(
  'q-guess-the-country', 3, 'typed',
  'Clues: maple syrup, two official languages at the federal level, and Ottawa. Name the country.',
  'Canada is officially bilingual at the federal level and uses Ottawa as its capital.',
  NULL,
  NULL,
  NULL, NULL, NULL,
  NULL, NULL, ARRAY['canada'], 'Type your answer', NULL, NULL
),
(
  'q-guess-the-country', 4, 'boolean',
  'Clues: Outback, Great Barrier Reef, and a capital called Canberra — this country is Australia.',
  'Those landmarks and Canberra identify Australia.',
  NULL,
  NULL,
  NULL, NULL, true,
  NULL, NULL, NULL, NULL, NULL, NULL
),
(
  'q-guess-the-country', 5, 'single',
  'Clues: saffron-white-green flag, Himalaya in the north, capital New Delhi. Which country?',
  'India''s tricolour and New Delhi match these clues.',
  NULL,
  '[{"id":"a","label":"Pakistan"},{"id":"b","label":"India"},{"id":"c","label":"Bangladesh"},{"id":"d","label":"Nepal"}]',
  'b', NULL, NULL,
  NULL, NULL, NULL, NULL, NULL, NULL
),
(
  'q-guess-the-country', 6, 'single',
  'Clues: samba, Amazon rainforest, Portuguese language. Which country?',
  'Brazil is the largest Portuguese-speaking country and contains most of the Amazon basin.',
  NULL,
  '[{"id":"a","label":"Portugal"},{"id":"b","label":"Angola"},{"id":"c","label":"Brazil"},{"id":"d","label":"Mozambique"}]',
  'c', NULL, NULL,
  NULL, NULL, NULL, NULL, NULL, NULL
),
(
  'q-guess-the-country', 7, 'multiple',
  'Which clues correctly describe Morocco?',
  'Morocco is in North Africa and has Atlantic and Mediterranean coasts. It is not in East Africa and is not landlocked.',
  NULL,
  '[{"id":"a","label":"North African country"},{"id":"b","label":"Landlocked"},{"id":"c","label":"Atlantic coastline"},{"id":"d","label":"East African island"}]',
  NULL, ARRAY['a','c'], NULL,
  NULL, NULL, NULL, NULL, NULL, NULL
),
(
  'q-guess-the-country', 8, 'single',
  'Clues: fjords, midnight sun in summer, capital Oslo. Which country?',
  'Oslo and famous fjords identify Norway.',
  NULL,
  '[{"id":"a","label":"Sweden"},{"id":"b","label":"Norway"},{"id":"c","label":"Finland"},{"id":"d","label":"Denmark"}]',
  'b', NULL, NULL,
  NULL, NULL, NULL, NULL, NULL, NULL
),
(
  'q-guess-the-country', 9, 'single',
  'Clues: Maasai Mara, equatorial East Africa, capital Nairobi. Which country?',
  'The Maasai Mara and Nairobi identify Kenya.',
  NULL,
  '[{"id":"a","label":"Uganda"},{"id":"b","label":"Kenya"},{"id":"c","label":"Tanzania"},{"id":"d","label":"Ethiopia"}]',
  'b', NULL, NULL,
  NULL, NULL, NULL, NULL, NULL, NULL
),
(
  'q-guess-the-country', 10, 'typed',
  'Clues: kiwi bird, two main islands, capital Wellington. Name the country.',
  'Wellington and the kiwi identify New Zealand.',
  NULL,
  NULL,
  NULL, NULL, NULL,
  NULL, NULL, ARRAY['new zealand'], 'Type your answer', NULL, NULL
)
on conflict (quiz_id, position) do nothing;

-- ─── q-national-wonders (10 questions) ─────────────────────────────────────────
insert into public.quiz_questions (
  quiz_id, position, type, prompt, explanation, media,
  options, answer_id, answer_ids, answer_bool,
  regions, board_art, accepted, placeholder, items, targets
)
values
(
  'q-national-wonders', 1, 'single',
  'Victoria Falls sits on the border of Zimbabwe and which other country?',
  'The Zambezi drops at Victoria Falls between Zambia and Zimbabwe.',
  NULL,
  '[{"id":"a","label":"Botswana"},{"id":"b","label":"Zambia"},{"id":"c","label":"Malawi"},{"id":"d","label":"Mozambique"}]',
  'b', NULL, NULL,
  NULL, NULL, NULL, NULL, NULL, NULL
),
(
  'q-national-wonders', 2, 'single',
  'Uluru is a famous sandstone monolith in which country?',
  'Uluru stands in Australia''s Northern Territory.',
  NULL,
  '[{"id":"a","label":"United States"},{"id":"b","label":"Australia"},{"id":"c","label":"South Africa"},{"id":"d","label":"Namibia"}]',
  'b', NULL, NULL,
  NULL, NULL, NULL, NULL, NULL, NULL
),
(
  'q-national-wonders', 3, 'typed',
  'Name the country that contains most of the Grand Canyon.',
  'The Grand Canyon of the Colorado River is in the United States.',
  NULL,
  NULL,
  NULL, NULL, NULL,
  NULL, NULL, ARRAY['united states','usa','united states of america'], 'Type your answer', NULL, NULL
),
(
  'q-national-wonders', 4, 'boolean',
  'Angel Falls, one of the world''s highest uninterrupted waterfalls, is in Venezuela.',
  'Angel Falls drops from Auyán-tepui in southeastern Venezuela.',
  NULL,
  NULL,
  NULL, NULL, true,
  NULL, NULL, NULL, NULL, NULL, NULL
),
(
  'q-national-wonders', 5, 'single',
  'Mount Kilimanjaro, Africa''s highest peak, is in which country?',
  'Kilimanjaro is in Tanzania, near the Kenyan border.',
  NULL,
  '[{"id":"a","label":"Kenya"},{"id":"b","label":"Tanzania"},{"id":"c","label":"Uganda"},{"id":"d","label":"Ethiopia"}]',
  'b', NULL, NULL,
  NULL, NULL, NULL, NULL, NULL, NULL
),
(
  'q-national-wonders', 6, 'multiple',
  'Which natural features are in Argentina?',
  'Iguazú Falls (shared with Brazil) and the southern Andes are in Argentina. Torres del Paine is in Chile; Yellowstone is in the United States.',
  NULL,
  '[{"id":"a","label":"Iguazú Falls"},{"id":"b","label":"Yellowstone"},{"id":"c","label":"Southern Andes"},{"id":"d","label":"Torres del Paine"}]',
  NULL, ARRAY['a','c'], NULL,
  NULL, NULL, NULL, NULL, NULL, NULL
),
(
  'q-national-wonders', 7, 'single',
  'Ha Long Bay''s limestone islets are a celebrated seascape of which country?',
  'Ha Long Bay is on Vietnam''s northern coast.',
  NULL,
  '[{"id":"a","label":"Thailand"},{"id":"b","label":"Vietnam"},{"id":"c","label":"Philippines"},{"id":"d","label":"Indonesia"}]',
  'b', NULL, NULL,
  NULL, NULL, NULL, NULL, NULL, NULL
),
(
  'q-national-wonders', 8, 'single',
  'The Amazon River''s mouth is primarily in which country?',
  'The Amazon reaches the Atlantic through northern Brazil.',
  NULL,
  '[{"id":"a","label":"Peru"},{"id":"b","label":"Colombia"},{"id":"c","label":"Brazil"},{"id":"d","label":"Venezuela"}]',
  'c', NULL, NULL,
  NULL, NULL, NULL, NULL, NULL, NULL
),
(
  'q-national-wonders', 9, 'boolean',
  'Fjords of the South Island are a famous landscape of New Zealand.',
  'Fiordland on New Zealand''s South Island includes Milford Sound and related glacial inlets.',
  NULL,
  NULL,
  NULL, NULL, true,
  NULL, NULL, NULL, NULL, NULL, NULL
),
(
  'q-national-wonders', 10, 'typed',
  'Name the country of the Great Barrier Reef.',
  'The reef lies off Queensland, Australia.',
  NULL,
  NULL,
  NULL, NULL, NULL,
  NULL, NULL, ARRAY['australia'], 'Type your answer', NULL, NULL
)
on conflict (quiz_id, position) do nothing;

-- ─── q-seven-continents-challenge (10 questions) ─────────────────────────────────────────
insert into public.quiz_questions (
  quiz_id, position, type, prompt, explanation, media,
  options, answer_id, answer_ids, answer_bool,
  regions, board_art, accepted, placeholder, items, targets
)
values
(
  'q-seven-continents-challenge', 1, 'single',
  'On which continent is Ethiopia?',
  'Ethiopia is in the Horn of Africa.',
  NULL,
  '[{"id":"a","label":"Asia"},{"id":"b","label":"Africa"},{"id":"c","label":"Europe"},{"id":"d","label":"South America"}]',
  'b', NULL, NULL,
  NULL, NULL, NULL, NULL, NULL, NULL
),
(
  'q-seven-continents-challenge', 2, 'single',
  'On which continent is Thailand?',
  'Thailand is in mainland Southeast Asia.',
  NULL,
  '[{"id":"a","label":"Africa"},{"id":"b","label":"Oceania"},{"id":"c","label":"Asia"},{"id":"d","label":"Europe"}]',
  'c', NULL, NULL,
  NULL, NULL, NULL, NULL, NULL, NULL
),
(
  'q-seven-continents-challenge', 3, 'typed',
  'Name the continent that contains Argentina.',
  'Argentina occupies much of the southern cone of South America.',
  NULL,
  NULL,
  NULL, NULL, NULL,
  NULL, NULL, ARRAY['south america'], 'Type your answer', NULL, NULL
),
(
  'q-seven-continents-challenge', 4, 'boolean',
  'Germany is in Europe.',
  'Germany is a central European country.',
  NULL,
  NULL,
  NULL, NULL, true,
  NULL, NULL, NULL, NULL, NULL, NULL
),
(
  'q-seven-continents-challenge', 5, 'single',
  'On which continent is Canada?',
  'Canada occupies the northern part of North America.',
  NULL,
  '[{"id":"a","label":"Europe"},{"id":"b","label":"North America"},{"id":"c","label":"Asia"},{"id":"d","label":"Oceania"}]',
  'b', NULL, NULL,
  NULL, NULL, NULL, NULL, NULL, NULL
),
(
  'q-seven-continents-challenge', 6, 'multiple',
  'Which countries are in Africa?',
  'Ghana and Namibia are African states. Laos is in Asia; Uruguay is in South America.',
  NULL,
  '[{"id":"a","label":"Ghana"},{"id":"b","label":"Laos"},{"id":"c","label":"Namibia"},{"id":"d","label":"Uruguay"}]',
  NULL, ARRAY['a','c'], NULL,
  NULL, NULL, NULL, NULL, NULL, NULL
),
(
  'q-seven-continents-challenge', 7, 'single',
  'Fiji is part of which geographic region?',
  'Fiji is an island country in Oceania, in the South Pacific.',
  NULL,
  '[{"id":"a","label":"Europe"},{"id":"b","label":"Oceania"},{"id":"c","label":"South America"},{"id":"d","label":"Antarctica"}]',
  'b', NULL, NULL,
  NULL, NULL, NULL, NULL, NULL, NULL
),
(
  'q-seven-continents-challenge', 8, 'single',
  'Which continent has no permanent sovereign country?',
  'Antarctica is governed by the Antarctic Treaty System, not a country government.',
  NULL,
  '[{"id":"a","label":"Australia"},{"id":"b","label":"Antarctica"},{"id":"c","label":"Europe"},{"id":"d","label":"Africa"}]',
  'b', NULL, NULL,
  NULL, NULL, NULL, NULL, NULL, NULL
),
(
  'q-seven-continents-challenge', 9, 'boolean',
  'Egypt is entirely in Asia.',
  'Most of Egypt is in Africa; only the Sinai Peninsula is in Asia.',
  NULL,
  NULL,
  NULL, NULL, false,
  NULL, NULL, NULL, NULL, NULL, NULL
),
(
  'q-seven-continents-challenge', 10, 'typed',
  'Name the continent that contains Sweden.',
  'Sweden is in Northern Europe.',
  NULL,
  NULL,
  NULL, NULL, NULL,
  NULL, NULL, ARRAY['europe'], 'Type your answer', NULL, NULL
)
on conflict (quiz_id, position) do nothing;

-- ─── q-country-or-not (10 questions) ─────────────────────────────────────────
insert into public.quiz_questions (
  quiz_id, position, type, prompt, explanation, media,
  options, answer_id, answer_ids, answer_bool,
  regions, board_art, accepted, placeholder, items, targets
)
values
(
  'q-country-or-not', 1, 'single',
  'Which of these is a sovereign country?',
  'Kenya is a UN member state. Hawaii is a U.S. state; Sicily is part of Italy; Puerto Rico is a U.S. territory.',
  NULL,
  '[{"id":"a","label":"Hawaii"},{"id":"b","label":"Kenya"},{"id":"c","label":"Sicily"},{"id":"d","label":"Puerto Rico"}]',
  'b', NULL, NULL,
  NULL, NULL, NULL, NULL, NULL, NULL
),
(
  'q-country-or-not', 2, 'single',
  'Which of these is NOT a sovereign country?',
  'Hong Kong is a Special Administrative Region of China, not a separate UN member state.',
  NULL,
  '[{"id":"a","label":"Singapore"},{"id":"b","label":"Hong Kong"},{"id":"c","label":"Mongolia"},{"id":"d","label":"Laos"}]',
  'b', NULL, NULL,
  NULL, NULL, NULL, NULL, NULL, NULL
),
(
  'q-country-or-not', 3, 'boolean',
  'Greenland is a sovereign country.',
  'Greenland is an autonomous territory within the Kingdom of Denmark, not an independent UN member state.',
  NULL,
  NULL,
  NULL, NULL, false,
  NULL, NULL, NULL, NULL, NULL, NULL
),
(
  'q-country-or-not', 4, 'typed',
  'Name the sovereign country that includes the city of Barcelona.',
  'Barcelona is a major city in Spain, not a country.',
  NULL,
  NULL,
  NULL, NULL, NULL,
  NULL, NULL, ARRAY['spain'], 'Type your answer', NULL, NULL
),
(
  'q-country-or-not', 5, 'single',
  'Which of these is a sovereign country in the Caribbean?',
  'Jamaica is independent. Martinique is an overseas region of France.',
  NULL,
  '[{"id":"a","label":"Martinique"},{"id":"b","label":"Jamaica"},{"id":"c","label":"Guadeloupe"},{"id":"d","label":"Aruba"}]',
  'b', NULL, NULL,
  NULL, NULL, NULL, NULL, NULL, NULL
),
(
  'q-country-or-not', 6, 'multiple',
  'Which of these are sovereign countries?',
  'Nepal and Iceland are independent states. Tibet is an autonomous region of China; Bermuda is a British Overseas Territory.',
  NULL,
  '[{"id":"a","label":"Nepal"},{"id":"b","label":"Tibet"},{"id":"c","label":"Iceland"},{"id":"d","label":"Bermuda"}]',
  NULL, ARRAY['a','c'], NULL,
  NULL, NULL, NULL, NULL, NULL, NULL
),
(
  'q-country-or-not', 7, 'single',
  'Which of these is a city, not a country?',
  'Istanbul is a city in Türkiye. The others are sovereign states.',
  NULL,
  '[{"id":"a","label":"Ghana"},{"id":"b","label":"Istanbul"},{"id":"c","label":"Peru"},{"id":"d","label":"Oman"}]',
  'b', NULL, NULL,
  NULL, NULL, NULL, NULL, NULL, NULL
),
(
  'q-country-or-not', 8, 'boolean',
  'Vatican City is a sovereign state, even though it is not a regular UN member.',
  'Vatican City is widely recognized as sovereign. The Holy See holds UN observer status.',
  NULL,
  NULL,
  NULL, NULL, true,
  NULL, NULL, NULL, NULL, NULL, NULL
),
(
  'q-country-or-not', 9, 'single',
  'Which of these is a U.S. territory rather than a sovereign country?',
  'Guam is an unincorporated U.S. territory. Palau is a sovereign country in free association with the United States.',
  NULL,
  '[{"id":"a","label":"Palau"},{"id":"b","label":"Guam"},{"id":"c","label":"Nauru"},{"id":"d","label":"Tuvalu"}]',
  'b', NULL, NULL,
  NULL, NULL, NULL, NULL, NULL, NULL
),
(
  'q-country-or-not', 10, 'typed',
  'Is Scotland a sovereign UN member country? Type yes or no.',
  'Scotland is a country within the United Kingdom, not a separate UN member state.',
  NULL,
  NULL,
  NULL, NULL, NULL,
  NULL, NULL, ARRAY['no'], 'Type your answer', NULL, NULL
)
on conflict (quiz_id, position) do nothing;

-- ─── q-rivers-lakes-nations (10 questions) ─────────────────────────────────────────
insert into public.quiz_questions (
  quiz_id, position, type, prompt, explanation, media,
  options, answer_id, answer_ids, answer_bool,
  regions, board_art, accepted, placeholder, items, targets
)
values
(
  'q-rivers-lakes-nations', 1, 'single',
  'The Nile is most closely associated with which North African country?',
  'The Nile''s famous lower course and delta are in Egypt.',
  NULL,
  '[{"id":"a","label":"Algeria"},{"id":"b","label":"Egypt"},{"id":"c","label":"Morocco"},{"id":"d","label":"Tunisia"}]',
  'b', NULL, NULL,
  NULL, NULL, NULL, NULL, NULL, NULL
),
(
  'q-rivers-lakes-nations', 2, 'single',
  'Lake Victoria is bordered by Tanzania, Uganda, and which other country?',
  'Kenya has a shoreline on the northeastern part of Lake Victoria.',
  NULL,
  '[{"id":"a","label":"Rwanda"},{"id":"b","label":"Kenya"},{"id":"c","label":"Burundi"},{"id":"d","label":"Somalia"}]',
  'b', NULL, NULL,
  NULL, NULL, NULL, NULL, NULL, NULL
),
(
  'q-rivers-lakes-nations', 3, 'typed',
  'Name a country the Amazon River flows through besides Brazil.',
  'The Amazon also flows through Peru and Colombia before entering Brazil.',
  NULL,
  NULL,
  NULL, NULL, NULL,
  NULL, NULL, ARRAY['peru','colombia'], 'Type your answer', NULL, NULL
),
(
  'q-rivers-lakes-nations', 4, 'boolean',
  'The Danube River empties into the Black Sea.',
  'The Danube delta is on Romania''s Black Sea coast.',
  NULL,
  NULL,
  NULL, NULL, true,
  NULL, NULL, NULL, NULL, NULL, NULL
),
(
  'q-rivers-lakes-nations', 5, 'single',
  'The Ganges is a sacred river most closely associated with which country?',
  'The Ganges flows across northern India and into Bangladesh.',
  NULL,
  '[{"id":"a","label":"India"},{"id":"b","label":"Iran"},{"id":"c","label":"Turkey"},{"id":"d","label":"Saudi Arabia"}]',
  'a', NULL, NULL,
  NULL, NULL, NULL, NULL, NULL, NULL
),
(
  'q-rivers-lakes-nations', 6, 'multiple',
  'Which countries does the Rhine flow through or along?',
  'The Rhine flows through Switzerland and Germany (and others). It does not flow through Spain or Greece.',
  NULL,
  '[{"id":"a","label":"Switzerland"},{"id":"b","label":"Spain"},{"id":"c","label":"Germany"},{"id":"d","label":"Greece"}]',
  NULL, ARRAY['a','c'], NULL,
  NULL, NULL, NULL, NULL, NULL, NULL
),
(
  'q-rivers-lakes-nations', 7, 'single',
  'Lake Titicaca is shared by Peru and which other country?',
  'Lake Titicaca sits on the Peru–Bolivia border in the Andes.',
  NULL,
  '[{"id":"a","label":"Chile"},{"id":"b","label":"Bolivia"},{"id":"c","label":"Ecuador"},{"id":"d","label":"Paraguay"}]',
  'b', NULL, NULL,
  NULL, NULL, NULL, NULL, NULL, NULL
),
(
  'q-rivers-lakes-nations', 8, 'single',
  'The Congo River is primarily associated with which region?',
  'The Congo River drains a huge basin in Central Africa.',
  NULL,
  '[{"id":"a","label":"Central Africa"},{"id":"b","label":"Central Asia"},{"id":"c","label":"Northern Europe"},{"id":"d","label":"Patagonia"}]',
  'a', NULL, NULL,
  NULL, NULL, NULL, NULL, NULL, NULL
),
(
  'q-rivers-lakes-nations', 9, 'boolean',
  'The Murray–Darling basin is in Australia.',
  'The Murray–Darling is Australia''s largest river system.',
  NULL,
  NULL,
  NULL, NULL, true,
  NULL, NULL, NULL, NULL, NULL, NULL
),
(
  'q-rivers-lakes-nations', 10, 'typed',
  'Name the country of the Niagara River''s famous falls (either side is acceptable).',
  'Niagara Falls straddles Canada and the United States.',
  NULL,
  NULL,
  NULL, NULL, NULL,
  NULL, NULL, ARRAY['canada','united states','usa','united states of america'], 'Type your answer', NULL, NULL
)
on conflict (quiz_id, position) do nothing;

-- ─── q-world-neighbourhood (10 questions) ─────────────────────────────────────────
insert into public.quiz_questions (
  quiz_id, position, type, prompt, explanation, media,
  options, answer_id, answer_ids, answer_bool,
  regions, board_art, accepted, placeholder, items, targets
)
values
(
  'q-world-neighbourhood', 1, 'single',
  'Which country is a land neighbour of Germany?',
  'Poland shares Germany''s eastern land border.',
  NULL,
  '[{"id":"a","label":"Ireland"},{"id":"b","label":"Poland"},{"id":"c","label":"Iceland"},{"id":"d","label":"Malta"}]',
  'b', NULL, NULL,
  NULL, NULL, NULL, NULL, NULL, NULL
),
(
  'q-world-neighbourhood', 2, 'single',
  'South Korea''s only land neighbour is which country?',
  'The Korean Demilitarized Zone is the land frontier with North Korea.',
  NULL,
  '[{"id":"a","label":"Japan"},{"id":"b","label":"China"},{"id":"c","label":"North Korea"},{"id":"d","label":"Russia"}]',
  'c', NULL, NULL,
  NULL, NULL, NULL, NULL, NULL, NULL
),
(
  'q-world-neighbourhood', 3, 'typed',
  'Name a country that borders Egypt.',
  'Egypt borders Libya, Sudan, and Israel (and the Gaza Strip).',
  NULL,
  NULL,
  NULL, NULL, NULL,
  NULL, NULL, ARRAY['libya','sudan','israel'], 'Type your answer', NULL, NULL
),
(
  'q-world-neighbourhood', 4, 'boolean',
  'Sri Lanka has a land border with India.',
  'Sri Lanka is separated from India by the Palk Strait.',
  NULL,
  NULL,
  NULL, NULL, false,
  NULL, NULL, NULL, NULL, NULL, NULL
),
(
  'q-world-neighbourhood', 5, 'single',
  'Which sea lies between Greece and Egypt?',
  'The Mediterranean Sea lies between southern Europe and North Africa.',
  NULL,
  '[{"id":"a","label":"Baltic Sea"},{"id":"b","label":"Mediterranean Sea"},{"id":"c","label":"Caspian Sea"},{"id":"d","label":"Caribbean Sea"}]',
  'b', NULL, NULL,
  NULL, NULL, NULL, NULL, NULL, NULL
),
(
  'q-world-neighbourhood', 6, 'multiple',
  'Which countries neighbour South Africa by land?',
  'Namibia and Mozambique border South Africa. Madagascar and New Zealand do not.',
  NULL,
  '[{"id":"a","label":"Namibia"},{"id":"b","label":"Madagascar"},{"id":"c","label":"Mozambique"},{"id":"d","label":"New Zealand"}]',
  NULL, ARRAY['a','c'], NULL,
  NULL, NULL, NULL, NULL, NULL, NULL
),
(
  'q-world-neighbourhood', 7, 'single',
  'Which country sits between Norway and Finland on the Scandinavian Peninsula?',
  'Sweden occupies the centre of the peninsula between Norway and Finland/Baltic.',
  NULL,
  '[{"id":"a","label":"Denmark"},{"id":"b","label":"Sweden"},{"id":"c","label":"Estonia"},{"id":"d","label":"Iceland"}]',
  'b', NULL, NULL,
  NULL, NULL, NULL, NULL, NULL, NULL
),
(
  'q-world-neighbourhood', 8, 'single',
  'The island of Hispaniola is shared by Haiti and which other country?',
  'The Dominican Republic occupies the eastern part of Hispaniola.',
  NULL,
  '[{"id":"a","label":"Cuba"},{"id":"b","label":"Dominican Republic"},{"id":"c","label":"Jamaica"},{"id":"d","label":"Puerto Rico"}]',
  'b', NULL, NULL,
  NULL, NULL, NULL, NULL, NULL, NULL
),
(
  'q-world-neighbourhood', 9, 'boolean',
  'Chile and Argentina share a long Andean land border.',
  'The Chile–Argentina border follows much of the southern Andes.',
  NULL,
  NULL,
  NULL, NULL, true,
  NULL, NULL, NULL, NULL, NULL, NULL
),
(
  'q-world-neighbourhood', 10, 'typed',
  'Name a country that shares a land border with Vietnam.',
  'Vietnam borders China, Laos, and Cambodia.',
  NULL,
  NULL,
  NULL, NULL, NULL,
  NULL, NULL, ARRAY['china','laos','cambodia'], 'Type your answer', NULL, NULL
)
on conflict (quiz_id, position) do nothing;

-- ─── q-famous-places-famous-countries (10 questions) ─────────────────────────────────────────
insert into public.quiz_questions (
  quiz_id, position, type, prompt, explanation, media,
  options, answer_id, answer_ids, answer_bool,
  regions, board_art, accepted, placeholder, items, targets
)
values
(
  'q-famous-places-famous-countries', 1, 'single',
  'The Taj Mahal is in which country?',
  'The Taj Mahal stands in Agra, India.',
  NULL,
  '[{"id":"a","label":"Pakistan"},{"id":"b","label":"India"},{"id":"c","label":"Bangladesh"},{"id":"d","label":"Iran"}]',
  'b', NULL, NULL,
  NULL, NULL, NULL, NULL, NULL, NULL
),
(
  'q-famous-places-famous-countries', 2, 'single',
  'Machu Picchu is in which country?',
  'The Inca citadel overlooks the Urubamba valley in Peru.',
  NULL,
  '[{"id":"a","label":"Mexico"},{"id":"b","label":"Peru"},{"id":"c","label":"Bolivia"},{"id":"d","label":"Guatemala"}]',
  'b', NULL, NULL,
  NULL, NULL, NULL, NULL, NULL, NULL
),
(
  'q-famous-places-famous-countries', 3, 'typed',
  'Name the country of the Great Wall''s most famous surviving sections.',
  'The Great Wall was built across northern China.',
  NULL,
  NULL,
  NULL, NULL, NULL,
  NULL, NULL, ARRAY['china'], 'Type your answer', NULL, NULL
),
(
  'q-famous-places-famous-countries', 4, 'boolean',
  'The Colosseum is in Italy.',
  'The Flavian Amphitheatre stands in Rome, Italy.',
  NULL,
  NULL,
  NULL, NULL, true,
  NULL, NULL, NULL, NULL, NULL, NULL
),
(
  'q-famous-places-famous-countries', 5, 'single',
  'Christ the Redeemer overlooks which Brazilian city?',
  'The statue stands on Corcovado above Rio de Janeiro.',
  NULL,
  '[{"id":"a","label":"Brasília"},{"id":"b","label":"São Paulo"},{"id":"c","label":"Rio de Janeiro"},{"id":"d","label":"Salvador"}]',
  'c', NULL, NULL,
  NULL, NULL, NULL, NULL, NULL, NULL
),
(
  'q-famous-places-famous-countries', 6, 'multiple',
  'Which landmarks are in Egypt?',
  'The Great Sphinx and Karnak Temple are in Egypt. Petra is in Jordan; Angkor Wat is in Cambodia.',
  NULL,
  '[{"id":"a","label":"Great Sphinx"},{"id":"b","label":"Petra"},{"id":"c","label":"Karnak Temple"},{"id":"d","label":"Angkor Wat"}]',
  NULL, ARRAY['a','c'], NULL,
  NULL, NULL, NULL, NULL, NULL, NULL
),
(
  'q-famous-places-famous-countries', 7, 'single',
  'Chichen Itza is a famous archaeological site in which country?',
  'Chichen Itza is on Mexico''s Yucatán Peninsula.',
  NULL,
  '[{"id":"a","label":"Honduras"},{"id":"b","label":"Mexico"},{"id":"c","label":"Belize"},{"id":"d","label":"Cuba"}]',
  'b', NULL, NULL,
  NULL, NULL, NULL, NULL, NULL, NULL
),
(
  'q-famous-places-famous-countries', 8, 'single',
  'The Acropolis of Athens is in which country?',
  'The Acropolis stands above Athens, Greece.',
  NULL,
  '[{"id":"a","label":"Turkey"},{"id":"b","label":"Greece"},{"id":"c","label":"Italy"},{"id":"d","label":"Albania"}]',
  'b', NULL, NULL,
  NULL, NULL, NULL, NULL, NULL, NULL
),
(
  'q-famous-places-famous-countries', 9, 'boolean',
  'Stonehenge is in the United Kingdom.',
  'Stonehenge stands on Salisbury Plain in England.',
  NULL,
  NULL,
  NULL, NULL, true,
  NULL, NULL, NULL, NULL, NULL, NULL
),
(
  'q-famous-places-famous-countries', 10, 'typed',
  'Name the country of Angkor Wat.',
  'Angkor Wat is in Cambodia.',
  NULL,
  NULL,
  NULL, NULL, NULL,
  NULL, NULL, ARRAY['cambodia'], 'Type your answer', NULL, NULL
)
on conflict (quiz_id, position) do nothing;

-- ─── q-world-geography-warmup (10 questions) ─────────────────────────────────────────
insert into public.quiz_questions (
  quiz_id, position, type, prompt, explanation, media,
  options, answer_id, answer_ids, answer_bool,
  regions, board_art, accepted, placeholder, items, targets
)
values
(
  'q-world-geography-warmup', 1, 'single',
  'Which country has the capital city of Addis Ababa?',
  'Addis Ababa is the capital of Ethiopia.',
  NULL,
  '[{"id":"a","label":"Eritrea"},{"id":"b","label":"Ethiopia"},{"id":"c","label":"Somalia"},{"id":"d","label":"Djibouti"}]',
  'b', NULL, NULL,
  NULL, NULL, NULL, NULL, NULL, NULL
),
(
  'q-world-geography-warmup', 2, 'image',
  'Which country flies this flag?',
  'Mexico''s flag is a vertical green-white-red tricolour with the national coat of arms.',
  '{"kind":"flag","glyph":"🇲🇽","caption":"Green, white, and red vertical bands"}',
  '[{"id":"a","label":"Italy","glyph":"🇮🇹"},{"id":"b","label":"Mexico","glyph":"🇲🇽"},{"id":"c","label":"Iran","glyph":"🇮🇷"},{"id":"d","label":"Hungary","glyph":"🇭🇺"}]',
  'b', NULL, NULL,
  NULL, NULL, NULL, NULL, NULL, NULL
),
(
  'q-world-geography-warmup', 3, 'typed',
  'Name the continent that contains Nigeria.',
  'Nigeria is in West Africa.',
  NULL,
  NULL,
  NULL, NULL, NULL,
  NULL, NULL, ARRAY['africa'], 'Type your answer', NULL, NULL
),
(
  'q-world-geography-warmup', 4, 'boolean',
  'The equator crosses Kenya.',
  'Kenya is crossed by the equator in the highlands near Mount Kenya.',
  NULL,
  NULL,
  NULL, NULL, true,
  NULL, NULL, NULL, NULL, NULL, NULL
),
(
  'q-world-geography-warmup', 5, 'single',
  'Which country borders both France and Portugal?',
  'Spain sits between France and Portugal.',
  NULL,
  '[{"id":"a","label":"Italy"},{"id":"b","label":"Spain"},{"id":"c","label":"Belgium"},{"id":"d","label":"Andorra"}]',
  'b', NULL, NULL,
  NULL, NULL, NULL, NULL, NULL, NULL
),
(
  'q-world-geography-warmup', 6, 'multiple',
  'Which of these are national capitals?',
  'Lisbon and Seoul are capitals. São Paulo and Toronto are not.',
  NULL,
  '[{"id":"a","label":"Lisbon"},{"id":"b","label":"São Paulo"},{"id":"c","label":"Seoul"},{"id":"d","label":"Toronto"}]',
  NULL, ARRAY['a','c'], NULL,
  NULL, NULL, NULL, NULL, NULL, NULL
),
(
  'q-world-geography-warmup', 7, 'single',
  'Which ocean lies east of South Africa?',
  'The Indian Ocean washes South Africa''s east coast; the Atlantic is to the west.',
  NULL,
  '[{"id":"a","label":"Pacific Ocean"},{"id":"b","label":"Indian Ocean"},{"id":"c","label":"Arctic Ocean"},{"id":"d","label":"Southern Ocean only"}]',
  'b', NULL, NULL,
  NULL, NULL, NULL, NULL, NULL, NULL
),
(
  'q-world-geography-warmup', 8, 'single',
  'Which country is landlocked?',
  'Uganda has no coastline. The others listed have coasts.',
  NULL,
  '[{"id":"a","label":"Kenya"},{"id":"b","label":"Uganda"},{"id":"c","label":"Tanzania"},{"id":"d","label":"Somalia"}]',
  'b', NULL, NULL,
  NULL, NULL, NULL, NULL, NULL, NULL
),
(
  'q-world-geography-warmup', 9, 'boolean',
  'Indonesia is in Southeast Asia and spans many islands.',
  'Indonesia is the world''s largest archipelagic state, mainly in Southeast Asia.',
  NULL,
  NULL,
  NULL, NULL, true,
  NULL, NULL, NULL, NULL, NULL, NULL
),
(
  'q-world-geography-warmup', 10, 'typed',
  'Name the capital of Italy.',
  'Rome is Italy''s capital.',
  NULL,
  NULL,
  NULL, NULL, NULL,
  NULL, NULL, ARRAY['rome','roma'], 'Type your answer', NULL, NULL
)
on conflict (quiz_id, position) do nothing;

-- ─── q-borderline-genius (10 questions) ─────────────────────────────────────────
insert into public.quiz_questions (
  quiz_id, position, type, prompt, explanation, media,
  options, answer_id, answer_ids, answer_bool,
  regions, board_art, accepted, placeholder, items, targets
)
values
(
  'q-borderline-genius', 1, 'single',
  'Which country has land borders with both Russia and China, and has Ulaanbaatar as its capital?',
  'Mongolia is a large landlocked state between Russia and China.',
  NULL,
  '[{"id":"a","label":"Kazakhstan"},{"id":"b","label":"Mongolia"},{"id":"c","label":"Kyrgyzstan"},{"id":"d","label":"Tajikistan"}]',
  'b', NULL, NULL,
  NULL, NULL, NULL, NULL, NULL, NULL
),
(
  'q-borderline-genius', 2, 'single',
  'The Gambia is almost entirely surrounded by which country?',
  'The Gambia occupies a narrow strip along the Gambia River inside Senegal.',
  NULL,
  '[{"id":"a","label":"Guinea"},{"id":"b","label":"Senegal"},{"id":"c","label":"Guinea-Bissau"},{"id":"d","label":"Mali"}]',
  'b', NULL, NULL,
  NULL, NULL, NULL, NULL, NULL, NULL
),
(
  'q-borderline-genius', 3, 'typed',
  'Name the only country that borders both the United Kingdom (by land, on Ireland) and the European Union on that island.',
  'The Republic of Ireland shares the island of Ireland with Northern Ireland (UK).',
  NULL,
  NULL,
  NULL, NULL, NULL,
  NULL, NULL, ARRAY['ireland','republic of ireland'], 'Type your answer', NULL, NULL
),
(
  'q-borderline-genius', 4, 'boolean',
  'Kaliningrad Oblast is a Russian territory that does not touch the rest of Russia by land.',
  'Kaliningrad is an exclave on the Baltic, bordering Poland and Lithuania.',
  NULL,
  NULL,
  NULL, NULL, true,
  NULL, NULL, NULL, NULL, NULL, NULL
),
(
  'q-borderline-genius', 5, 'single',
  'Which country has land borders with both Turkey and Iraq?',
  'Syria''s northern and eastern frontiers meet Turkey and Iraq.',
  NULL,
  '[{"id":"a","label":"Jordan"},{"id":"b","label":"Syria"},{"id":"c","label":"Lebanon"},{"id":"d","label":"Israel"}]',
  'b', NULL, NULL,
  NULL, NULL, NULL, NULL, NULL, NULL
),
(
  'q-borderline-genius', 6, 'multiple',
  'Which countries share a land border with Brazil?',
  'Colombia and Paraguay border Brazil. Chile and Ecuador do not.',
  NULL,
  '[{"id":"a","label":"Chile"},{"id":"b","label":"Colombia"},{"id":"c","label":"Ecuador"},{"id":"d","label":"Paraguay"}]',
  NULL, ARRAY['b','d'], NULL,
  NULL, NULL, NULL, NULL, NULL, NULL
),
(
  'q-borderline-genius', 7, 'single',
  'Which European country is doubly landlocked (surrounded only by landlocked countries)?',
  'Liechtenstein is doubly landlocked (as is Uzbekistan). Among these options, Liechtenstein is the European example.',
  NULL,
  '[{"id":"a","label":"Austria"},{"id":"b","label":"Liechtenstein"},{"id":"c","label":"Switzerland"},{"id":"d","label":"Czechia"}]',
  'b', NULL, NULL,
  NULL, NULL, NULL, NULL, NULL, NULL
),
(
  'q-borderline-genius', 8, 'single',
  'Namibia has a thin eastward extension called the Caprivi Strip. Which country lies immediately north of most of that strip?',
  'Angola and Zambia lie north; the strip was designed to reach the Zambezi. Zambia is the classic northern neighbour along much of the eastern strip.',
  NULL,
  '[{"id":"a","label":"South Africa"},{"id":"b","label":"Zambia"},{"id":"c","label":"Botswana"},{"id":"d","label":"Zimbabwe"}]',
  'b', NULL, NULL,
  NULL, NULL, NULL, NULL, NULL, NULL
),
(
  'q-borderline-genius', 9, 'boolean',
  'Spain has land borders on the African continent.',
  'Spain''s Ceuta and Melilla border Morocco in North Africa.',
  NULL,
  NULL,
  NULL, NULL, true,
  NULL, NULL, NULL, NULL, NULL, NULL
),
(
  'q-borderline-genius', 10, 'typed',
  'Name a country that borders both China and India.',
  'Nepal and Bhutan are unambiguous Himalayan examples.',
  NULL,
  NULL,
  NULL, NULL, NULL,
  NULL, NULL, ARRAY['nepal','bhutan'], 'Type your answer', NULL, NULL
)
on conflict (quiz_id, position) do nothing;

-- ─── q-countries-capital-confusion (10 questions) ─────────────────────────────────────────
insert into public.quiz_questions (
  quiz_id, position, type, prompt, explanation, media,
  options, answer_id, answer_ids, answer_bool,
  regions, board_art, accepted, placeholder, items, targets
)
values
(
  'q-countries-capital-confusion', 1, 'single',
  'What is the official capital of Nigeria?',
  'Abuja replaced Lagos as Nigeria''s capital in 1991.',
  NULL,
  '[{"id":"a","label":"Lagos"},{"id":"b","label":"Ibadan"},{"id":"c","label":"Abuja"},{"id":"d","label":"Kano"}]',
  'c', NULL, NULL,
  NULL, NULL, NULL, NULL, NULL, NULL
),
(
  'q-countries-capital-confusion', 2, 'single',
  'Which city is Australia''s federal capital?',
  'Canberra was created as a compromise between Sydney and Melbourne.',
  NULL,
  '[{"id":"a","label":"Sydney"},{"id":"b","label":"Melbourne"},{"id":"c","label":"Canberra"},{"id":"d","label":"Brisbane"}]',
  'c', NULL, NULL,
  NULL, NULL, NULL, NULL, NULL, NULL
),
(
  'q-countries-capital-confusion', 3, 'typed',
  'Name the capital of New Zealand.',
  'Wellington, not Auckland, is New Zealand''s capital.',
  NULL,
  NULL,
  NULL, NULL, NULL,
  NULL, NULL, ARRAY['wellington'], 'Type your answer', NULL, NULL
),
(
  'q-countries-capital-confusion', 4, 'boolean',
  'Cape Town is South Africa''s only capital.',
  'South Africa has three capitals: Pretoria (executive), Cape Town (legislative), and Bloemfontein (judicial).',
  NULL,
  NULL,
  NULL, NULL, false,
  NULL, NULL, NULL, NULL, NULL, NULL
),
(
  'q-countries-capital-confusion', 5, 'single',
  'What is the capital of Türkiye?',
  'Ankara is the capital. Istanbul is the largest city.',
  NULL,
  '[{"id":"a","label":"Istanbul"},{"id":"b","label":"Ankara"},{"id":"c","label":"Izmir"},{"id":"d","label":"Antalya"}]',
  'b', NULL, NULL,
  NULL, NULL, NULL, NULL, NULL, NULL
),
(
  'q-countries-capital-confusion', 6, 'multiple',
  'Which of these cities are national capitals?',
  'Bern and Ottawa are capitals. Zurich and Toronto are not.',
  NULL,
  '[{"id":"a","label":"Zurich"},{"id":"b","label":"Bern"},{"id":"c","label":"Toronto"},{"id":"d","label":"Ottawa"}]',
  NULL, ARRAY['b','d'], NULL,
  NULL, NULL, NULL, NULL, NULL, NULL
),
(
  'q-countries-capital-confusion', 7, 'single',
  'Myanmar''s purpose-built capital, used since 2006, is which city?',
  'Naypyidaw was established as the capital inland from Yangon.',
  NULL,
  '[{"id":"a","label":"Yangon"},{"id":"b","label":"Mandalay"},{"id":"c","label":"Naypyidaw"},{"id":"d","label":"Bagan"}]',
  'c', NULL, NULL,
  NULL, NULL, NULL, NULL, NULL, NULL
),
(
  'q-countries-capital-confusion', 8, 'single',
  'Which country has Dodoma as its official capital, while Dar es Salaam remains the largest city?',
  'Tanzania designated Dodoma as the capital; many offices have been moving there over time.',
  NULL,
  '[{"id":"a","label":"Kenya"},{"id":"b","label":"Tanzania"},{"id":"c","label":"Uganda"},{"id":"d","label":"Malawi"}]',
  'b', NULL, NULL,
  NULL, NULL, NULL, NULL, NULL, NULL
),
(
  'q-countries-capital-confusion', 9, 'boolean',
  'The Hague is the capital of the Netherlands.',
  'Amsterdam is the constitutional capital; The Hague is the seat of government.',
  NULL,
  NULL,
  NULL, NULL, false,
  NULL, NULL, NULL, NULL, NULL, NULL
),
(
  'q-countries-capital-confusion', 10, 'typed',
  'Name Bolivia''s constitutional capital (the judicial seat), not the executive seat La Paz.',
  'Sucre is the constitutional capital; La Paz is the executive seat.',
  NULL,
  NULL,
  NULL, NULL, NULL,
  NULL, NULL, ARRAY['sucre'], 'Type your answer', NULL, NULL
)
on conflict (quiz_id, position) do nothing;

-- ─── q-flags-beyond-the-obvious (10 questions) ─────────────────────────────────────────
insert into public.quiz_questions (
  quiz_id, position, type, prompt, explanation, media,
  options, answer_id, answer_ids, answer_bool,
  regions, board_art, accepted, placeholder, items, targets
)
values
(
  'q-flags-beyond-the-obvious', 1, 'single',
  'Romania and Chad use nearly the same vertical blue-yellow-red tricolour. Which statement is correct?',
  'Chad''s blue is darker indigo; Romania''s is a brighter cobalt. They remain famously similar.',
  NULL,
  '[{"id":"a","label":"They are identical in every official specification"},{"id":"b","label":"Chad''s blue stripe is officially a darker indigo"},{"id":"c","label":"Romania added a green star in 2010"},{"id":"d","label":"Chad uses horizontal stripes"}]',
  'b', NULL, NULL,
  NULL, NULL, NULL, NULL, NULL, NULL
),
(
  'q-flags-beyond-the-obvious', 2, 'image',
  'Which flag is Ireland''s, not Italy''s?',
  'Ireland is green-white-orange vertical; Italy is green-white-red.',
  '{"kind":"flag","glyph":"🇮🇪","caption":"Vertical green, white, and orange"}',
  '[{"id":"a","label":"Italy","glyph":"🇮🇹"},{"id":"b","label":"Ireland","glyph":"🇮🇪"},{"id":"c","label":"Mexico","glyph":"🇲🇽"},{"id":"d","label":"Ivory Coast","glyph":"🇨🇮"}]',
  'b', NULL, NULL,
  NULL, NULL, NULL, NULL, NULL, NULL
),
(
  'q-flags-beyond-the-obvious', 3, 'typed',
  'Name the country whose flag is a red field with a large yellow sun and eight broad rays.',
  'North Macedonia''s flag shows a yellow sun with eight widening rays.',
  NULL,
  NULL,
  NULL, NULL, NULL,
  NULL, NULL, ARRAY['north macedonia','macedonia','republic of north macedonia'], 'Type your answer', NULL, NULL
),
(
  'q-flags-beyond-the-obvious', 4, 'boolean',
  'Indonesia and Poland use the same two colours, but Poland places white above red.',
  'Indonesia is red over white; Poland is white over red.',
  NULL,
  NULL,
  NULL, NULL, true,
  NULL, NULL, NULL, NULL, NULL, NULL
),
(
  'q-flags-beyond-the-obvious', 5, 'single',
  'Which country''s flag shows a green cedar tree?',
  'Lebanon''s cedar sits on the white band between red stripes.',
  NULL,
  '[{"id":"a","label":"Cyprus"},{"id":"b","label":"Lebanon"},{"id":"c","label":"Equatorial Guinea"},{"id":"d","label":"Fiji"}]',
  'b', NULL, NULL,
  NULL, NULL, NULL, NULL, NULL, NULL
),
(
  'q-flags-beyond-the-obvious', 6, 'multiple',
  'Which flags include a Union Jack in the canton?',
  'Australia and New Zealand include the Union Jack. Canada and India no longer do.',
  NULL,
  '[{"id":"a","label":"Australia"},{"id":"b","label":"Canada"},{"id":"c","label":"New Zealand"},{"id":"d","label":"India"}]',
  NULL, ARRAY['a','c'], NULL,
  NULL, NULL, NULL, NULL, NULL, NULL
),
(
  'q-flags-beyond-the-obvious', 7, 'single',
  'Which African flag is orange, white, and green in horizontal bands with an orange disc in the centre?',
  'Niger''s flag is orange-white-green with an orange sun disc. Côte d''Ivoire is a vertical orange-white-green tricolour.',
  NULL,
  '[{"id":"a","label":"Niger"},{"id":"b","label":"India"},{"id":"c","label":"Côte d''Ivoire"},{"id":"d","label":"Ireland"}]',
  'a', NULL, NULL,
  NULL, NULL, NULL, NULL, NULL, NULL
),
(
  'q-flags-beyond-the-obvious', 8, 'single',
  'Luxembourg and the Netherlands both use red-white-blue. How do they differ?',
  'Luxembourg uses a lighter blue (and different proportions) than the Netherlands.',
  NULL,
  '[{"id":"a","label":"Luxembourg adds a crown"},{"id":"b","label":"Luxembourg''s blue is lighter"},{"id":"c","label":"The Netherlands uses green instead of blue"},{"id":"d","label":"They are officially identical"}]',
  'b', NULL, NULL,
  NULL, NULL, NULL, NULL, NULL, NULL
),
(
  'q-flags-beyond-the-obvious', 9, 'boolean',
  'The current flag of South Africa includes a horizontal Y-shaped band.',
  'South Africa''s 1994 flag uses a green Y bordered in yellow and white on red, blue, and black.',
  NULL,
  NULL,
  NULL, NULL, true,
  NULL, NULL, NULL, NULL, NULL, NULL
),
(
  'q-flags-beyond-the-obvious', 10, 'typed',
  'Name the only national flag that is not rectangular.',
  'Nepal''s stacked pennants are the only non-rectangular national flag in current use.',
  NULL,
  NULL,
  NULL, NULL, NULL,
  NULL, NULL, ARRAY['nepal'], 'Type your answer', NULL, NULL
)
on conflict (quiz_id, position) do nothing;

-- ─── q-global-explorers-trial (10 questions) ─────────────────────────────────────────
insert into public.quiz_questions (
  quiz_id, position, type, prompt, explanation, media,
  options, answer_id, answer_ids, answer_bool,
  regions, board_art, accepted, placeholder, items, targets
)
values
(
  'q-global-explorers-trial', 1, 'single',
  'Which country has coastlines on both the Mediterranean Sea and the Red Sea?',
  'Egypt has Mediterranean and Red Sea coasts, linked by the Suez Canal.',
  NULL,
  '[{"id":"a","label":"Jordan"},{"id":"b","label":"Egypt"},{"id":"c","label":"Sudan"},{"id":"d","label":"Lebanon"}]',
  'b', NULL, NULL,
  NULL, NULL, NULL, NULL, NULL, NULL
),
(
  'q-global-explorers-trial', 2, 'single',
  'Which southern African country is landlocked and borders both Namibia and Zimbabwe?',
  'Botswana sits between Namibia, South Africa, Zimbabwe, and Zambia.',
  NULL,
  '[{"id":"a","label":"Lesotho"},{"id":"b","label":"Botswana"},{"id":"c","label":"Eswatini"},{"id":"d","label":"Mozambique"}]',
  'b', NULL, NULL,
  NULL, NULL, NULL, NULL, NULL, NULL
),
(
  'q-global-explorers-trial', 3, 'typed',
  'Name the strait that separates Spain from Morocco.',
  'The Strait of Gibraltar separates Europe from Africa here.',
  NULL,
  NULL,
  NULL, NULL, NULL,
  NULL, NULL, ARRAY['gibraltar','strait of gibraltar','the strait of gibraltar'], 'Type your answer', NULL, NULL
),
(
  'q-global-explorers-trial', 4, 'boolean',
  'Kazakhstan is a transcontinental country with territory in both Europe and Asia by common geographic definitions.',
  'Western Kazakhstan lies west of the Ural River, often counted as European Russia/Kazakhstan''s European part.',
  NULL,
  NULL,
  NULL, NULL, true,
  NULL, NULL, NULL, NULL, NULL, NULL
),
(
  'q-global-explorers-trial', 5, 'single',
  'Which country is an archipelago sitting between the Indian and Pacific oceans and has Jakarta as its capital?',
  'Jakarta is the capital of Indonesia.',
  NULL,
  '[{"id":"a","label":"Philippines"},{"id":"b","label":"Malaysia"},{"id":"c","label":"Indonesia"},{"id":"d","label":"Papua New Guinea"}]',
  'c', NULL, NULL,
  NULL, NULL, NULL, NULL, NULL, NULL
),
(
  'q-global-explorers-trial', 6, 'multiple',
  'Which countries are crossed by the equator?',
  'Ecuador and Kenya are equatorial. Canada and Germany are not.',
  NULL,
  '[{"id":"a","label":"Canada"},{"id":"b","label":"Ecuador"},{"id":"c","label":"Germany"},{"id":"d","label":"Kenya"}]',
  NULL, ARRAY['b','d'], NULL,
  NULL, NULL, NULL, NULL, NULL, NULL
),
(
  'q-global-explorers-trial', 7, 'single',
  'Which country has a Mediterranean coast and also borders the Black Sea?',
  'Turkey has coasts on the Mediterranean, Aegean, and Black seas.',
  NULL,
  '[{"id":"a","label":"Greece"},{"id":"b","label":"Turkey"},{"id":"c","label":"Italy"},{"id":"d","label":"Spain"}]',
  'b', NULL, NULL,
  NULL, NULL, NULL, NULL, NULL, NULL
),
(
  'q-global-explorers-trial', 8, 'single',
  'The Mekong River reaches the sea in which country?',
  'The Mekong Delta is in southern Vietnam.',
  NULL,
  '[{"id":"a","label":"Thailand"},{"id":"b","label":"Cambodia"},{"id":"c","label":"Vietnam"},{"id":"d","label":"Laos"}]',
  'c', NULL, NULL,
  NULL, NULL, NULL, NULL, NULL, NULL
),
(
  'q-global-explorers-trial', 9, 'boolean',
  'Papua New Guinea shares the island of New Guinea with Indonesia.',
  'The island is split between Papua (Indonesia) and Papua New Guinea.',
  NULL,
  NULL,
  NULL, NULL, true,
  NULL, NULL, NULL, NULL, NULL, NULL
),
(
  'q-global-explorers-trial', 10, 'typed',
  'Name the country whose capital is Tbilisi.',
  'Tbilisi is the capital of Georgia in the Caucasus.',
  NULL,
  NULL,
  NULL, NULL, NULL,
  NULL, NULL, ARRAY['georgia'], 'Type your answer', NULL, NULL
)
on conflict (quiz_id, position) do nothing;

-- ─── q-cartographers-gauntlet (10 questions) ─────────────────────────────────────────
insert into public.quiz_questions (
  quiz_id, position, type, prompt, explanation, media,
  options, answer_id, answer_ids, answer_bool,
  regions, board_art, accepted, placeholder, items, targets
)
values
(
  'q-cartographers-gauntlet', 1, 'single',
  'Which country has a short coastline on the Gulf of Aqaba at the city of Aqaba?',
  'Jordan''s only sea outlet is a short Gulf of Aqaba coast at Aqaba.',
  NULL,
  '[{"id":"a","label":"Iraq"},{"id":"b","label":"Jordan"},{"id":"c","label":"Syria"},{"id":"d","label":"Lebanon"}]',
  'b', NULL, NULL,
  NULL, NULL, NULL, NULL, NULL, NULL
),
(
  'q-cartographers-gauntlet', 2, 'single',
  'The Wakhan Corridor is a narrow eastward extension of which country?',
  'Afghanistan''s Wakhan Corridor was drawn to separate the Russian and British empires.',
  NULL,
  '[{"id":"a","label":"Pakistan"},{"id":"b","label":"Afghanistan"},{"id":"c","label":"Tajikistan"},{"id":"d","label":"Iran"}]',
  'b', NULL, NULL,
  NULL, NULL, NULL, NULL, NULL, NULL
),
(
  'q-cartographers-gauntlet', 3, 'typed',
  'Name the country that owns the exclave of Nakhchivan (an autonomous republic separated from the mainland).',
  'Nakhchivan is an Azerbaijani exclave bordering Armenia, Iran, and Turkey.',
  NULL,
  NULL,
  NULL, NULL, NULL,
  NULL, NULL, ARRAY['azerbaijan'], 'Type your answer', NULL, NULL
),
(
  'q-cartographers-gauntlet', 4, 'boolean',
  'Point Roberts, Washington, is a U.S. community that is not reachable by land from the rest of the contiguous United States without entering Canada.',
  'The 49th parallel leaves Point Roberts attached only through British Columbia.',
  NULL,
  NULL,
  NULL, NULL, true,
  NULL, NULL, NULL, NULL, NULL, NULL
),
(
  'q-cartographers-gauntlet', 5, 'single',
  'Which African country has a coastline on both the Atlantic and Indian oceans?',
  'South Africa wraps the southern tip; Mozambique is Indian-only; Namibia is Atlantic-only.',
  NULL,
  '[{"id":"a","label":"Namibia"},{"id":"b","label":"Mozambique"},{"id":"c","label":"South Africa"},{"id":"d","label":"Angola"}]',
  'c', NULL, NULL,
  NULL, NULL, NULL, NULL, NULL, NULL
),
(
  'q-cartographers-gauntlet', 6, 'multiple',
  'Which territories are exclaves of a country (not independent states)?',
  'Kaliningrad (Russia) and Ceuta (Spain) are exclaves/territories. Lesotho and San Marino are independent states.',
  NULL,
  '[{"id":"a","label":"Kaliningrad"},{"id":"b","label":"Lesotho"},{"id":"c","label":"Ceuta"},{"id":"d","label":"San Marino"}]',
  NULL, ARRAY['a','c'], NULL,
  NULL, NULL, NULL, NULL, NULL, NULL
),
(
  'q-cartographers-gauntlet', 7, 'single',
  'Which of these countries has both a Caspian Sea coast and a land border with Azerbaijan?',
  'Russia borders Azerbaijan on land and also has a Caspian coastline. Armenia and Georgia have no Caspian coast. Turkey has a short land border with Azerbaijan''s Nakhchivan exclave but no Caspian coast.',
  NULL,
  '[{"id":"a","label":"Armenia"},{"id":"b","label":"Russia"},{"id":"c","label":"Georgia"},{"id":"d","label":"Turkey"}]',
  'b', NULL, NULL,
  NULL, NULL, NULL, NULL, NULL, NULL
),
(
  'q-cartographers-gauntlet', 8, 'single',
  'Chile''s southern extremity includes Cape Horn. Which neighbour occupies the eastern side of Tierra del Fuego''s main island?',
  'Argentina holds the eastern portion of Isla Grande de Tierra del Fuego.',
  NULL,
  '[{"id":"a","label":"Bolivia"},{"id":"b","label":"Argentina"},{"id":"c","label":"Uruguay"},{"id":"d","label":"Paraguay"}]',
  'b', NULL, NULL,
  NULL, NULL, NULL, NULL, NULL, NULL
),
(
  'q-cartographers-gauntlet', 9, 'boolean',
  'Bangladesh almost surrounds several Indian enclaves in the historic Cooch Behar complex, though most were exchanged in 2015.',
  'The 2015 India–Bangladesh Land Boundary Agreement exchanged the great majority of those enclaves.',
  NULL,
  NULL,
  NULL, NULL, true,
  NULL, NULL, NULL, NULL, NULL, NULL
),
(
  'q-cartographers-gauntlet', 10, 'typed',
  'Name the country of the Caprivi (Zambezi) Strip.',
  'The Caprivi Strip is part of Namibia.',
  NULL,
  NULL,
  NULL, NULL, NULL,
  NULL, NULL, ARRAY['namibia'], 'Type your answer', NULL, NULL
)
on conflict (quiz_id, position) do nothing;

-- ─── q-enclave-enigma (10 questions) ─────────────────────────────────────────
insert into public.quiz_questions (
  quiz_id, position, type, prompt, explanation, media,
  options, answer_id, answer_ids, answer_bool,
  regions, board_art, accepted, placeholder, items, targets
)
values
(
  'q-enclave-enigma', 1, 'single',
  'Which sovereign country is entirely surrounded by South Africa?',
  'Lesotho is a true enclave state.',
  NULL,
  '[{"id":"a","label":"Eswatini"},{"id":"b","label":"Lesotho"},{"id":"c","label":"Botswana"},{"id":"d","label":"Lesotho and Eswatini both are"}]',
  'b', NULL, NULL,
  NULL, NULL, NULL, NULL, NULL, NULL
),
(
  'q-enclave-enigma', 2, 'single',
  'Which sovereign country is entirely surrounded by Italy (besides Vatican City)?',
  'San Marino is an independent enclave on the Italian peninsula. Vatican City is also surrounded by Italy.',
  NULL,
  '[{"id":"a","label":"Monaco"},{"id":"b","label":"San Marino"},{"id":"c","label":"Andorra"},{"id":"d","label":"Malta"}]',
  'b', NULL, NULL,
  NULL, NULL, NULL, NULL, NULL, NULL
),
(
  'q-enclave-enigma', 3, 'typed',
  'Name the sovereign country entirely surrounded by Italy that is a UN observer state''s seat and covers less than 1 km².',
  'Vatican City is the enclave inside Rome.',
  NULL,
  NULL,
  NULL, NULL, NULL,
  NULL, NULL, ARRAY['vatican city','vatican','holy see'], 'Type your answer', NULL, NULL
),
(
  'q-enclave-enigma', 4, 'boolean',
  'Eswatini (Swaziland) is completely surrounded by South Africa.',
  'Eswatini is bordered by South Africa and Mozambique — it is not a complete enclave.',
  NULL,
  NULL,
  NULL, NULL, false,
  NULL, NULL, NULL, NULL, NULL, NULL
),
(
  'q-enclave-enigma', 5, 'single',
  'Cabinda is an exclave of which country, separated by a sliver of the Democratic Republic of the Congo?',
  'Cabinda is an Angolan exclave north of the Congo River mouth.',
  NULL,
  '[{"id":"a","label":"Republic of the Congo"},{"id":"b","label":"Angola"},{"id":"c","label":"Gabon"},{"id":"d","label":"Cameroon"}]',
  'b', NULL, NULL,
  NULL, NULL, NULL, NULL, NULL, NULL
),
(
  'q-enclave-enigma', 6, 'multiple',
  'Which are independent enclave or nearly-enclave countries?',
  'Lesotho and San Marino are independent enclaves (San Marino and Vatican inside Italy). Kaliningrad is Russian territory; Macau is a Chinese SAR.',
  NULL,
  '[{"id":"a","label":"Lesotho"},{"id":"b","label":"Kaliningrad"},{"id":"c","label":"San Marino"},{"id":"d","label":"Macau"}]',
  NULL, ARRAY['a','c'], NULL,
  NULL, NULL, NULL, NULL, NULL, NULL
),
(
  'q-enclave-enigma', 7, 'single',
  'Vorukh is an exclave belonging to which country?',
  'Vorukh is a Tajik exclave located inside Kyrgyzstan in the Fergana Valley.',
  NULL,
  '[{"id":"a","label":"Uzbekistan"},{"id":"b","label":"Tajikistan"},{"id":"c","label":"Kyrgyzstan"},{"id":"d","label":"Kazakhstan"}]',
  'b', NULL, NULL,
  NULL, NULL, NULL, NULL, NULL, NULL
),
(
  'q-enclave-enigma', 8, 'single',
  'Ceuta and Melilla are Spanish cities on the coast of which African country?',
  'Both border Morocco.',
  NULL,
  '[{"id":"a","label":"Algeria"},{"id":"b","label":"Morocco"},{"id":"c","label":"Tunisia"},{"id":"d","label":"Mauritania"}]',
  'b', NULL, NULL,
  NULL, NULL, NULL, NULL, NULL, NULL
),
(
  'q-enclave-enigma', 9, 'boolean',
  'Monaco is an enclave entirely surrounded by France.',
  'Monaco is a coastal microstate bordered by France on land and the Mediterranean on the sea — not a complete land enclave.',
  NULL,
  NULL,
  NULL, NULL, false,
  NULL, NULL, NULL, NULL, NULL, NULL
),
(
  'q-enclave-enigma', 10, 'typed',
  'Name the West African country that forms a narrow enclave-like strip along a river and is surrounded on three sides by Senegal.',
  'The Gambia follows the Gambia River and is surrounded by Senegal except for its Atlantic coast.',
  NULL,
  NULL,
  NULL, NULL, NULL,
  NULL, NULL, ARRAY['gambia','the gambia'], 'Type your answer', NULL, NULL
)
on conflict (quiz_id, position) do nothing;

-- ─── q-microstate-mastermind (10 questions) ─────────────────────────────────────────
insert into public.quiz_questions (
  quiz_id, position, type, prompt, explanation, media,
  options, answer_id, answer_ids, answer_bool,
  regions, board_art, accepted, placeholder, items, targets
)
values
(
  'q-microstate-mastermind', 1, 'single',
  'What is the capital of Liechtenstein?',
  'Vaduz is Liechtenstein''s capital.',
  NULL,
  '[{"id":"a","label":"Vaduz"},{"id":"b","label":"Schaan"},{"id":"c","label":"Bregenz"},{"id":"d","label":"Chur"}]',
  'a', NULL, NULL,
  NULL, NULL, NULL, NULL, NULL, NULL
),
(
  'q-microstate-mastermind', 2, 'single',
  'Which microstate lies on the French Riviera and has French as its official language?',
  'Monaco sits on the Côte d''Azur; its official language is French.',
  NULL,
  '[{"id":"a","label":"Andorra"},{"id":"b","label":"Monaco"},{"id":"c","label":"San Marino"},{"id":"d","label":"Malta"}]',
  'b', NULL, NULL,
  NULL, NULL, NULL, NULL, NULL, NULL
),
(
  'q-microstate-mastermind', 3, 'typed',
  'Name the capital of San Marino.',
  'The City of San Marino (Città di San Marino) is the capital.',
  NULL,
  NULL,
  NULL, NULL, NULL,
  NULL, NULL, ARRAY['san marino','citta di san marino','città di san marino'], 'Type your answer', NULL, NULL
),
(
  'q-microstate-mastermind', 4, 'boolean',
  'Andorra is landlocked between France and Spain.',
  'Andorra sits in the eastern Pyrenees between those two states.',
  NULL,
  NULL,
  NULL, NULL, true,
  NULL, NULL, NULL, NULL, NULL, NULL
),
(
  'q-microstate-mastermind', 5, 'single',
  'Which Pacific microstate was the world''s smallest republic by area for many years and has Yaren as its district (de facto capital)?',
  'Nauru uses Yaren as the seat of government; it has no official capital city.',
  NULL,
  '[{"id":"a","label":"Tuvalu"},{"id":"b","label":"Nauru"},{"id":"c","label":"Palau"},{"id":"d","label":"Marshall Islands"}]',
  'b', NULL, NULL,
  NULL, NULL, NULL, NULL, NULL, NULL
),
(
  'q-microstate-mastermind', 6, 'multiple',
  'Which of these are European microstates?',
  'Malta and Andorra are sovereign European microstates. Luxembourg is small but not usually grouped with the tiniest five; Singapore is in Asia. Wait: Luxembourg is a European state but larger. Include Malta and Andorra. Singapore is Asian; Qatar is Asian.',
  NULL,
  '[{"id":"a","label":"Malta"},{"id":"b","label":"Singapore"},{"id":"c","label":"Andorra"},{"id":"d","label":"Qatar"}]',
  NULL, ARRAY['a','c'], NULL,
  NULL, NULL, NULL, NULL, NULL, NULL
),
(
  'q-microstate-mastermind', 7, 'single',
  'What is the capital of Malta?',
  'Valletta is Malta''s capital.',
  NULL,
  '[{"id":"a","label":"Mdina"},{"id":"b","label":"Valletta"},{"id":"c","label":"Sliema"},{"id":"d","label":"Birgu"}]',
  'b', NULL, NULL,
  NULL, NULL, NULL, NULL, NULL, NULL
),
(
  'q-microstate-mastermind', 8, 'single',
  'Which microstate uses the Swiss franc and is in customs union with Switzerland?',
  'Liechtenstein uses the Swiss franc and maintains an open border/customs relationship with Switzerland.',
  NULL,
  '[{"id":"a","label":"Monaco"},{"id":"b","label":"Liechtenstein"},{"id":"c","label":"San Marino"},{"id":"d","label":"Andorra"}]',
  'b', NULL, NULL,
  NULL, NULL, NULL, NULL, NULL, NULL
),
(
  'q-microstate-mastermind', 9, 'boolean',
  'Vatican City''s official languages include Italian, and Latin is used in official documents of the Holy See.',
  'Italian is used in daily administration; Latin remains an official language of the Holy See.',
  NULL,
  NULL,
  NULL, NULL, true,
  NULL, NULL, NULL, NULL, NULL, NULL
),
(
  'q-microstate-mastermind', 10, 'typed',
  'Name the capital of Andorra.',
  'Andorra la Vella is the capital.',
  NULL,
  NULL,
  NULL, NULL, NULL,
  NULL, NULL, ARRAY['andorra la vella'], 'Type your answer', NULL, NULL
)
on conflict (quiz_id, position) do nothing;

-- ─── q-latitude-longitude-elite (10 questions) ─────────────────────────────────────────
insert into public.quiz_questions (
  quiz_id, position, type, prompt, explanation, media,
  options, answer_id, answer_ids, answer_bool,
  regions, board_art, accepted, placeholder, items, targets
)
values
(
  'q-latitude-longitude-elite', 1, 'single',
  'A position near 1°S, 37°E is most likely in which country?',
  'That coordinate sits in southern Kenya, inland from the Indian Ocean.',
  NULL,
  '[{"id":"a","label":"Ethiopia"},{"id":"b","label":"Kenya"},{"id":"c","label":"Somalia"},{"id":"d","label":"Yemen"}]',
  'b', NULL, NULL,
  NULL, NULL, NULL, NULL, NULL, NULL
),
(
  'q-latitude-longitude-elite', 2, 'single',
  'Which country is crossed by the Prime Meridian (0° longitude)?',
  'The Prime Meridian passes through the United Kingdom (and several other countries). Of these options, the United Kingdom is correct.',
  NULL,
  '[{"id":"a","label":"Japan"},{"id":"b","label":"United Kingdom"},{"id":"c","label":"India"},{"id":"d","label":"United States"}]',
  'b', NULL, NULL,
  NULL, NULL, NULL, NULL, NULL, NULL
),
(
  'q-latitude-longitude-elite', 3, 'typed',
  'Which tropic line (Cancer or Capricorn) crosses Australia?',
  'The Tropic of Capricorn crosses the Australian continent.',
  NULL,
  NULL,
  NULL, NULL, NULL,
  NULL, NULL, ARRAY['capricorn','tropic of capricorn','the tropic of capricorn'], 'Type your answer', NULL, NULL
),
(
  'q-latitude-longitude-elite', 4, 'boolean',
  'All of Argentina lies south of the equator.',
  'Argentina is entirely in the Southern Hemisphere.',
  NULL,
  NULL,
  NULL, NULL, true,
  NULL, NULL, NULL, NULL, NULL, NULL
),
(
  'q-latitude-longitude-elite', 5, 'single',
  'A location near 64°N, 22°W is most likely in which country?',
  'That coordinate is in western Iceland.',
  NULL,
  '[{"id":"a","label":"Norway"},{"id":"b","label":"Iceland"},{"id":"c","label":"Greenland"},{"id":"d","label":"Ireland"}]',
  'b', NULL, NULL,
  NULL, NULL, NULL, NULL, NULL, NULL
),
(
  'q-latitude-longitude-elite', 6, 'multiple',
  'Which countries are crossed by the Tropic of Cancer?',
  'Mexico and India are crossed by the Tropic of Cancer. New Zealand and Sweden are not.',
  NULL,
  '[{"id":"a","label":"Mexico"},{"id":"b","label":"New Zealand"},{"id":"c","label":"India"},{"id":"d","label":"Sweden"}]',
  NULL, ARRAY['a','c'], NULL,
  NULL, NULL, NULL, NULL, NULL, NULL
),
(
  'q-latitude-longitude-elite', 7, 'single',
  'Which statement about Chile is correct?',
  'Mainland Chile runs through many southern latitudes and crosses the Tropic of Capricorn in the north; it does not reach the equator.',
  NULL,
  '[{"id":"a","label":"It is crossed by the equator"},{"id":"b","label":"Its mainland is entirely north of the Tropic of Cancer"},{"id":"c","label":"Its mainland crosses the Tropic of Capricorn"},{"id":"d","label":"It lies entirely inside the Arctic Circle"}]',
  'c', NULL, NULL,
  NULL, NULL, NULL, NULL, NULL, NULL
),
(
  'q-latitude-longitude-elite', 8, 'single',
  'The equator (0° latitude) does NOT cross which country?',
  'Colombia is equatorial. Canada is not.',
  NULL,
  '[{"id":"a","label":"Ecuador"},{"id":"b","label":"Colombia"},{"id":"c","label":"Canada"},{"id":"d","label":"Indonesia"}]',
  'c', NULL, NULL,
  NULL, NULL, NULL, NULL, NULL, NULL
),
(
  'q-latitude-longitude-elite', 9, 'boolean',
  'New Zealand''s North and South Islands both lie entirely south of the Tropic of Capricorn.',
  'The Tropic of Capricorn is about 23.5°S. New Zealand''s main islands lie roughly 34–47°S.',
  NULL,
  NULL,
  NULL, NULL, true,
  NULL, NULL, NULL, NULL, NULL, NULL
),
(
  'q-latitude-longitude-elite', 10, 'typed',
  'Name the hemisphere (northern or southern) that contains all of Scandinavia.',
  'Scandinavia is entirely in the Northern Hemisphere.',
  NULL,
  NULL,
  NULL, NULL, NULL,
  NULL, NULL, ARRAY['northern','north','northern hemisphere'], 'Type your answer', NULL, NULL
)
on conflict (quiz_id, position) do nothing;

-- ─── q-the-final-atlas (10 questions) ─────────────────────────────────────────
insert into public.quiz_questions (
  quiz_id, position, type, prompt, explanation, media,
  options, answer_id, answer_ids, answer_bool,
  regions, board_art, accepted, placeholder, items, targets
)
values
(
  'q-the-final-atlas', 1, 'single',
  'Which country has both a Mediterranean coast and a land border with Iran?',
  'Turkey borders Iran and has a Mediterranean coast. Iraq borders Iran but is not Mediterranean; Syria does not border Iran.',
  NULL,
  '[{"id":"a","label":"Iraq"},{"id":"b","label":"Turkey"},{"id":"c","label":"Syria"},{"id":"d","label":"Armenia"}]',
  'b', NULL, NULL,
  NULL, NULL, NULL, NULL, NULL, NULL
),
(
  'q-the-final-atlas', 2, 'single',
  'What is the capital of Kazakhstan (restored name in 2022)?',
  'The capital is Astana (the name Nur-Sultan was used 2019–2022).',
  NULL,
  '[{"id":"a","label":"Almaty"},{"id":"b","label":"Astana"},{"id":"c","label":"Shymkent"},{"id":"d","label":"Karaganda"}]',
  'b', NULL, NULL,
  NULL, NULL, NULL, NULL, NULL, NULL
),
(
  'q-the-final-atlas', 3, 'typed',
  'Name the capital of Bhutan.',
  'Thimphu is Bhutan''s capital.',
  NULL,
  NULL,
  NULL, NULL, NULL,
  NULL, NULL, ARRAY['thimphu'], 'Type your answer', NULL, NULL
),
(
  'q-the-final-atlas', 4, 'boolean',
  'The Caspian Sea is a salt lake bordered by five countries, including Turkmenistan.',
  'The Caspian littoral states are Russia, Kazakhstan, Turkmenistan, Iran, and Azerbaijan.',
  NULL,
  NULL,
  NULL, NULL, true,
  NULL, NULL, NULL, NULL, NULL, NULL
),
(
  'q-the-final-atlas', 5, 'single',
  'Which country is doubly landlocked?',
  'Uzbekistan is surrounded only by landlocked countries (as is Liechtenstein).',
  NULL,
  '[{"id":"a","label":"Mongolia"},{"id":"b","label":"Uzbekistan"},{"id":"c","label":"Afghanistan"},{"id":"d","label":"Azerbaijan"}]',
  'b', NULL, NULL,
  NULL, NULL, NULL, NULL, NULL, NULL
),
(
  'q-the-final-atlas', 6, 'multiple',
  'Which countries have no coastline?',
  'Bolivia and Bhutan are landlocked. Peru and Oman have coasts.',
  NULL,
  '[{"id":"a","label":"Peru"},{"id":"b","label":"Bolivia"},{"id":"c","label":"Oman"},{"id":"d","label":"Bhutan"}]',
  NULL, ARRAY['b','d'], NULL,
  NULL, NULL, NULL, NULL, NULL, NULL
),
(
  'q-the-final-atlas', 7, 'single',
  'Which African country has a slender Atlantic coastline and is otherwise surrounded by Senegal?',
  'The Gambia.',
  NULL,
  '[{"id":"a","label":"Guinea-Bissau"},{"id":"b","label":"The Gambia"},{"id":"c","label":"Sierra Leone"},{"id":"d","label":"Liberia"}]',
  'b', NULL, NULL,
  NULL, NULL, NULL, NULL, NULL, NULL
),
(
  'q-the-final-atlas', 8, 'single',
  'Which capital sits closest to 4°N, 74°W?',
  'That coordinate is near Bogotá, Colombia.',
  NULL,
  '[{"id":"a","label":"Quito"},{"id":"b","label":"Bogotá"},{"id":"c","label":"Caracas"},{"id":"d","label":"Lima"}]',
  'b', NULL, NULL,
  NULL, NULL, NULL, NULL, NULL, NULL
),
(
  'q-the-final-atlas', 9, 'boolean',
  'Singapore is a sovereign city-state at the southern tip of the Malay Peninsula.',
  'Singapore is an independent republic just south of Johor, Malaysia.',
  NULL,
  NULL,
  NULL, NULL, true,
  NULL, NULL, NULL, NULL, NULL, NULL
),
(
  'q-the-final-atlas', 10, 'typed',
  'Name the country whose capital is Yerevan.',
  'Yerevan is the capital of Armenia.',
  NULL,
  NULL,
  NULL, NULL, NULL,
  NULL, NULL, ARRAY['armenia'], 'Type your answer', NULL, NULL
)
on conflict (quiz_id, position) do nothing;

