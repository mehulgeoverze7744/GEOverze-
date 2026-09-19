-- Europe's smallest states — atlas-parchment editorial content

update public.library_resources
set
  title = 'Europe''s Smallest States',
  dek = 'Six tiny countries, six very different stories of survival, sovereignty and identity.',
  read_time_minutes = 18,
  tags = array['europe','microstates','countries','vatican','history']
where id = '66cc187f-e761-47c7-a671-6d9889663ddd';

delete from public.library_resource_blocks where resource_id = '66cc187f-e761-47c7-a671-6d9889663ddd';

insert into public.library_resource_blocks (id, resource_id, position, kind, payload)
values (gen_random_uuid(), '66cc187f-e761-47c7-a671-6d9889663ddd', 0, 'paragraph', '{"text":"Europe''s political map contains a handful of countries so small that they can disappear into the spaces between their larger neighbours. Yet their size tells only part of the story. Vatican City, Monaco, San Marino, Liechtenstein, Malta and Andorra each occupy a remarkably small territory, but each developed a distinct political identity, culture and historical path."}'::jsonb);

insert into public.library_resource_blocks (id, resource_id, position, kind, payload)
values (gen_random_uuid(), '66cc187f-e761-47c7-a671-6d9889663ddd', 1, 'paragraph', '{"text":"Some survived behind mountains. Others survived through diplomacy, dynastic continuity, religious importance or strategic geography. Their stories show that the survival of a country has never depended on size alone — but on how communities negotiate space, memory and power between much larger neighbours."}'::jsonb);

insert into public.library_resource_blocks (id, resource_id, position, kind, payload)
values (gen_random_uuid(), '66cc187f-e761-47c7-a671-6d9889663ddd', 2, 'paragraph', '{"text":"This entry focuses on six European sovereign states often grouped as microstates. They are not a uniform category: Malta is larger than the others and has a deep maritime history, while Vatican City is unique as the seat of the Holy See. What they share is scale small enough to challenge our assumptions about what a country must look like on a map."}'::jsonb);

insert into public.library_resource_blocks (id, resource_id, position, kind, payload)
values (gen_random_uuid(), '66cc187f-e761-47c7-a671-6d9889663ddd', 3, 'heading', '{"id":"what-is-a-microstate","text":"What makes a European microstate?"}'::jsonb);

insert into public.library_resource_blocks (id, resource_id, position, kind, payload)
values (gen_random_uuid(), '66cc187f-e761-47c7-a671-6d9889663ddd', 4, 'paragraph', '{"text":"In everyday language, a microstate usually means an exceptionally small sovereign state — small in territory, population, or both. There is no single legal definition in international law, but the term helps us notice countries whose physical footprint is tiny compared with their neighbours. In Europe, Vatican City, Monaco, San Marino, Liechtenstein, Malta and Andorra are often discussed together for that reason."}'::jsonb);

insert into public.library_resource_blocks (id, resource_id, position, kind, payload)
values (gen_random_uuid(), '66cc187f-e761-47c7-a671-6d9889663ddd', 5, 'paragraph', '{"text":"Crucially, they did not all survive for the same reason. Geography mattered on Mount Titano and in the Pyrenees; dynastic continuity shaped Monaco and Liechtenstein; religious authority anchored Vatican City; Malta''s central Mediterranean position drew empires for millennia; Andorra''s co-principality grew from medieval charters. Diplomacy, legal institutions and economic adaptation appear again and again — but in different combinations."}'::jsonb);

insert into public.library_resource_blocks (id, resource_id, position, kind, payload)
values (gen_random_uuid(), '66cc187f-e761-47c7-a671-6d9889663ddd', 6, 'list', '{"items":["Geography and defensive terrain that made conquest costly or pointless","Careful diplomacy with powerful neighbours","Distinct political institutions that outlasted surrounding empires","Dynastic continuity and negotiated sovereignty","Religious or strategic importance disproportionate to area","Economic adaptation — from pilgrimage to finance, tourism and services"]}'::jsonb);

