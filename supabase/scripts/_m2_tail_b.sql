insert into public.library_resource_blocks (id, resource_id, position, kind, payload)
values ('70a3c9e8-c541-4587-a795-583fbef0e891', '5db8f91d-4f91-46ed-a2e7-ab1a5a902e02', 0, 'paragraph', '{"text":"Around 7,000 languages are spoken today, but fewer than a hundred hold official status anywhere. The gap between those numbers is where most of the world''s linguistic geography lives."}'::jsonb)
on conflict (resource_id, position) do nothing;
insert into public.library_resource_blocks (id, resource_id, position, kind, payload)
values ('3211990d-921f-4e30-a7a1-a645c60d5dff', '5db8f91d-4f91-46ed-a2e7-ab1a5a902e02', 1, 'heading', '{"id":"widest","text":"The widest reach"}'::jsonb)
on conflict (resource_id, position) do nothing;
insert into public.library_resource_blocks (id, resource_id, position, kind, payload)
values ('5b68e0fe-7b2c-4474-a4c4-aa48de7e84f3', '5db8f91d-4f91-46ed-a2e7-ab1a5a902e02', 2, 'list', '{"items":["English: official or co-official in 58 countries.","French: 29 countries across five continents.","Arabic: 25 countries, with dialect continua that ignore borders entirely.","Spanish: 21 countries, remarkably mutually intelligible."],"ordered":false}'::jsonb)
on conflict (resource_id, position) do nothing;
insert into public.library_resource_blocks (id, resource_id, position, kind, payload)
values ('1cb6f10c-84c9-4166-a320-059f9734e00b', '5db8f91d-4f91-46ed-a2e7-ab1a5a902e02', 3, 'paragraph', '{"text":"Reach is not the same as speaker count. Mandarin has more native speakers than English but official status in only a handful of states, because its distribution is concentrated rather than colonial."}'::jsonb)
on conflict (resource_id, position) do nothing;
insert into public.library_resource_blocks (id, resource_id, position, kind, payload)
values ('6056820a-1e7f-464b-ad08-86ac481765bb', '5db8f91d-4f91-46ed-a2e7-ab1a5a902e02', 4, 'didYouKnow', '{"text":"Papua New Guinea has over 840 living languages — roughly 12% of the world''s total in 0.3% of its land area."}'::jsonb)
on conflict (resource_id, position) do nothing;
insert into public.library_resource_blocks (id, resource_id, position, kind, payload)
values ('7df67fa6-9f3a-4aea-a0bd-f557058aab5f', '5db8f91d-4f91-46ed-a2e7-ab1a5a902e02', 5, 'map', '{"region":"Cultures","caption":"Interactive cultures map — arriving with the GEOverze map engine."}'::jsonb)
on conflict (resource_id, position) do nothing;
insert into public.library_resource_blocks (id, resource_id, position, kind, payload)
values ('31b9e1d2-9bf3-49a2-a43d-2641df8df698', '5db8f91d-4f91-46ed-a2e7-ab1a5a902e02', 6, 'didYouKnow', '{"text":"Every figure in this entry is cross-linked to the same dataset that powers Cultures questions in Let''s Play, so reading here directly sharpens your quiz accuracy."}'::jsonb)
on conflict (resource_id, position) do nothing;

