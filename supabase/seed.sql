-- ============================================================================
-- Seed: Master World Tour & Expedition Beyond the Ice Wall
-- ============================================================================

-- ----------------------------------------------------------------------------
-- ITINERARIES
-- ----------------------------------------------------------------------------
insert into itineraries (slug, title, subtitle, realm_type, hero_description, sequence_order) values
('known-world', 'The Known World Tour', 'Seven legs, one continuous circuit',
  'known', 'A circumnavigation departing Willard, Utah — ancient sites, megaliths, and scripture-adjacent landmarks across seven legs.', 1),
('beyond-the-ice-wall', 'Expedition Beyond the Ice Wall', 'The speculative continuation',
  'speculative', 'A fictional, speculative extension of the tour departing from the known world''s southern edge into an imagined realm beyond Antarctica.', 2);

-- ----------------------------------------------------------------------------
-- LEGS — Part I: Known World
-- ----------------------------------------------------------------------------
insert into legs (itinerary_id, title, description, sequence_order, realm_type)
select id, v.title, v.description, v.seq, 'known'
from itineraries, (values
  ('Leg 1: The Americas, Aztec Sites & Olmec Heads', 'Mesoamerican and Andean sites departing Willard, Utah.', 1),
  ('Leg 2: Oceania & Southeast Asia', 'Auckland to Bangkok.', 2),
  ('Leg 3: Middle East & Scripture Sites', 'Dubai through Lebanon.', 3),
  ('Leg 4: Russia & Siberian Megaliths', 'Moscow to the Shoria Mountains.', 4),
  ('Leg 5: Eastern Turkey & Reverse Orient Express', 'Göbeklitepe to Vienna by rail.', 5),
  ('Leg 6: The Alps, Spain, Italy & Monaco', 'Zermatt to Monte-Carlo.', 6),
  ('Leg 7: Scotland & Ireland', 'Highlands and the Giant''s Causeway.', 7)
) as v(title, description, seq)
where itineraries.slug = 'known-world';

-- ----------------------------------------------------------------------------
-- LEGS — Part II: Beyond the Ice Wall (speculative / fictional)
-- ----------------------------------------------------------------------------
insert into legs (itinerary_id, title, description, sequence_order, realm_type)
select id, v.title, v.description, v.seq, 'speculative'
from itineraries, (values
  ('Phase 1: Crossing the Known Barrier', 'Fictional framing device: departure from the charted world.', 1),
  ('Phase 2: Breaching the Gates of Enoch & Outer Realm', 'Invented geography — no real-world coordinates.', 2),
  ('Phase 3: Central Plains of Pan & Watchers'' Descent', 'Invented geography — no real-world coordinates.', 3)
) as v(title, description, seq)
where itineraries.slug = 'beyond-the-ice-wall';

-- ----------------------------------------------------------------------------
-- WAYPOINTS — Leg 1: The Americas
-- ----------------------------------------------------------------------------
insert into waypoints (leg_id, name, latitude, longitude, description, highlights, sequence_order)
select id, v.name, v.lat, v.lng, v.description, v.highlights, v.seq
from legs, (values
  ('Mexico City', 19.4326, -99.1332, 'CDMX, Templo Mayor, Teotihuacan.', array['Templo Mayor','Teotihuacan pyramids'], 1),
  ('Villahermosa', 17.9895, -92.9475, 'Parque-Museo La Venta — colossal Olmec heads.', array['Olmec colossal heads'], 2),
  ('Venezuela — Cerro Autana / Auyán-tepui', 5.9500, -67.4500, 'Tepui formations; Angel Falls.', array['Cerro Autana','Angel Falls'], 3),
  ('Cusco & Machu Picchu', -13.1631, -72.5450, 'Inca capital and citadel.', array['Machu Picchu','Sacsayhuamán'], 4),
  ('Salar de Uyuni', -20.1338, -67.4891, 'World''s largest salt flat.', array['Mirror salt flats'], 5),
  ('Easter Island / Rapa Nui', -27.1127, -109.3497, 'Moai statues.', array['Moai','Rano Raraku quarry'], 6)
) as v(name, lat, lng, description, highlights, seq)
where legs.title = 'Leg 1: The Americas, Aztec Sites & Olmec Heads';

