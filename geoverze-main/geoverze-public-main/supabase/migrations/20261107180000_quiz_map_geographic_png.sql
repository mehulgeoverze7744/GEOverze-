-- Point Pin the Place (and other map questions) at geographic PNG boards
-- instead of the legacy abstract SVG silhouettes. Idempotent.

UPDATE public.quiz_questions
SET board_art = CASE
  WHEN board_art IN ('map-africa', '/assets/maps/africa.svg') THEN '/assets/maps/africa.png'
  WHEN board_art IN ('map-europe', '/assets/maps/europe.svg') THEN '/assets/maps/europe.png'
  WHEN board_art IN ('map-asia', '/assets/maps/asia.svg') THEN '/assets/maps/asia.png'
  WHEN board_art IN ('map-samerica', '/assets/maps/south-america.svg') THEN '/assets/maps/south-america.png'
  WHEN board_art IN ('map-oceania', '/assets/maps/oceania.svg') THEN '/assets/maps/oceania.png'
  WHEN board_art IN ('map-world', '/assets/maps/world.svg') THEN '/assets/maps/world.png'
  WHEN board_art IN ('map-namerica', 'map-north-america', '/assets/maps/north-america.svg') THEN '/assets/maps/north-america.png'
  WHEN board_art IN ('projection', 'mercator', 'map-mercator') THEN '/assets/maps/mercator.jpg'
  ELSE board_art
END
WHERE type = 'map'
  AND board_art IS NOT NULL;

-- Pin percents measured against the geographic PNGs (object-contained).
UPDATE public.quiz_questions
SET regions = '[
  {"id":"a","label":"Strait of Gibraltar","x":22,"y":81},
  {"id":"b","label":"Bosphorus","x":71,"y":63},
  {"id":"c","label":"Øresund","x":49,"y":45},
  {"id":"d","label":"English Channel","x":26,"y":54}
]'::jsonb
WHERE quiz_id = 'q-pin-the-place' AND position = 1 AND type = 'map';

UPDATE public.quiz_questions
SET regions = '[
  {"id":"a","label":"Perth coast","x":12,"y":58},
  {"id":"b","label":"Great Barrier Reef","x":90,"y":32},
  {"id":"c","label":"Tasmania","x":78,"y":93},
  {"id":"d","label":"Gulf of Carpentaria","x":57,"y":18}
]'::jsonb
WHERE quiz_id = 'q-pin-the-place' AND position = 2 AND type = 'map';

UPDATE public.quiz_questions
SET regions = '[
  {"id":"a","label":"Atacama","x":24,"y":42},
  {"id":"b","label":"Amazon Basin","x":54,"y":30},
  {"id":"c","label":"Patagonia","x":30,"y":84},
  {"id":"d","label":"Pampas","x":44,"y":70}
]'::jsonb
WHERE quiz_id = 'q-pin-the-place' AND position = 5 AND type = 'map';

UPDATE public.quiz_questions
SET regions = '[
  {"id":"a","label":"Ural Mountains","x":20,"y":26},
  {"id":"b","label":"Himalaya","x":40,"y":44},
  {"id":"c","label":"Japanese archipelago","x":88,"y":38},
  {"id":"d","label":"Arabian Peninsula","x":15,"y":52}
]'::jsonb
WHERE quiz_id = 'q-pin-the-place' AND position = 9 AND type = 'map';

UPDATE public.quiz_questions
SET regions = '[
  {"id":"a","label":"Dakar","x":10,"y":30},
  {"id":"b","label":"Cairo","x":52,"y":11},
  {"id":"c","label":"Nairobi","x":58,"y":50},
  {"id":"d","label":"Cape Town","x":40,"y":88}
]'::jsonb
WHERE quiz_id = 'q-capital-cities' AND position = 6 AND type = 'map';

UPDATE public.quiz_questions
SET regions = '[
  {"id":"a","label":"Marrakesh","x":16,"y":14},
  {"id":"b","label":"Giza","x":52,"y":12},
  {"id":"c","label":"Lagos","x":26,"y":40},
  {"id":"d","label":"Zanzibar","x":58,"y":55}
]'::jsonb
WHERE quiz_id = 'q-monuments' AND position = 9 AND type = 'map';
