-- Resource blocks
insert into public.library_resource_blocks (id, resource_id, position, kind, payload)
values ('807eacc4-731c-4575-a5a1-202101320024', '50bd1167-a678-4775-a465-01676c970de1', 0, 'paragraph', '{"text":"A capital is a job description, not a single city. Somewhere has to host the legislature, somewhere the executive, somewhere the highest court — and nothing in international law says those places must share a postcode."}'::jsonb)
on conflict (resource_id, position) do nothing;
insert into public.library_resource_blocks (id, resource_id, position, kind, payload)
values ('2b44be8e-4e38-429d-a849-808b04ebda75', '50bd1167-a678-4775-a465-01676c970de1', 1, 'heading', '{"id":"the-split","text":"The three-way split"}'::jsonb)
on conflict (resource_id, position) do nothing;
insert into public.library_resource_blocks (id, resource_id, position, kind, payload)
values ('6d21921b-4849-4a2a-ab17-fecf7fbb2186', '50bd1167-a678-4775-a465-01676c970de1', 2, 'paragraph', '{"text":"South Africa is the textbook case. Pretoria holds the executive, Cape Town the parliament and Bloemfontein the judiciary. The arrangement was a compromise at union in 1910, and it survived because moving any branch would cost a province its status."}'::jsonb)
on conflict (resource_id, position) do nothing;
insert into public.library_resource_blocks (id, resource_id, position, kind, payload)
values ('675b00b2-3b14-427b-a750-2ad6b048d847', '50bd1167-a678-4775-a465-01676c970de1', 3, 'list', '{"items":["Bolivia: Sucre is constitutional, La Paz is where the government sits.","Netherlands: Amsterdam is the constitutional capital, The Hague the seat of government.","Malaysia: Kuala Lumpur is the capital, Putrajaya the administrative centre.","Tanzania: Dodoma is official, Dar es Salaam remains the commercial anchor."],"ordered":false}'::jsonb)
on conflict (resource_id, position) do nothing;
insert into public.library_resource_blocks (id, resource_id, position, kind, payload)
values ('d9653189-2dae-4a6a-ab9c-b62fe49aeb88', '50bd1167-a678-4775-a465-01676c970de1', 4, 'facts', '{"title":"At a glance","facts":[{"label":"Countries with split functions","value":"12+"},{"label":"Oldest arrangement","value":"South Africa, 1910"},{"label":"Most recent move","value":"Indonesia, Nusantara"},{"label":"Quiz appearances","value":"High"}]}'::jsonb)
on conflict (resource_id, position) do nothing;
insert into public.library_resource_blocks (id, resource_id, position, kind, payload)
values ('4cbdc987-b005-45d5-a9b4-e522d47f26e6', '50bd1167-a678-4775-a465-01676c970de1', 5, 'heading', '{"id":"why-it-happens","text":"Why it happens"}'::jsonb)
on conflict (resource_id, position) do nothing;
insert into public.library_resource_blocks (id, resource_id, position, kind, payload)
values ('5a04d5ea-4d95-4961-a3bd-deecf2047d6b', '50bd1167-a678-4775-a465-01676c970de1', 6, 'paragraph', '{"text":"Three forces recur: federation compromises, decongestion of an overgrown primate city, and symbolic relocation toward a geographic centre. Brazil built Brasília for the third reason and got the second as a bonus."}'::jsonb)
on conflict (resource_id, position) do nothing;
insert into public.library_resource_blocks (id, resource_id, position, kind, payload)
values ('0922b2d5-8757-4941-a913-2aedefda3c69', '50bd1167-a678-4775-a465-01676c970de1', 7, 'quote', '{"text":"A capital city is the argument a country is having with itself, written in concrete.","attribution":"Atlas Studio field notes"}'::jsonb)
on conflict (resource_id, position) do nothing;
insert into public.library_resource_blocks (id, resource_id, position, kind, payload)
values ('9ae540b2-2115-4d33-ab7a-880f9443f77e', '50bd1167-a678-4775-a465-01676c970de1', 8, 'map', '{"region":"Capitals","caption":"Interactive capitals map — arriving with the GEOverze map engine."}'::jsonb)
on conflict (resource_id, position) do nothing;
insert into public.library_resource_blocks (id, resource_id, position, kind, payload)
values ('14d19d7f-298d-4af1-acf8-6ce40cadf162', '50bd1167-a678-4775-a465-01676c970de1', 9, 'didYouKnow', '{"text":"Every figure in this entry is cross-linked to the same dataset that powers Capitals questions in Let''s Play, so reading here directly sharpens your quiz accuracy."}'::jsonb)
on conflict (resource_id, position) do nothing;