insert into public.library_resource_blocks (id, resource_id, position, kind, payload)
values (gen_random_uuid(), '66cc187f-e761-47c7-a671-6d9889663ddd', 7, 'heading', '{"id":"vatican-city","text":"01 — Vatican City"}'::jsonb);

insert into public.library_resource_blocks (id, resource_id, position, kind, payload)
values (gen_random_uuid(), '66cc187f-e761-47c7-a671-6d9889663ddd', 8, 'paragraph', '{"text":"Vatican City is the world''s smallest independent state by territory. The modern state was established through the Lateran Treaty of 1929 between the Holy See and Italy, defining its current boundaries within Rome. Its area is approximately 0.44 km² — smaller than many urban parks — yet its historical importance is tied to St. Peter''s Basilica, the papacy and centuries of religious and cultural influence that long predate the twentieth-century state."}'::jsonb);

insert into public.library_resource_blocks (id, resource_id, position, kind, payload)
values (gen_random_uuid(), '66cc187f-e761-47c7-a671-6d9889663ddd', 9, 'paragraph', '{"text":"The Vatican''s story is not limited to 1929. For generations, the temporal authority of the popes intersected with Italian politics until the treaty created a sovereign enclave. Today, Vatican City functions as the administrative and ceremonial centre of the Catholic Church while remaining a distinct subject of international law. Religious significance gives this territory an influence far larger than its physical size."}'::jsonb);

insert into public.library_resource_blocks (id, resource_id, position, kind, payload)
values (gen_random_uuid(), '66cc187f-e761-47c7-a671-6d9889663ddd', 10, 'image', '{"art":"article-vatican","caption":"St. Peter''s Square and Basilica — the heart of Vatican City.","external_src":"https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/Angelus_1637.jpg/1280px-Angelus_1637.jpg","credit":"Photo: Wikimedia Commons (public domain)"}'::jsonb);

insert into public.library_resource_blocks (id, resource_id, position, kind, payload)
values (gen_random_uuid(), '66cc187f-e761-47c7-a671-6d9889663ddd', 11, 'facts', '{"title":"Vatican City at a glance","facts":[{"label":"Area","value":"≈ 0.44 km²"},{"label":"Established as a state","value":"1929 (Lateran Treaty)"},{"label":"Location","value":"Rome, Italy"}]}'::jsonb);

insert into public.library_resource_blocks (id, resource_id, position, kind, payload)
values (gen_random_uuid(), '66cc187f-e761-47c7-a671-6d9889663ddd', 12, 'heading', '{"id":"monaco","text":"02 — Monaco"}'::jsonb);

insert into public.library_resource_blocks (id, resource_id, position, kind, payload)
values (gen_random_uuid(), '66cc187f-e761-47c7-a671-6d9889663ddd', 13, 'paragraph', '{"text":"Monaco covers roughly 2.02 km² on the Mediterranean coast, pressed against the French Riviera. The Grimaldi family became associated with the Rock of Monaco in 1297, and over centuries the principality developed a distinctive identity shaped by sea access, proximity to France and a talent for reinvention. From fortification to resort economy, Monaco''s coastal geography helped define its modern character."}'::jsonb);

insert into public.library_resource_blocks (id, resource_id, position, kind, payload)
values (gen_random_uuid(), '66cc187f-e761-47c7-a671-6d9889663ddd', 14, 'paragraph', '{"text":"The nineteenth and twentieth centuries brought famous transformations: the opening of the casino district linked to Monte Carlo in 1863, constitutional development in 1911, and eventual full membership in the United Nations in 1993. Tourism, finance and events such as the Grand Prix turned limited land into global name recognition — a reminder that microstates can leverage location and branding as much as farmland or minerals."}'::jsonb);