insert into public.library_resource_blocks (id, resource_id, position, kind, payload)
values ('538b7350-a5a3-4c50-a3e7-23946e709a6c', '9c7ebb85-91c4-4d75-a0c6-44d4749a14cb', 0, 'paragraph', '{"text":"There are about 180 recognised currencies for 195 countries. The shortfall is the interesting part: shared unions, adopted foreign notes and hard pegs each say something about trade, size and trust."}'::jsonb)
on conflict (resource_id, position) do nothing;
insert into public.library_resource_blocks (id, resource_id, position, kind, payload)
values ('5c6318a1-14b9-44ee-a2b1-17ab8641c190', '9c7ebb85-91c4-4d75-a0c6-44d4749a14cb', 1, 'heading', '{"id":"unions","text":"Currency unions"}'::jsonb)
on conflict (resource_id, position) do nothing;
insert into public.library_resource_blocks (id, resource_id, position, kind, payload)
values ('6f3afb69-64af-4086-a75f-6be285399519', '9c7ebb85-91c4-4d75-a0c6-44d4749a14cb', 2, 'paragraph', '{"text":"The euro is the famous one, but the CFA franc covers fourteen African states across two zones, and the Eastern Caribbean dollar binds eight island economies to a single central bank."}'::jsonb)
on conflict (resource_id, position) do nothing;
insert into public.library_resource_blocks (id, resource_id, position, kind, payload)
values ('e642b732-4ff5-44dd-a413-296d08e73aed', '9c7ebb85-91c4-4d75-a0c6-44d4749a14cb', 3, 'heading', '{"id":"dollarisation","text":"Adopting someone else''s money"}'::jsonb)
on conflict (resource_id, position) do nothing;
insert into public.library_resource_blocks (id, resource_id, position, kind, payload)
values ('c4323a7f-bb83-4b26-ad2f-e2431eb21598', '9c7ebb85-91c4-4d75-a0c6-44d4749a14cb', 4, 'list', '{"items":["Ecuador, El Salvador and Panama use the US dollar outright.","Montenegro and Kosovo use the euro without being in the eurozone.","Several Pacific states use the Australian or New Zealand dollar."],"ordered":false}'::jsonb)
on conflict (resource_id, position) do nothing;
insert into public.library_resource_blocks (id, resource_id, position, kind, payload)
values ('66b0d60e-de7e-4081-a6b9-6d91849964fc', '9c7ebb85-91c4-4d75-a0c6-44d4749a14cb', 5, 'facts', '{"title":"Currency map","facts":[{"label":"Recognised currencies","value":"~180"},{"label":"Countries using the euro","value":"20 official"},{"label":"CFA franc states","value":"14"},{"label":"Fully dollarised","value":"7+"}]}'::jsonb)
on conflict (resource_id, position) do nothing;
insert into public.library_resource_blocks (id, resource_id, position, kind, payload)
values ('1214bbe1-0ee2-4411-a28c-5424552d2b6a', '9c7ebb85-91c4-4d75-a0c6-44d4749a14cb', 6, 'quote', '{"text":"A currency border is the most honest border there is — it shows where trust actually stops.","attribution":"Terra Lingua"}'::jsonb)
on conflict (resource_id, position) do nothing;
insert into public.library_resource_blocks (id, resource_id, position, kind, payload)
values ('7312f3e4-6fdc-420d-aaae-d869f5c72642', '9c7ebb85-91c4-4d75-a0c6-44d4749a14cb', 7, 'map', '{"region":"Currencies","caption":"Interactive currencies map — arriving with the GEOverze map engine."}'::jsonb)
on conflict (resource_id, position) do nothing;
insert into public.library_resource_blocks (id, resource_id, position, kind, payload)
values ('ab8aafae-0516-43ca-aa5e-4a7cfecdbbb6', '9c7ebb85-91c4-4d75-a0c6-44d4749a14cb', 8, 'didYouKnow', '{"text":"Every figure in this entry is cross-linked to the same dataset that powers Currencies questions in Let''s Play, so reading here directly sharpens your quiz accuracy."}'::jsonb)
on conflict (resource_id, position) do nothing;