insert into public.library_resource_blocks (id, resource_id, position, kind, payload)
values ('5a8c887c-0b1e-4863-ae22-2069be50ccb0', 'a9170d28-bfc1-4c25-ab53-7a72eabf735a', 0, 'paragraph', '{"text":"Fifty million years ago the Indian plate was an island heading north across the Tethys Ocean. It hit Eurasia, and because both plates were continental crust, neither could sink. Everything went up instead."}'::jsonb)
on conflict (resource_id, position) do nothing;
insert into public.library_resource_blocks (id, resource_id, position, kind, payload)
values ('da77956d-dd81-484b-a06e-67610abed31f', 'a9170d28-bfc1-4c25-ab53-7a72eabf735a', 1, 'heading', '{"id":"collision","text":"A collision with nowhere to go"}'::jsonb)
on conflict (resource_id, position) do nothing;
insert into public.library_resource_blocks (id, resource_id, position, kind, payload)
values ('6d6713b1-a5e2-4245-aedd-816e5ea1bd01', 'a9170d28-bfc1-4c25-ab53-7a72eabf735a', 2, 'paragraph', '{"text":"Convergence continues at about 45 mm a year. Roughly a third of that is absorbed by the range itself, which is why the Himalayas gain a few millimetres of height annually — while erosion quietly claws some of it back."}'::jsonb)
on conflict (resource_id, position) do nothing;
insert into public.library_resource_blocks (id, resource_id, position, kind, payload)
values ('4dad181d-7b06-4186-aa31-7a4e557ab1a3', 'a9170d28-bfc1-4c25-ab53-7a72eabf735a', 3, 'image', '{"art":"article-himalaya-uplift","caption":"Uplift and erosion in balance across the main range."}'::jsonb)
on conflict (resource_id, position) do nothing;
insert into public.library_resource_blocks (id, resource_id, position, kind, payload)
values ('a0c481bb-c479-4d0c-a521-4980ccac558f', 'a9170d28-bfc1-4c25-ab53-7a72eabf735a', 4, 'facts', '{"title":"The numbers","facts":[{"label":"Convergence rate","value":"~45 mm / year"},{"label":"Uplift","value":"~5 mm / year"},{"label":"Peaks above 8,000 m","value":"10 of 14"},{"label":"Age of collision","value":"~50 million years"}]}'::jsonb)
on conflict (resource_id, position) do nothing;
insert into public.library_resource_blocks (id, resource_id, position, kind, payload)
values ('791e8f8b-1798-4455-a93d-a16081b2c381', 'a9170d28-bfc1-4c25-ab53-7a72eabf735a', 5, 'heading', '{"id":"monsoon","text":"The range that makes the weather"}'::jsonb)
on conflict (resource_id, position) do nothing;
insert into public.library_resource_blocks (id, resource_id, position, kind, payload)
values ('c6fae8f5-3302-481f-aec1-7eaa50d787e3', 'a9170d28-bfc1-4c25-ab53-7a72eabf735a', 6, 'paragraph', '{"text":"The wall does more than exist: it blocks cold Central Asian air from reaching the subcontinent and forces the summer monsoon to dump its moisture on the southern slopes. Half of Asia''s agriculture depends on that mechanism."}'::jsonb)
on conflict (resource_id, position) do nothing;
insert into public.library_resource_blocks (id, resource_id, position, kind, payload)
values ('87fb5fff-dfe6-4e0c-a0b1-ecaa3499c09e', 'a9170d28-bfc1-4c25-ab53-7a72eabf735a', 7, 'list', '{"items":["Ten of the world''s fourteen 8,000 m peaks sit on the Himalayan arc.","The range feeds the Indus, Ganges and Brahmaputra systems.","Glacial retreat is now measurable decade to decade."],"ordered":false}'::jsonb)
on conflict (resource_id, position) do nothing;
insert into public.library_resource_blocks (id, resource_id, position, kind, payload)
values ('3c0662ce-59bf-464b-aa91-0f67b7f90c91', 'a9170d28-bfc1-4c25-ab53-7a72eabf735a', 8, 'map', '{"region":"Mountain ranges","caption":"Interactive mountain ranges map — arriving with the GEOverze map engine."}'::jsonb)
on conflict (resource_id, position) do nothing;
insert into public.library_resource_blocks (id, resource_id, position, kind, payload)
values ('cccec8c4-336e-4491-a23d-d18941a874dd', 'a9170d28-bfc1-4c25-ab53-7a72eabf735a', 9, 'didYouKnow', '{"text":"Every figure in this entry is cross-linked to the same dataset that powers Mountain ranges questions in Let''s Play, so reading here directly sharpens your quiz accuracy."}'::jsonb)
on conflict (resource_id, position) do nothing;