-- ----------------------------------------------------------------------------
-- WAYPOINTS — Leg 2: Oceania & SE Asia
-- ----------------------------------------------------------------------------
insert into waypoints (leg_id, name, latitude, longitude, description, highlights, sequence_order)
select id, v.name, v.lat, v.lng, v.description, v.highlights, v.seq
from legs, (values
  ('Auckland', -36.8485, 174.7633, 'Gateway to New Zealand.', array['Sky Tower','Waiheke Island'], 1),
  ('Sydney', -33.8688, 151.2093, 'Harbour city.', array['Opera House','Harbour Bridge'], 2),
  ('Melbourne', -37.8136, 144.9631, 'Cultural capital.', array['Laneways','Great Ocean Road day trip'], 3),
  ('Singapore', 1.3521, 103.8198, 'City-state hub.', array['Gardens by the Bay'], 4),
  ('Bangkok', 13.7563, 100.5018, 'Temples and markets.', array['Wat Arun','Grand Palace'], 5)
) as v(name, lat, lng, description, highlights, seq)
where legs.title = 'Leg 2: Oceania & Southeast Asia';

-- ----------------------------------------------------------------------------
-- WAYPOINTS — Leg 3: Middle East & Scripture Sites
-- ----------------------------------------------------------------------------
insert into waypoints (leg_id, name, latitude, longitude, description, highlights, sequence_order)
select id, v.name, v.lat, v.lng, v.description, v.highlights, v.seq
from legs, (values
  ('Dubai', 25.2048, 55.2708, 'UAE.', array['Burj Khalifa'], 1),
  ('Tabuk / Jabal al-Lawz', 28.6600, 35.3000, 'Candidate site for Mount Sinai in some traditions; Split Rock of Horeb.', array['Jabal al-Lawz','Split Rock of Horeb'], 2),
  ('Cairo / Giza', 29.9773, 31.1325, 'Pyramids of Giza.', array['Great Pyramid','Sphinx'], 3),
  ('Baalbek', 34.0059, 36.2039, 'Roman megalithic complex; Cedars of God nearby.', array['Baalbek trilithon','Cedars of God'], 4)
) as v(name, lat, lng, description, highlights, seq)
where legs.title = 'Leg 3: Middle East & Scripture Sites';

-- ----------------------------------------------------------------------------
-- WAYPOINTS — Leg 4: Russia & Siberian Megaliths
-- ----------------------------------------------------------------------------
insert into waypoints (leg_id, name, latitude, longitude, description, highlights, sequence_order)
select id, v.name, v.lat, v.lng, v.description, v.highlights, v.seq
from legs, (values
  ('Moscow', 55.7558, 37.6173, 'Red Square.', array['Red Square','Kremlin'], 1),
  ('Baksan Valley / Mount Elbrus', 43.3499, 42.4453, 'Caucasus shaft sites.', array['Mount Elbrus'], 2),
  ('Shoria Mountains / Novokuznetsk', 53.7557, 87.1099, 'Siberian megalith claims.', array['Mountain Shoria megaliths'], 3)
) as v(name, lat, lng, description, highlights, seq)
where legs.title = 'Leg 4: Russia & Siberian Megaliths';

-- ----------------------------------------------------------------------------
-- WAYPOINTS — Leg 5: Eastern Turkey & Reverse Orient Express
-- ----------------------------------------------------------------------------
insert into waypoints (leg_id, name, latitude, longitude, description, highlights, sequence_order)
select id, v.name, v.lat, v.lng, v.description, v.highlights, v.seq
from legs, (values
  ('Göbeklitepe', 37.2231, 38.9224, 'Oldest known megalithic temple complex.', array['Enclosure D'], 1),
  ('Mount Ararat', 39.7019, 44.2983, 'Traditional Noah''s Ark landing site.', array['Ararat summit views'], 2),
  ('Derinkuyu', 38.3728, 34.7350, 'Underground city, Cappadocia.', array['8 subterranean levels'], 3),
  ('Istanbul → Sofia → Bucharest → Budapest → Vienna', 41.0082, 28.9784, 'Reverse Orient Express rail route.', array['Sirkeci Terminal','Orient Express route'], 4)
) as v(name, lat, lng, description, highlights, seq)
where legs.title = 'Leg 5: Eastern Turkey & Reverse Orient Express';