insert into public.library_resource_blocks (id, resource_id, position, kind, payload)
values ('2f431c22-f73f-4d9e-a3c8-484f0d2e3264', '2be8f9b1-0851-4e70-abb9-ee41ac89443c', 0, 'paragraph', '{"text":"Famous places accumulate folklore faster than facts. These are the six that cause the most wrong answers in Let''s Play rounds, and the corrections that stick."}'::jsonb)
on conflict (resource_id, position) do nothing;
insert into public.library_resource_blocks (id, resource_id, position, kind, payload)
values ('b2c443c5-b1ed-4c45-a075-c0795f84444f', '2be8f9b1-0851-4e70-abb9-ee41ac89443c', 1, 'heading', '{"id":"six","text":"Six corrections"}'::jsonb)
on conflict (resource_id, position) do nothing;
insert into public.library_resource_blocks (id, resource_id, position, kind, payload)
values ('e928dde7-02bc-4a7a-a062-bedde775817a', '2be8f9b1-0851-4e70-abb9-ee41ac89443c', 2, 'list', '{"items":["Machu Picchu sits at 2,430 m — lower than Cusco, which is at 3,400 m.","The Great Wall is not visible to the naked eye from orbit.","Stonehenge predates the pyramids of Giza.","The Leaning Tower began tilting during construction, not centuries later.","Mount Everest is not the furthest point from Earth''s centre — Chimborazo is.","Angkor Wat is Hindu in origin, Buddhist by later adaptation."],"ordered":true}'::jsonb)
on conflict (resource_id, position) do nothing;
insert into public.library_resource_blocks (id, resource_id, position, kind, payload)
values ('5260785a-a6b9-4ddb-a14a-1b0e4b3c03d3', '2be8f9b1-0851-4e70-abb9-ee41ac89443c', 3, 'image', '{"art":"article-landmark-myths","caption":"Six landmarks, six persistent misreadings."}'::jsonb)
on conflict (resource_id, position) do nothing;
insert into public.library_resource_blocks (id, resource_id, position, kind, payload)
values ('09ea39cc-a104-49ec-a9a4-b4c92940c478', '2be8f9b1-0851-4e70-abb9-ee41ac89443c', 4, 'map', '{"region":"Landmarks","caption":"Interactive landmarks map — arriving with the GEOverze map engine."}'::jsonb)
on conflict (resource_id, position) do nothing;
insert into public.library_resource_blocks (id, resource_id, position, kind, payload)
values ('66ff7c26-fe1f-41f6-adaa-0b0121d32bff', '2be8f9b1-0851-4e70-abb9-ee41ac89443c', 5, 'didYouKnow', '{"text":"Every figure in this entry is cross-linked to the same dataset that powers Landmarks questions in Let''s Play, so reading here directly sharpens your quiz accuracy."}'::jsonb)
on conflict (resource_id, position) do nothing;

insert into public.library_resource_blocks (id, resource_id, position, kind, payload)
values ('d4dbdd64-f6a8-4ad8-aa90-43d2c347a95c', '2f6080fb-cf80-48cd-abd4-77705d073778', 0, 'paragraph', '{"text":"A contour line joins points of equal elevation. That single rule generates every pattern on a topographic sheet, and three of those patterns cover most of what you need in the field."}'::jsonb)
on conflict (resource_id, position) do nothing;
insert into public.library_resource_blocks (id, resource_id, position, kind, payload)
values ('7c7e764e-5a00-4bf5-ad6d-eafb846fa342', '2f6080fb-cf80-48cd-abd4-77705d073778', 1, 'heading', '{"id":"patterns","text":"The three shapes"}'::jsonb)
on conflict (resource_id, position) do nothing;
insert into public.library_resource_blocks (id, resource_id, position, kind, payload)
values ('a2bd4d1d-b901-42b4-a6ff-1ac008c09d32', '2f6080fb-cf80-48cd-abd4-77705d073778', 2, 'list', '{"items":["Concentric closed loops: a hill, with the smallest ring at the summit.","V-shapes pointing uphill: a valley, with the V aiming upstream.","Lines packed tightly together: a steep face; widely spaced means gentle ground."],"ordered":false}'::jsonb)
on conflict (resource_id, position) do nothing;
insert into public.library_resource_blocks (id, resource_id, position, kind, payload)
values ('2b92d9eb-adab-4d40-aedf-6ab41b51f770', '2f6080fb-cf80-48cd-abd4-77705d073778', 3, 'facts', '{"title":"Reading essentials","facts":[{"label":"Standard interval","value":"10 m or 20 m"},{"label":"Index contours","value":"Every 5th line, labelled"},{"label":"Grid north vs true north","value":"Check the declination"},{"label":"Scale on hiking sheets","value":"1:25,000"}]}'::jsonb)
on conflict (resource_id, position) do nothing;
insert into public.library_resource_blocks (id, resource_id, position, kind, payload)
values ('0cf00351-2bc7-4233-af19-28d117b8143e', '2f6080fb-cf80-48cd-abd4-77705d073778', 4, 'didYouKnow', '{"text":"Contour lines never cross. Where terrain overhangs, cartographers switch to dashed lines rather than break the rule."}'::jsonb)
on conflict (resource_id, position) do nothing;
insert into public.library_resource_blocks (id, resource_id, position, kind, payload)
values ('9300030c-0f47-43ea-a789-5a77f7a1b461', '2f6080fb-cf80-48cd-abd4-77705d073778', 5, 'map', '{"region":"Geography basics","caption":"Interactive geography basics map — arriving with the GEOverze map engine."}'::jsonb)
on conflict (resource_id, position) do nothing;
insert into public.library_resource_blocks (id, resource_id, position, kind, payload)
values ('8f0fd636-6c13-4b86-ad2c-ba8e280ae009', '2f6080fb-cf80-48cd-abd4-77705d073778', 6, 'didYouKnow', '{"text":"Every figure in this entry is cross-linked to the same dataset that powers Geography basics questions in Let''s Play, so reading here directly sharpens your quiz accuracy."}'::jsonb)
on conflict (resource_id, position) do nothing;