insert into public.library_resource_blocks (id, resource_id, position, kind, payload)
values ('1b731f87-8bb7-40f2-a34d-6821e461ed5a', '0fdde805-c5f5-4e26-ad65-ee25b509065d', 0, 'paragraph', '{"text":"The word comes from the Arabic sāḥil, meaning shore. Seen from the desert, the Sahel is exactly that: the coastline of a sea of sand, where scrub gives way to grass and rain becomes possible again."}'::jsonb)
on conflict (resource_id, position) do nothing;
insert into public.library_resource_blocks (id, resource_id, position, kind, payload)
values ('d26eed64-cf77-4763-a35e-55eea889d1bb', '0fdde805-c5f5-4e26-ad65-ee25b509065d', 1, 'heading', '{"id":"geography","text":"Where it actually is"}'::jsonb)
on conflict (resource_id, position) do nothing;
insert into public.library_resource_blocks (id, resource_id, position, kind, payload)
values ('d5d8a371-4763-49d4-a0ef-a5b8285c696b', '0fdde805-c5f5-4e26-ad65-ee25b509065d', 2, 'paragraph', '{"text":"It runs from Senegal on the Atlantic to Eritrea on the Red Sea, crossing Mauritania, Mali, Burkina Faso, Niger, Nigeria, Chad and Sudan. Rainfall averages 200–600 mm a year, almost all of it in a single short season."}'::jsonb)
on conflict (resource_id, position) do nothing;
insert into public.library_resource_blocks (id, resource_id, position, kind, payload)
values ('65537ba3-5562-483b-ab57-43716036aff6', '0fdde805-c5f5-4e26-ad65-ee25b509065d', 3, 'map', '{"region":"Sahel belt","caption":"The Sahel belt across eleven countries — map engine pending."}'::jsonb)
on conflict (resource_id, position) do nothing;
insert into public.library_resource_blocks (id, resource_id, position, kind, payload)
values ('d8b0c990-17c3-44f1-af16-fa2a08f91717', '0fdde805-c5f5-4e26-ad65-ee25b509065d', 4, 'facts', '{"title":"Key figures","facts":[{"label":"Length","value":"~5,400 km"},{"label":"Annual rainfall","value":"200 – 600 mm"},{"label":"Countries crossed","value":"11"},{"label":"Population","value":"~150 million"}]}'::jsonb)
on conflict (resource_id, position) do nothing;
insert into public.library_resource_blocks (id, resource_id, position, kind, payload)
values ('a50f6218-b770-4f21-a47e-d2b1220f701c', '0fdde805-c5f5-4e26-ad65-ee25b509065d', 5, 'heading', '{"id":"great-green-wall","text":"The Great Green Wall"}'::jsonb)
on conflict (resource_id, position) do nothing;
insert into public.library_resource_blocks (id, resource_id, position, kind, payload)
values ('35b1f320-e403-45cd-ae99-bd3a66743d42', '0fdde805-c5f5-4e26-ad65-ee25b509065d', 6, 'paragraph', '{"text":"Launched in 2007, the plan was a literal wall of trees across the continent. It has since become something better: a mosaic of restored farmland, water-harvesting bunds and community land rights that works with existing agriculture rather than around it."}'::jsonb)
on conflict (resource_id, position) do nothing;
insert into public.library_resource_blocks (id, resource_id, position, kind, payload)
values ('3a60ebde-285f-4263-a3ec-528661e59cf9', '0fdde805-c5f5-4e26-ad65-ee25b509065d', 7, 'quote', '{"text":"The Sahel is not the Sahara advancing. It is rainfall variability meeting land under pressure.","attribution":"Terra Lingua"}'::jsonb)
on conflict (resource_id, position) do nothing;
insert into public.library_resource_blocks (id, resource_id, position, kind, payload)
values ('b4fb88df-a1ba-4414-a39c-7551b3129048', '0fdde805-c5f5-4e26-ad65-ee25b509065d', 8, 'map', '{"region":"Climate","caption":"Interactive climate map — arriving with the GEOverze map engine."}'::jsonb)
on conflict (resource_id, position) do nothing;
insert into public.library_resource_blocks (id, resource_id, position, kind, payload)
values ('52c7309a-3d23-429b-a095-a270df71a6ff', '0fdde805-c5f5-4e26-ad65-ee25b509065d', 9, 'didYouKnow', '{"text":"Every figure in this entry is cross-linked to the same dataset that powers Climate questions in Let''s Play, so reading here directly sharpens your quiz accuracy."}'::jsonb)
on conflict (resource_id, position) do nothing;