-- ----------------------------------------------------------------------------
-- WAYPOINTS — Leg 6: The Alps, Spain, Italy & Monaco
-- ----------------------------------------------------------------------------
insert into waypoints (leg_id, name, latitude, longitude, description, highlights, sequence_order)
select id, v.name, v.lat, v.lng, v.description, v.highlights, v.seq
from legs, (values
  ('Zermatt / Matterhorn', 46.0207, 7.7491, 'Swiss Alps.', array['Matterhorn views'], 1),
  ('Camino de Santiago', 42.8805, -8.5456, 'Pilgrimage route, Spain.', array['Santiago de Compostela cathedral'], 2),
  ('Rome', 41.9028, 12.4964, 'Italy.', array['Colosseum','Vatican'], 3),
  ('Monte-Carlo', 43.7384, 7.4246, 'Monaco.', array['Casino de Monte-Carlo'], 4)
) as v(name, lat, lng, description, highlights, seq)
where legs.title = 'Leg 6: The Alps, Spain, Italy & Monaco';

-- ----------------------------------------------------------------------------
-- WAYPOINTS — Leg 7: Scotland & Ireland
-- ----------------------------------------------------------------------------
insert into waypoints (leg_id, name, latitude, longitude, description, highlights, sequence_order)
select id, v.name, v.lat, v.lng, v.description, v.highlights, v.seq
from legs, (values
  ('Scottish Highlands', 57.0000, -4.5000, 'Glens and lochs.', array['Loch Ness','Isle of Skye'], 1),
  ('Giant''s Causeway', 55.2408, -6.5116, 'Basalt columns, Northern Ireland.', array['Hexagonal basalt columns'], 2)
) as v(name, lat, lng, description, highlights, seq)
where legs.title = 'Leg 7: Scotland & Ireland';

-- ----------------------------------------------------------------------------
-- WAYPOINTS — Part II (speculative / fictional — no real coordinates)
-- ----------------------------------------------------------------------------
insert into waypoints (leg_id, name, latitude, longitude, fictional_coordinates, description, highlights, sequence_order)
select id, v.name, v.lat, v.lng, v.fic, v.description, v.highlights, v.seq
from legs, (values
  ('Ushuaia', -54.8019, -68.3030, null, 'Southernmost city; real-world departure point for the fictional Phase 1.', array['End of the world port'], 1),
  ('Drake Passage', -60.0000, -65.0000, null, 'Real body of water; crossing narrated as fiction.', array['Open-ocean crossing'], 2),
  ('Ross Ice Shelf / "Point of Finé"', -79.5000, -175.0000, 'invented waypoint name', 'Real ice shelf; "Point of Finé" is an invented waypoint name for this app''s story.', array['Fictional narrative marker'], 3)
) as v(name, lat, lng, fic, description, highlights, seq)
where legs.title = 'Phase 1: Crossing the Known Barrier';

insert into waypoints (leg_id, name, latitude, longitude, fictional_coordinates, description, highlights, sequence_order)
select id, v.name, null, null, v.fic, v.description, v.highlights, v.seq
from legs, (values
  ('The Gates of Enoch', 'invented — no real coordinates', 'Wholly fictional location invented for this app''s narrative.', array['Story waypoint'], 1),
  ('Archipelago of Thule', 'invented — no real coordinates', 'Wholly fictional location invented for this app''s narrative.', array['Story waypoint'], 2),
  ('The Sea of Hyperborea', 'invented — no real coordinates', 'Wholly fictional location invented for this app''s narrative.', array['Story waypoint'], 3)
) as v(name, fic, description, highlights, seq)
where legs.title = 'Phase 2: Breaching the Gates of Enoch & Outer Realm';

insert into waypoints (leg_id, name, latitude, longitude, fictional_coordinates, description, highlights, sequence_order)
select id, v.name, null, null, v.fic, v.description, v.highlights, v.seq
from legs, (values
  ('Central Plains of Pan', 'invented — no real coordinates', 'Wholly fictional location invented for this app''s narrative.', array['Story waypoint'], 1),
  ('The Watchers'' Descent', 'invented — no real coordinates', 'Wholly fictional location invented for this app''s narrative.', array['Story waypoint'], 2)
) as v(name, fic, description, highlights, seq)
where legs.title = 'Phase 3: Central Plains of Pan & Watchers'' Descent';