insert into public.library_resource_blocks (id, resource_id, position, kind, payload)
values (gen_random_uuid(), '66cc187f-e761-47c7-a671-6d9889663ddd', 15, 'image', '{"art":"article-monaco","caption":"Monaco''s densely built coastline on the Mediterranean.","external_src":"https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Monaco_Monte_Carlo_1.jpg/1280px-Monaco_Monte_Carlo_1.jpg","credit":"Photo: Wikimedia Commons (CC BY-SA 3.0)"}'::jsonb);

insert into public.library_resource_blocks (id, resource_id, position, kind, payload)
values (gen_random_uuid(), '66cc187f-e761-47c7-a671-6d9889663ddd', 16, 'facts', '{"title":"Monaco at a glance","facts":[{"label":"Area","value":"≈ 2.02 km²"},{"label":"Location","value":"French Riviera / Mediterranean"},{"label":"Dynasty","value":"Grimaldi"}]}'::jsonb);

insert into public.library_resource_blocks (id, resource_id, position, kind, payload)
values (gen_random_uuid(), '66cc187f-e761-47c7-a671-6d9889663ddd', 17, 'list', '{"items":["1297 — Grimaldi connection with the Rock of Monaco begins","1863 — Casino opens, shaping Monte Carlo''s economy","1911 — First constitution","1993 — Monaco joins the United Nations"],"ordered":true}'::jsonb);

insert into public.library_resource_blocks (id, resource_id, position, kind, payload)
values (gen_random_uuid(), '66cc187f-e761-47c7-a671-6d9889663ddd', 18, 'heading', '{"id":"san-marino","text":"03 — San Marino"}'::jsonb);

insert into public.library_resource_blocks (id, resource_id, position, kind, payload)
values (gen_random_uuid(), '66cc187f-e761-47c7-a671-6d9889663ddd', 19, 'paragraph', '{"text":"San Marino is landlocked within Italy, centred on Mount Titano and its famous towered skyline. Tradition links the community to Saint Marinus and a foundation date of 301 CE; that narrative is culturally central, but historians distinguish tradition from documentary evidence. The earliest documentary reference to an organized community on the mountain dates to 885, after which institutions and alliances developed across the medieval and early modern periods."}'::jsonb);

insert into public.library_resource_blocks (id, resource_id, position, kind, payload)
values (gen_random_uuid(), '66cc187f-e761-47c7-a671-6d9889663ddd', 20, 'paragraph', '{"text":"Mount Titano''s steep terrain mattered. Defensible heights, limited access routes and a reputation for autonomy helped San Marino navigate the patchwork of Italian states. Its councils and captains-regent became symbols of long republican continuity — a political personality distinct from neighbouring monarchies and empires even as the surrounding map changed."}'::jsonb);

insert into public.library_resource_blocks (id, resource_id, position, kind, payload)
values (gen_random_uuid(), '66cc187f-e761-47c7-a671-6d9889663ddd', 21, 'image', '{"art":"article-san-marino","caption":"Guaita Tower on Mount Titano, San Marino.","external_src":"https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Guaita_Tower_San_Marino.jpg/1280px-Guaita_Tower_San_Marino.jpg","credit":"Photo: Wikimedia Commons (CC BY 2.0)"}'::jsonb);

insert into public.library_resource_blocks (id, resource_id, position, kind, payload)
values (gen_random_uuid(), '66cc187f-e761-47c7-a671-6d9889663ddd', 22, 'facts', '{"title":"San Marino at a glance","facts":[{"label":"Area","value":"≈ 61 km²"},{"label":"Location","value":"Within Italy"},{"label":"Mount","value":"Mount Titano"}]}'::jsonb);

insert into public.library_resource_blocks (id, resource_id, position, kind, payload)
values (gen_random_uuid(), '66cc187f-e761-47c7-a671-6d9889663ddd', 23, 'quote', '{"text":"301 CE is traditionally associated with the foundation of San Marino; documentary evidence for an organized community appears much later.","attribution":"History note"}'::jsonb);