insert into public.library_resource_blocks (id, resource_id, position, kind, payload)
values ('566ce2c8-fe3b-4525-af32-0992a409ca2b', '3bb6a8ad-0560-43de-a9f1-81969c0a4c6c', 0, 'paragraph', '{"text":"Natural borders wander. They follow watersheds, rivers and ridgelines because those are the things people historically could not cross. Straight borders are a signature of cartography imposed from outside."}'::jsonb)
on conflict (resource_id, position) do nothing;
insert into public.library_resource_blocks (id, resource_id, position, kind, payload)
values ('a7e15e18-92f8-4bfb-a5c6-348ea73b3e46', '3bb6a8ad-0560-43de-a9f1-81969c0a4c6c', 1, 'heading', '{"id":"the-longest","text":"The longest straight line"}'::jsonb)
on conflict (resource_id, position) do nothing;
insert into public.library_resource_blocks (id, resource_id, position, kind, payload)
values ('5ddad405-3a89-40be-a4f7-a510093309c6', '3bb6a8ad-0560-43de-a9f1-81969c0a4c6c', 2, 'paragraph', '{"text":"The 49th parallel carries the Canada–United States boundary for nearly 2,000 km. Surveying it took decades, and the crews cut a six-metre clearing through forest — the Slash — that is still maintained today."}'::jsonb)
on conflict (resource_id, position) do nothing;
insert into public.library_resource_blocks (id, resource_id, position, kind, payload)
values ('828abc08-83f1-453f-a990-1a601f1f118b', '3bb6a8ad-0560-43de-a9f1-81969c0a4c6c', 3, 'list', '{"items":["Egypt–Sudan: the 22nd parallel, with the disputed Hala''ib triangle as its footnote.","Algeria–Mali–Niger: desert lines drawn by compass bearing.","Western Australia: a state boundary on the 129th meridian."],"ordered":false}'::jsonb)
on conflict (resource_id, position) do nothing;
insert into public.library_resource_blocks (id, resource_id, position, kind, payload)
values ('a9afc65a-e4ec-4239-a848-3240bbc63604', '3bb6a8ad-0560-43de-a9f1-81969c0a4c6c', 4, 'image', '{"art":"article-straight-borders","caption":"Parallels and meridians as political instruments."}'::jsonb)
on conflict (resource_id, position) do nothing;
insert into public.library_resource_blocks (id, resource_id, position, kind, payload)
values ('dfa98c18-f82b-4b68-abb8-96f35ad64d2c', '3bb6a8ad-0560-43de-a9f1-81969c0a4c6c', 5, 'heading', '{"id":"consequences","text":"What straight lines cost"}'::jsonb)
on conflict (resource_id, position) do nothing;
insert into public.library_resource_blocks (id, resource_id, position, kind, payload)
values ('614a67d3-f12e-4a21-a20a-9d71021c547d', '3bb6a8ad-0560-43de-a9f1-81969c0a4c6c', 6, 'paragraph', '{"text":"A line drawn without reference to who lives there splits language groups, grazing routes and watersheds. Many long-running boundary disputes trace directly to a nineteenth-century ruler on a small-scale map."}'::jsonb)
on conflict (resource_id, position) do nothing;
insert into public.library_resource_blocks (id, resource_id, position, kind, payload)
values ('bbebca6e-5517-4056-aed5-2f2c6cd787b5', '3bb6a8ad-0560-43de-a9f1-81969c0a4c6c', 7, 'map', '{"region":"Countries","caption":"Interactive countries map — arriving with the GEOverze map engine."}'::jsonb)
on conflict (resource_id, position) do nothing;
insert into public.library_resource_blocks (id, resource_id, position, kind, payload)
values ('6ce3d12c-a22c-4895-a2c6-330af68a260e', '3bb6a8ad-0560-43de-a9f1-81969c0a4c6c', 8, 'didYouKnow', '{"text":"Every figure in this entry is cross-linked to the same dataset that powers Countries questions in Let''s Play, so reading here directly sharpens your quiz accuracy."}'::jsonb)
on conflict (resource_id, position) do nothing;

