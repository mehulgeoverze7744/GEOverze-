-- Editorial GVRZE Library collections for Basic (limited) and Pro (full) access.
-- Reuses seed_editorial_library_article. Existing articles are not deleted.

CREATE OR REPLACE FUNCTION public._lib_h(_text text)
RETURNS jsonb LANGUAGE sql IMMUTABLE AS $$
  SELECT jsonb_build_object('kind','heading','payload', jsonb_build_object('id','s','text', _text));
$$;

CREATE OR REPLACE FUNCTION public._lib_p(_text text)
RETURNS jsonb LANGUAGE sql IMMUTABLE AS $$
  SELECT jsonb_build_object('kind','paragraph','payload', jsonb_build_object('text', _text));
$$;

CREATE OR REPLACE FUNCTION public._lib_facts(_title text, _facts jsonb)
RETURNS jsonb LANGUAGE sql IMMUTABLE AS $$
  SELECT jsonb_build_object('kind','facts','payload', jsonb_build_object('title', _title, 'facts', _facts));
$$;

CREATE OR REPLACE FUNCTION public._lib_dyk(_text text)
RETURNS jsonb LANGUAGE sql IMMUTABLE AS $$
  SELECT jsonb_build_object('kind','didYouKnow','payload', jsonb_build_object('text', _text));
$$;

CREATE OR REPLACE FUNCTION public._lib_list(_items text[])
RETURNS jsonb LANGUAGE sql IMMUTABLE AS $$
  SELECT jsonb_build_object('kind','list','payload', jsonb_build_object('items', to_jsonb(_items), 'ordered', false));
$$;

REVOKE ALL ON FUNCTION public._lib_h(text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public._lib_p(text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public._lib_facts(text, jsonb) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public._lib_dyk(text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public._lib_list(text[]) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public._lib_h(text) TO service_role;
GRANT EXECUTE ON FUNCTION public._lib_p(text) TO service_role;
GRANT EXECUTE ON FUNCTION public._lib_facts(text, jsonb) TO service_role;
GRANT EXECUTE ON FUNCTION public._lib_dyk(text) TO service_role;
GRANT EXECUTE ON FUNCTION public._lib_list(text[]) TO service_role;

-- Editorial articles were seeded in production via:
--   membership_library_basic_1_5, membership_library_basic_6_10,
--   membership_library_pro_1_6, membership_library_pro_7_12
-- using public.seed_editorial_library_article. Existing articles were preserved.
--
-- Basic slugs:
--   introduction-to-world-geography, understanding-continents-and-oceans,
--   countries-and-their-capitals, introduction-to-world-flags,
--   major-rivers-of-the-world, mountain-ranges-and-their-geography,
--   understanding-time-zones, introduction-to-climate-zones,
--   famous-world-landmarks, geography-of-india
-- Pro slugs:
--   the-geopolitics-of-global-trade-routes,
--   the-worlds-most-extreme-geographical-locations,
--   hidden-geography-unexplored-regions, how-tectonic-plates-shape-our-planet,
--   the-geography-of-global-power, advanced-oceanography-and-deep-sea-geography,
--   the-worlds-most-complex-border-systems,
--   climate-change-and-the-future-of-earths-geography,
--   the-geography-of-natural-disasters,
--   satellite-mapping-and-modern-geospatial-intelligence,
--   the-evolution-of-earths-continents, advanced-atlas-and-regional-geography