insert into public.library_resource_blocks (id, resource_id, position, kind, payload)
values ('2580f896-10d5-4a3f-a073-14d77d66735e', '66cc187f-e761-47c7-a671-6d9889663ddd', 0, 'paragraph', '{"text":"Vatican City, Monaco, San Marino, Liechtenstein, Malta and Andorra together would fit inside a mid-sized city. Each survived by being useful, defensible or simply too small to bother annexing."}'::jsonb)
on conflict (resource_id, position) do nothing;
insert into public.library_resource_blocks (id, resource_id, position, kind, payload)
values ('0ab90c77-1fe5-4a7f-a2c4-d784851aa0f9', '66cc187f-e761-47c7-a671-6d9889663ddd', 1, 'facts', '{"title":"By area","facts":[{"label":"Vatican City","value":"0.49 km²"},{"label":"Monaco","value":"2.02 km²"},{"label":"San Marino","value":"61 km²"},{"label":"Liechtenstein","value":"160 km²"}]}'::jsonb)
on conflict (resource_id, position) do nothing;
insert into public.library_resource_blocks (id, resource_id, position, kind, payload)
values ('b1a98b9f-9b5b-4c0a-af31-5209e6c68d29', '66cc187f-e761-47c7-a671-6d9889663ddd', 2, 'heading', '{"id":"how","text":"How they held on"}'::jsonb)
on conflict (resource_id, position) do nothing;
insert into public.library_resource_blocks (id, resource_id, position, kind, payload)
values ('3868f4f8-6d94-41e6-ab4e-77080ea43f4e', '66cc187f-e761-47c7-a671-6d9889663ddd', 3, 'paragraph', '{"text":"San Marino claims continuous independence since 301 CE by staying strategically irrelevant on a defensible mountain. Liechtenstein was bought as a package of estates specifically to qualify for a seat in the Imperial Diet."}'::jsonb)
on conflict (resource_id, position) do nothing;
insert into public.library_resource_blocks (id, resource_id, position, kind, payload)
values ('8074f41b-9b5c-4137-a043-e24510cdabd0', '66cc187f-e761-47c7-a671-6d9889663ddd', 4, 'map', '{"region":"Countries","caption":"Interactive countries map — arriving with the GEOverze map engine."}'::jsonb)
on conflict (resource_id, position) do nothing;
insert into public.library_resource_blocks (id, resource_id, position, kind, payload)
values ('66ab52e0-fe9d-44bf-af29-5ad55b05fbb5', '66cc187f-e761-47c7-a671-6d9889663ddd', 5, 'didYouKnow', '{"text":"Every figure in this entry is cross-linked to the same dataset that powers Countries questions in Let''s Play, so reading here directly sharpens your quiz accuracy."}'::jsonb)
on conflict (resource_id, position) do nothing;