insert into public.library_resource_blocks (id, resource_id, position, kind, payload)
values ('90a67e81-027e-44e5-a86d-7097e56be404', '684b559f-5a9b-4469-ad23-e14dd3b2761a', 0, 'paragraph', '{"text":"Flags are compressed history. Once you know the recurring families — tricolours, Nordic crosses, pan-African and pan-Arab palettes — most of the world''s 195 national flags become guessable rather than memorisable."}'::jsonb)
on conflict (resource_id, position) do nothing;
insert into public.library_resource_blocks (id, resource_id, position, kind, payload)
values ('6307f723-bd67-4d61-a42e-8d8c0cdf4152', '684b559f-5a9b-4469-ad23-e14dd3b2761a', 1, 'heading', '{"id":"families","text":"The five big families"}'::jsonb)
on conflict (resource_id, position) do nothing;
insert into public.library_resource_blocks (id, resource_id, position, kind, payload)
values ('d1dd3c35-c068-44eb-a048-6d12c75e78c5', '684b559f-5a9b-4469-ad23-e14dd3b2761a', 2, 'list', '{"items":["Tricolours: France''s 1794 design copied across Europe, Africa and the Americas.","Nordic crosses: an off-centre cross, always signalling the Nordic sphere.","Pan-African: green, gold and red, from Ethiopia outward.","Pan-Arab: black, white, green and red from the 1916 Arab Revolt.","Union-derived: a canton in the top-left, tracing British administration."],"ordered":true}'::jsonb)
on conflict (resource_id, position) do nothing;
insert into public.library_resource_blocks (id, resource_id, position, kind, payload)
values ('8a9e1cc5-9ca2-4f1a-a07e-c7230475cbc5', '684b559f-5a9b-4469-ad23-e14dd3b2761a', 3, 'facts', '{"title":"Vexillology quick sheet","facts":[{"label":"Most common colour","value":"Red"},{"label":"Only non-rectangular","value":"Nepal"},{"label":"Identical pairs","value":"Monaco & Indonesia"},{"label":"Newest national flag","value":"2021, Afghanistan"}]}'::jsonb)
on conflict (resource_id, position) do nothing;
insert into public.library_resource_blocks (id, resource_id, position, kind, payload)
values ('a766bbd3-abef-4ddf-a404-9f739a596ffa', '684b559f-5a9b-4469-ad23-e14dd3b2761a', 4, 'didYouKnow', '{"text":"Nepal''s flag is the only national flag that is not a quadrilateral — its two stacked pennants represent the Himalayas and the country''s two dominant faiths."}'::jsonb)
on conflict (resource_id, position) do nothing;
insert into public.library_resource_blocks (id, resource_id, position, kind, payload)
values ('782b94f6-20f5-430e-affd-d1ccccb92770', '684b559f-5a9b-4469-ad23-e14dd3b2761a', 5, 'map', '{"region":"Flags","caption":"Interactive flags map — arriving with the GEOverze map engine."}'::jsonb)
on conflict (resource_id, position) do nothing;
insert into public.library_resource_blocks (id, resource_id, position, kind, payload)
values ('56370607-d43c-4a85-aae4-cc5a9e25ecab', '684b559f-5a9b-4469-ad23-e14dd3b2761a', 6, 'didYouKnow', '{"text":"Every figure in this entry is cross-linked to the same dataset that powers Flags questions in Let''s Play, so reading here directly sharpens your quiz accuracy."}'::jsonb)
on conflict (resource_id, position) do nothing;