insert into public.library_resource_blocks (id, resource_id, position, kind, payload)
values (gen_random_uuid(), '66cc187f-e761-47c7-a671-6d9889663ddd', 24, 'heading', '{"id":"liechtenstein","text":"04 — Liechtenstein"}'::jsonb);

insert into public.library_resource_blocks (id, resource_id, position, kind, payload)
values (gen_random_uuid(), '66cc187f-e761-47c7-a671-6d9889663ddd', 25, 'paragraph', '{"text":"Liechtenstein lies between Switzerland and Austria in the upper Rhine valley, with an area of approximately 160 km². The modern principality emerged when the Princes of Liechtenstein combined the Lordship of Schellenberg and the County of Vaduz in the early eighteenth century — a purchase shaped by imperial politics as much as by Alpine scenery. Vaduz Castle, perched above the capital, remains a visual emblem of that princely continuity."}'::jsonb);

insert into public.library_resource_blocks (id, resource_id, position, kind, payload)
values (gen_random_uuid(), '66cc187f-e761-47c7-a671-6d9889663ddd', 26, 'paragraph', '{"text":"Alpine geography and proximity to larger powers influenced Liechtenstein''s development. Without a coastline or vast hinterland, the principality cultivated neutrality, financial services and close economic ties with neighbours. Its political identity is that of a small Alpine monarchy that preserved sovereignty through careful alignment rather than military weight."}'::jsonb);

insert into public.library_resource_blocks (id, resource_id, position, kind, payload)
values (gen_random_uuid(), '66cc187f-e761-47c7-a671-6d9889663ddd', 27, 'image', '{"art":"article-liechtenstein","caption":"Vaduz Castle above the capital of Liechtenstein.","external_src":"https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Vaduz_Castle_situated_on_a_rock.jpg/1280px-Vaduz_Castle_situated_on_a_rock.jpg","credit":"Photo: Wikimedia Commons (CC BY-SA 3.0)"}'::jsonb);

insert into public.library_resource_blocks (id, resource_id, position, kind, payload)
values (gen_random_uuid(), '66cc187f-e761-47c7-a671-6d9889663ddd', 28, 'facts', '{"title":"Liechtenstein at a glance","facts":[{"label":"Area","value":"≈ 160 km²"},{"label":"Location","value":"Between Switzerland and Austria"},{"label":"Capital","value":"Vaduz"}]}'::jsonb);

insert into public.library_resource_blocks (id, resource_id, position, kind, payload)
values (gen_random_uuid(), '66cc187f-e761-47c7-a671-6d9889663ddd', 29, 'heading', '{"id":"malta","text":"05 — Malta"}'::jsonb);

insert into public.library_resource_blocks (id, resource_id, position, kind, payload)
values (gen_random_uuid(), '66cc187f-e761-47c7-a671-6d9889663ddd', 30, 'paragraph', '{"text":"Malta is the largest state in this group — roughly 316 km² — yet it remains among Europe''s smallest sovereign countries. Its archipelago sits at a crossroads of Mediterranean routes, which made it strategically valuable for Phoenician traders, Roman administrators, the Knights of St John, Napoleonic France and the British Empire. More than 7,000 years of human history left megalithic temples, fortified cities and a layered cultural identity."}'::jsonb);

insert into public.library_resource_blocks (id, resource_id, position, kind, payload)
values (gen_random_uuid(), '66cc187f-e761-47c7-a671-6d9889663ddd', 31, 'paragraph', '{"text":"Valletta''s bastions and harbours tell the story of siege and defence; prehistoric sites such as Ħagar Qim speak to deep antiquity. Malta gained independence from Britain in 1964 and became a republic in 1974, translating military geography into modern statehood. Size alone never captured Malta''s importance — location did."}'::jsonb);