insert into public.library_resource_blocks (id, resource_id, position, kind, payload)
values ('f1ece37d-b7e8-4fe9-a3ba-0b170761e084', '208596fd-e5a2-4ca6-a358-d48f52296de9', 0, 'paragraph', '{"text":"A megacity is any urban agglomeration above ten million people. In 1975 there were three. Today there are more than thirty, and two thirds of them are in Asia."}'::jsonb)
on conflict (resource_id, position) do nothing;
insert into public.library_resource_blocks (id, resource_id, position, kind, payload)
values ('a0cad1c9-a437-4c02-a5f7-2852d2767ab3', '208596fd-e5a2-4ca6-a358-d48f52296de9', 1, 'heading', '{"id":"constraint","text":"The binding constraint"}'::jsonb)
on conflict (resource_id, position) do nothing;
insert into public.library_resource_blocks (id, resource_id, position, kind, payload)
values ('3dc0dd43-c4a3-4900-afc8-917a0e74f2a6', '208596fd-e5a2-4ca6-a358-d48f52296de9', 2, 'paragraph', '{"text":"Housing and transport are solvable with capital. Water is not. Mexico City is sinking as it drains its aquifer, Jakarta is moving its capital function partly because of subsidence, and Cape Town has already run a countdown to Day Zero."}'::jsonb)
on conflict (resource_id, position) do nothing;
insert into public.library_resource_blocks (id, resource_id, position, kind, payload)
values ('5c730b45-4df8-4e2b-a3f6-7e7e2bda597f', '208596fd-e5a2-4ca6-a358-d48f52296de9', 3, 'facts', '{"title":"Largest agglomerations","facts":[{"label":"Tokyo","value":"~37 million"},{"label":"Delhi","value":"~33 million"},{"label":"Shanghai","value":"~29 million"},{"label":"Dhaka","value":"~23 million"}]}'::jsonb)
on conflict (resource_id, position) do nothing;
insert into public.library_resource_blocks (id, resource_id, position, kind, payload)
values ('46105d39-0939-4a0e-a574-eb60b4afb4a0', '208596fd-e5a2-4ca6-a358-d48f52296de9', 4, 'map', '{"region":"Global megacities","caption":"Thirty-three agglomerations above ten million."}'::jsonb)
on conflict (resource_id, position) do nothing;
insert into public.library_resource_blocks (id, resource_id, position, kind, payload)
values ('28d52247-671c-40e5-a80b-b0d49c0f7d5f', '208596fd-e5a2-4ca6-a358-d48f52296de9', 5, 'quote', '{"text":"Cities do not stop growing when they run out of land. They stop when they run out of water.","attribution":"Meridian"}'::jsonb)
on conflict (resource_id, position) do nothing;
insert into public.library_resource_blocks (id, resource_id, position, kind, payload)
values ('253ef647-aa5e-4d88-a915-43b8f42145be', '208596fd-e5a2-4ca6-a358-d48f52296de9', 6, 'map', '{"region":"Capitals","caption":"Interactive capitals map — arriving with the GEOverze map engine."}'::jsonb)
on conflict (resource_id, position) do nothing;
insert into public.library_resource_blocks (id, resource_id, position, kind, payload)
values ('585cba89-bc87-4eae-ad32-36708e186645', '208596fd-e5a2-4ca6-a358-d48f52296de9', 7, 'didYouKnow', '{"text":"Every figure in this entry is cross-linked to the same dataset that powers Capitals questions in Let''s Play, so reading here directly sharpens your quiz accuracy."}'::jsonb)
on conflict (resource_id, position) do nothing;

-- Collection items
insert into public.library_collection_items (collection_id, resource_id, position)
values ('23548ce8-24c5-4a06-af38-1db629780058', '66cc187f-e761-47c7-a671-6d9889663ddd', 0)
on conflict (collection_id, resource_id) do nothing;
insert into public.library_collection_items (collection_id, resource_id, position)
values ('23548ce8-24c5-4a06-af38-1db629780058', '3bb6a8ad-0560-43de-a9f1-81969c0a4c6c', 1)
on conflict (collection_id, resource_id) do nothing;
insert into public.library_collection_items (collection_id, resource_id, position)
values ('23548ce8-24c5-4a06-af38-1db629780058', '684b559f-5a9b-4469-ad23-e14dd3b2761a', 2)
on conflict (collection_id, resource_id) do nothing;

insert into public.library_collection_items (collection_id, resource_id, position)
values ('1f407c90-95df-406c-abac-31a0aa32ed19', '50bd1167-a678-4775-a465-01676c970de1', 0)
on conflict (collection_id, resource_id) do nothing;
insert into public.library_collection_items (collection_id, resource_id, position)
values ('1f407c90-95df-406c-abac-31a0aa32ed19', '208596fd-e5a2-4ca6-a358-d48f52296de9', 1)
on conflict (collection_id, resource_id) do nothing;

insert into public.library_collection_items (collection_id, resource_id, position)
values ('46e4447e-f552-491e-adf9-820030ad0569', '451449b7-d9e1-4a55-ac87-26a008bca624', 0)
on conflict (collection_id, resource_id) do nothing;
insert into public.library_collection_items (collection_id, resource_id, position)
values ('46e4447e-f552-491e-adf9-820030ad0569', '1497d5c2-d8ec-49f6-a3d2-9adc33d5b738', 1)
on conflict (collection_id, resource_id) do nothing;