insert into public.library_resource_blocks (id, resource_id, position, kind, payload)
values ('3344501d-4598-4a8d-a8f1-fceef2148bc6', '451449b7-d9e1-4a55-ac87-26a008bca624', 0, 'paragraph', '{"text":"Length sounds like a fact. For rivers it is a decision: which headwater counts, how you handle a braided delta, and what resolution your coastline data uses."}'::jsonb)
on conflict (resource_id, position) do nothing;
insert into public.library_resource_blocks (id, resource_id, position, kind, payload)
values ('3ec39625-b6d4-4967-a600-3165d383eb6d', '451449b7-d9e1-4a55-ac87-26a008bca624', 1, 'heading', '{"id":"the-case","text":"The case for each"}'::jsonb)
on conflict (resource_id, position) do nothing;
insert into public.library_resource_blocks (id, resource_id, position, kind, payload)
values ('c4af7243-6132-442b-a26f-20057f964672', '451449b7-d9e1-4a55-ac87-26a008bca624', 2, 'paragraph', '{"text":"The Nile is conventionally 6,650 km from Lake Victoria''s feeders to the Mediterranean. The Amazon is usually given as 6,400 km, but expeditions tracing it to the Mantaro headwaters in Peru push it past 6,900 km."}'::jsonb)
on conflict (resource_id, position) do nothing;
insert into public.library_resource_blocks (id, resource_id, position, kind, payload)
values ('d6f15ea3-64a6-496c-ab5b-f6612cb7e1e6', '451449b7-d9e1-4a55-ac87-26a008bca624', 3, 'facts', '{"title":"Not close on discharge","facts":[{"label":"Amazon discharge","value":"~209,000 m³/s"},{"label":"Nile discharge","value":"~2,800 m³/s"},{"label":"Amazon basin","value":"7.0 million km²"},{"label":"Nile basin","value":"3.4 million km²"}]}'::jsonb)
on conflict (resource_id, position) do nothing;
insert into public.library_resource_blocks (id, resource_id, position, kind, payload)
values ('4499bcab-a8d2-4977-ae77-d25542b78a52', '451449b7-d9e1-4a55-ac87-26a008bca624', 4, 'paragraph', '{"text":"By volume there is no contest. The Amazon carries roughly a fifth of all river water reaching the ocean, and its plume is detectable hundreds of kilometres out to sea."}'::jsonb)
on conflict (resource_id, position) do nothing;
insert into public.library_resource_blocks (id, resource_id, position, kind, payload)
values ('ba84b782-8dc3-4c99-acc6-1692b7f5b6a6', '451449b7-d9e1-4a55-ac87-26a008bca624', 5, 'quote', '{"text":"Ask which river is longest and you get an answer about methodology, not geography.","attribution":"Delta Notes"}'::jsonb)
on conflict (resource_id, position) do nothing;
insert into public.library_resource_blocks (id, resource_id, position, kind, payload)
values ('68aa6f51-a2a2-4bdf-a464-2e2b4d026441', '451449b7-d9e1-4a55-ac87-26a008bca624', 6, 'map', '{"region":"Rivers","caption":"Interactive rivers map — arriving with the GEOverze map engine."}'::jsonb)
on conflict (resource_id, position) do nothing;
insert into public.library_resource_blocks (id, resource_id, position, kind, payload)
values ('f28077db-b65e-49f7-a794-e3e01f30d2a3', '451449b7-d9e1-4a55-ac87-26a008bca624', 7, 'didYouKnow', '{"text":"Every figure in this entry is cross-linked to the same dataset that powers Rivers questions in Let''s Play, so reading here directly sharpens your quiz accuracy."}'::jsonb)
on conflict (resource_id, position) do nothing;