insert into public.library_resource_blocks (id, resource_id, position, kind, payload)
values (gen_random_uuid(), '66cc187f-e761-47c7-a671-6d9889663ddd', 32, 'image', '{"art":"article-malta","caption":"Valletta''s fortified skyline above Grand Harbour.","external_src":"https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Valletta_skyline.jpg/1280px-Valletta_skyline.jpg","credit":"Photo: Wikimedia Commons (CC BY-SA 3.0)"}'::jsonb);

insert into public.library_resource_blocks (id, resource_id, position, kind, payload)
values (gen_random_uuid(), '66cc187f-e761-47c7-a671-6d9889663ddd', 33, 'facts', '{"title":"Malta at a glance","facts":[{"label":"History","value":"7,000+ years"},{"label":"Independence","value":"1964"},{"label":"Republic","value":"1974"}]}'::jsonb);

insert into public.library_resource_blocks (id, resource_id, position, kind, payload)
values (gen_random_uuid(), '66cc187f-e761-47c7-a671-6d9889663ddd', 34, 'heading', '{"id":"andorra","text":"06 — Andorra"}'::jsonb);

insert into public.library_resource_blocks (id, resource_id, position, kind, payload)
values (gen_random_uuid(), '66cc187f-e761-47c7-a671-6d9889663ddd', 35, 'paragraph', '{"text":"Andorra occupies about 468 km² in the Pyrenees between France and Spain. Medieval pareatges in 1278 and 1288 shaped a unique co-principality: sovereignty shared between the Bishop of Urgell and the Count of Foix (later the French head of state), a arrangement that persisted in evolved form into the modern era. Mountain valleys and passes helped preserve a political personality distinct from both neighbours."}'::jsonb);

insert into public.library_resource_blocks (id, resource_id, position, kind, payload)
values (gen_random_uuid(), '66cc187f-e761-47c7-a671-6d9889663ddd', 36, 'paragraph', '{"text":"Today Andorra la Vella and mountain resorts illustrate how microstates can combine institutional oddity with tourism-driven economies. Casa de la Vall and other heritage sites recall centuries of local governance. Geography — high peaks, narrow valleys — remained a constant backdrop to Andorra''s survival as a separate polity."}'::jsonb);

insert into public.library_resource_blocks (id, resource_id, position, kind, payload)
values (gen_random_uuid(), '66cc187f-e761-47c7-a671-6d9889663ddd', 37, 'image', '{"art":"article-andorra","caption":"Andorra la Vella in the Pyrenees.","external_src":"https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Andorra_la_Vella_-_view.jpg/1280px-Andorra_la_Vella_-_view.jpg","credit":"Photo: Wikimedia Commons (CC BY-SA 3.0)"}'::jsonb);

insert into public.library_resource_blocks (id, resource_id, position, kind, payload)
values (gen_random_uuid(), '66cc187f-e761-47c7-a671-6d9889663ddd', 38, 'facts', '{"title":"Andorra at a glance","facts":[{"label":"Area","value":"≈ 468 km²"},{"label":"Location","value":"Pyrenees"},{"label":"Capital","value":"Andorra la Vella"},{"label":"Special feature","value":"Two co-princes"}]}'::jsonb);

insert into public.library_resource_blocks (id, resource_id, position, kind, payload)
values (gen_random_uuid(), '66cc187f-e761-47c7-a671-6d9889663ddd', 39, 'heading', '{"id":"how-they-held-on","text":"How did they hold on?"}'::jsonb);