insert into public.library_collection_items (collection_id, resource_id, position)
values ('c7e88766-e7f2-43c9-a03b-d01fd489aba2', 'a9170d28-bfc1-4c25-ab53-7a72eabf735a', 0)
on conflict (collection_id, resource_id) do nothing;
insert into public.library_collection_items (collection_id, resource_id, position)
values ('c7e88766-e7f2-43c9-a03b-d01fd489aba2', '2f6080fb-cf80-48cd-abd4-77705d073778', 1)
on conflict (collection_id, resource_id) do nothing;

insert into public.library_collection_items (collection_id, resource_id, position)
values ('46beb383-5da5-4df3-abed-add06ac4f048', '65b1d8ac-5bf0-4209-aa0a-437f1d99fcc6', 0)
on conflict (collection_id, resource_id) do nothing;
insert into public.library_collection_items (collection_id, resource_id, position)
values ('46beb383-5da5-4df3-abed-add06ac4f048', '2be8f9b1-0851-4e70-abb9-ee41ac89443c', 1)
on conflict (collection_id, resource_id) do nothing;

insert into public.library_collection_items (collection_id, resource_id, position)
values ('412107af-9a6b-4912-ac30-4c1d70dc20d5', '2f6080fb-cf80-48cd-abd4-77705d073778', 0)
on conflict (collection_id, resource_id) do nothing;
insert into public.library_collection_items (collection_id, resource_id, position)
values ('412107af-9a6b-4912-ac30-4c1d70dc20d5', '684b559f-5a9b-4469-ad23-e14dd3b2761a', 1)
on conflict (collection_id, resource_id) do nothing;
insert into public.library_collection_items (collection_id, resource_id, position)
values ('412107af-9a6b-4912-ac30-4c1d70dc20d5', '1497d5c2-d8ec-49f6-a3d2-9adc33d5b738', 2)
on conflict (collection_id, resource_id) do nothing;

insert into public.library_collection_items (collection_id, resource_id, position)
values ('8f4419e8-b4b6-476b-aec7-cde2cc530a10', '0fdde805-c5f5-4e26-ad65-ee25b509065d', 0)
on conflict (collection_id, resource_id) do nothing;
insert into public.library_collection_items (collection_id, resource_id, position)
values ('8f4419e8-b4b6-476b-aec7-cde2cc530a10', '208596fd-e5a2-4ca6-a358-d48f52296de9', 1)
on conflict (collection_id, resource_id) do nothing;

insert into public.library_collection_items (collection_id, resource_id, position)
values ('2c644fba-17a3-4445-ad76-aef1e77e63f2', '2be8f9b1-0851-4e70-abb9-ee41ac89443c', 0)
on conflict (collection_id, resource_id) do nothing;
insert into public.library_collection_items (collection_id, resource_id, position)
values ('2c644fba-17a3-4445-ad76-aef1e77e63f2', 'a9170d28-bfc1-4c25-ab53-7a72eabf735a', 1)
on conflict (collection_id, resource_id) do nothing;
insert into public.library_collection_items (collection_id, resource_id, position)
values ('2c644fba-17a3-4445-ad76-aef1e77e63f2', '451449b7-d9e1-4a55-ac87-26a008bca624', 2)
on conflict (collection_id, resource_id) do nothing;

-- Verification counts
do $$
declare
  c_creators int;
  c_resources int;
  c_blocks int;
  c_collections int;
  c_items int;
begin
  select count(*) into c_creators from public.library_creators;
  select count(*) into c_resources from public.library_resources;
  select count(*) into c_blocks from public.library_resource_blocks;
  select count(*) into c_collections from public.library_collections;
  select count(*) into c_items from public.library_collection_items;
  if c_creators < 5 then raise exception 'GL-4 seed: expected >= 5 creators, got %', c_creators; end if;
  if c_resources < 14 then raise exception 'GL-4 seed: expected >= 14 resources, got %', c_resources; end if;
  if c_collections < 8 then raise exception 'GL-4 seed: expected >= 8 collections, got %', c_collections; end if;
  if c_blocks < 50 then raise exception 'GL-4 seed: expected >= 50 blocks, got %', c_blocks; end if;
  if c_items < 10 then raise exception 'GL-4 seed: expected >= 10 collection items, got %', c_items; end if;
  raise notice 'GL-4 seed OK: creators=%, resources=%, blocks=%, collections=%, items=%', c_creators, c_resources, c_blocks, c_collections, c_items;
end $$;