insert into public.library_resource_blocks (id, resource_id, position, kind, payload)
values ('d1e86fa9-a8f6-44d0-a7bd-06d90a787914', '65b1d8ac-5bf0-4209-aa0a-437f1d99fcc6', 0, 'paragraph', '{"text":"A site must show what the convention calls Outstanding Universal Value: significance so exceptional it transcends national boundaries. In practice that means meeting at least one of ten criteria, six cultural and four natural."}'::jsonb)
on conflict (resource_id, position) do nothing;
insert into public.library_resource_blocks (id, resource_id, position, kind, payload)
values ('2a062bc3-ba22-42bf-a292-ff8db6a721aa', '65b1d8ac-5bf0-4209-aa0a-437f1d99fcc6', 1, 'heading', '{"id":"the-route","text":"The route to inscription"}'::jsonb)
on conflict (resource_id, position) do nothing;
insert into public.library_resource_blocks (id, resource_id, position, kind, payload)
values ('77b25a23-f98d-43d2-af08-ea7a8cd1a05d', '65b1d8ac-5bf0-4209-aa0a-437f1d99fcc6', 2, 'list', '{"items":["The state party adds the site to its tentative list.","A full nomination dossier is prepared, often over years.","ICOMOS or IUCN carries out an independent evaluation.","The World Heritage Committee votes at its annual session."],"ordered":true}'::jsonb)
on conflict (resource_id, position) do nothing;
insert into public.library_resource_blocks (id, resource_id, position, kind, payload)
values ('833088a4-b0c2-430c-a092-709fb48cbec6', '65b1d8ac-5bf0-4209-aa0a-437f1d99fcc6', 3, 'facts', '{"title":"The register today","facts":[{"label":"Total sites","value":"1,200+"},{"label":"Cultural","value":"~933"},{"label":"Natural","value":"~227"},{"label":"In danger","value":"~56"}]}'::jsonb)
on conflict (resource_id, position) do nothing;
insert into public.library_resource_blocks (id, resource_id, position, kind, payload)
values ('f0aa79fc-3ac3-43b6-a44c-0567d4d7bd67', '65b1d8ac-5bf0-4209-aa0a-437f1d99fcc6', 4, 'didYouKnow', '{"text":"Sites can be removed. Dresden''s Elbe Valley lost its status in 2009 after a four-lane bridge was built through the protected landscape."}'::jsonb)
on conflict (resource_id, position) do nothing;
insert into public.library_resource_blocks (id, resource_id, position, kind, payload)
values ('c16a389b-a8cb-45da-ae72-a128880278d6', '65b1d8ac-5bf0-4209-aa0a-437f1d99fcc6', 5, 'map', '{"region":"UNESCO heritage","caption":"Interactive unesco heritage map — arriving with the GEOverze map engine."}'::jsonb)
on conflict (resource_id, position) do nothing;
insert into public.library_resource_blocks (id, resource_id, position, kind, payload)
values ('84a7dcaf-080a-4b27-a7c7-8b227f806753', '65b1d8ac-5bf0-4209-aa0a-437f1d99fcc6', 6, 'didYouKnow', '{"text":"Every figure in this entry is cross-linked to the same dataset that powers UNESCO heritage questions in Let''s Play, so reading here directly sharpens your quiz accuracy."}'::jsonb)
on conflict (resource_id, position) do nothing;