insert into public.library_resource_blocks (id, resource_id, position, kind, payload)
values (gen_random_uuid(), '66cc187f-e761-47c7-a671-6d9889663ddd', 40, 'facts', '{"title":"How did they hold on?","facts":[{"label":"Geography","value":"Mountains, cliffs and difficult terrain protected some states from easy annexation."},{"label":"Diplomacy","value":"Small states often survived by carefully managing relationships with larger neighbours."},{"label":"Dynasties","value":"Long-running ruling families helped preserve continuity in Monaco and Liechtenstein."},{"label":"Religion","value":"Vatican City''s global role flows from its position as the centre of the Catholic Church."},{"label":"Strategic location","value":"Malta''s central Mediterranean position repeatedly made it important to larger powers."},{"label":"Institutions","value":"San Marino and Andorra developed distinctive political institutions that endured for centuries."}],"layout":"survival-cards"}'::jsonb);

insert into public.library_resource_blocks (id, resource_id, position, kind, payload)
values (gen_random_uuid(), '66cc187f-e761-47c7-a671-6d9889663ddd', 41, 'table', '{"title":"Europe''s microstates — by area","columns":["Country","Approx. area","Location","Distinctive historical feature"],"rows":[["Vatican City","0.44 km²","Inside Rome","Lateran Treaty / Holy See"],["Monaco","2.02 km²","Mediterranean coast","Grimaldi dynasty"],["San Marino","61 km²","Surrounded by Italy","Long republican tradition"],["Liechtenstein","160 km²","Between Austria & Switzerland","Alpine principality"],["Malta","≈ 316 km²","Mediterranean","7,000+ years of history"],["Andorra","468 km²","Pyrenees","Co-principality"]]}'::jsonb);

insert into public.library_resource_blocks (id, resource_id, position, kind, payload)
values (gen_random_uuid(), '66cc187f-e761-47c7-a671-6d9889663ddd', 42, 'image', '{"art":"article-microstates-map","caption":"European microstates in continental context.","external_src":"https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/European_microstates_map_en.png/1280px-European_microstates_map_en.png","credit":"Map: Wikimedia Commons (CC BY-SA)"}'::jsonb);

insert into public.library_resource_blocks (id, resource_id, position, kind, payload)
values (gen_random_uuid(), '66cc187f-e761-47c7-a671-6d9889663ddd', 43, 'didYouKnow', '{"items":["Vatican City is smaller than many large urban parks.","Monaco covers only around 2 km² along the Riviera.","San Marino''s traditional foundation date is 301 CE, though documentary evidence for an organized community appears later.","Liechtenstein sits between Switzerland and Austria in the Alps.","Malta''s recorded human history stretches back more than 7,000 years.","Andorra''s political system includes two co-princes, a rare arrangement in modern Europe."]}'::jsonb);

insert into public.library_resource_blocks (id, resource_id, position, kind, payload)
values (gen_random_uuid(), '66cc187f-e761-47c7-a671-6d9889663ddd', 44, 'heading', '{"id":"conclusion","text":"Tiny on the map. Large in history."}'::jsonb);

insert into public.library_resource_blocks (id, resource_id, position, kind, payload)
values (gen_random_uuid(), '66cc187f-e761-47c7-a671-6d9889663ddd', 45, 'paragraph', '{"text":"These six states demonstrate that physical size does not determine historical importance. Geography set the stage — cliffs, harbours, mountain passes — but institutions, diplomacy and identity wrote the script. Some endured by being useful; others by being difficult to conquer; still others by embodying ideas larger than their borders."}'::jsonb);

insert into public.library_resource_blocks (id, resource_id, position, kind, payload)
values (gen_random_uuid(), '66cc187f-e761-47c7-a671-6d9889663ddd', 46, 'paragraph', '{"text":"Reading them together clarifies what maps often hide: sovereignty can persist in enclaves and archipelagos when communities negotiate space between empires. The microstate is not a curiosity alone — it is a lesson in how political life adapts when territory is scarce and neighbours are powerful."}'::jsonb);

insert into public.library_resource_blocks (id, resource_id, position, kind, payload)
values (gen_random_uuid(), '66cc187f-e761-47c7-a671-6d9889663ddd', 47, 'paragraph', '{"text":"Explore the map. Understand the story. Know Earth."}'::jsonb);