insert into public.library_resource_blocks (id, resource_id, position, kind, payload)
values ('1cf3827b-6a32-4cc1-a0f8-11fe3f84b538', '1497d5c2-d8ec-49f6-a3d2-9adc33d5b738', 0, 'paragraph', '{"text":"Every other ocean is defined by the land around it. The Southern Ocean is defined by water: the Antarctic Circumpolar Current, which circles the continent uninterrupted and keeps its cold water distinct from what lies north."}'::jsonb)
on conflict (resource_id, position) do nothing;
insert into public.library_resource_blocks (id, resource_id, position, kind, payload)
values ('72114120-77cb-4a53-a02f-1bef60029cf6', '1497d5c2-d8ec-49f6-a3d2-9adc33d5b738', 1, 'heading', '{"id":"boundary","text":"Where it starts"}'::jsonb)
on conflict (resource_id, position) do nothing;
insert into public.library_resource_blocks (id, resource_id, position, kind, payload)
values ('72d425c4-e937-488b-af54-866ab21787c9', '1497d5c2-d8ec-49f6-a3d2-9adc33d5b738', 2, 'paragraph', '{"text":"The working boundary is 60° south. North of it the water warms and mixes with the Atlantic, Pacific and Indian; south of it the circumpolar current dominates and the ecosystem changes with it."}'::jsonb)
on conflict (resource_id, position) do nothing;
insert into public.library_resource_blocks (id, resource_id, position, kind, payload)
values ('bad8e6a5-fd83-48b7-a9d4-5690cf0bf515', '1497d5c2-d8ec-49f6-a3d2-9adc33d5b738', 3, 'facts', '{"title":"The five","facts":[{"label":"Pacific","value":"165.2 million km²"},{"label":"Atlantic","value":"106.5 million km²"},{"label":"Indian","value":"70.6 million km²"},{"label":"Southern","value":"21.9 million km²"}]}'::jsonb)
on conflict (resource_id, position) do nothing;
insert into public.library_resource_blocks (id, resource_id, position, kind, payload)
values ('13a3874c-c7a3-4167-aaf5-75dd11e644c0', '1497d5c2-d8ec-49f6-a3d2-9adc33d5b738', 4, 'map', '{"region":"Southern Ocean","caption":"The 60° south boundary and the circumpolar current."}'::jsonb)
on conflict (resource_id, position) do nothing;
insert into public.library_resource_blocks (id, resource_id, position, kind, payload)
values ('bad336aa-db7e-440c-aae6-5255a77c82c0', '1497d5c2-d8ec-49f6-a3d2-9adc33d5b738', 5, 'map', '{"region":"Oceans","caption":"Interactive oceans map — arriving with the GEOverze map engine."}'::jsonb)
on conflict (resource_id, position) do nothing;
insert into public.library_resource_blocks (id, resource_id, position, kind, payload)
values ('0aa5bd1b-c613-4c37-a06f-aaa93b705bd6', '1497d5c2-d8ec-49f6-a3d2-9adc33d5b738', 6, 'didYouKnow', '{"text":"Every figure in this entry is cross-linked to the same dataset that powers Oceans questions in Let''s Play, so reading here directly sharpens your quiz accuracy."}'::jsonb)
on conflict (resource_id, position) do nothing;