-- Add columns to product_lines table for proper categorization
ALTER TABLE product_lines
ADD COLUMN IF NOT EXISTS game_line VARCHAR(100),
ADD COLUMN IF NOT EXISTS world VARCHAR(20);

-- Update Vampire lines
UPDATE product_lines SET
    game_line = 'Vampire: The Masquerade',
    world = 'oWoD'
WHERE product_line_id = 97;

-- Note: We'll identify Vampire: The Requiem books separately based on title matching

-- Update Werewolf lines
UPDATE product_lines SET
    game_line = 'Werewolf: The Apocalypse',
    world = 'oWoD'
WHERE product_line_id = 98;

-- Update Mage lines
UPDATE product_lines SET
    game_line = 'Mage: The Ascension',
    world = 'oWoD'
WHERE product_line_id = 99;

-- Update Wraith
UPDATE product_lines SET
    game_line = 'Wraith: The Oblivion',
    world = 'oWoD'
WHERE product_line_id = 100;

-- Update Changeling (will split based on book titles)
UPDATE product_lines SET
    game_line = 'Changeling: The Dreaming',
    world = 'oWoD'
WHERE product_line_id = 101;

-- Update Hunter
UPDATE product_lines SET
    game_line = 'Hunter: The Reckoning',
    world = 'oWoD'
WHERE product_line_id = 102;

-- Update Demon
UPDATE product_lines SET
    game_line = 'Demon: The Fallen',
    world = 'oWoD'
WHERE product_line_id = 103;

-- Update Mummy
UPDATE product_lines SET
    game_line = 'Mummy: The Resurrection',
    world = 'oWoD'
WHERE product_line_id = 104;

-- Update Orpheus
UPDATE product_lines SET
    game_line = 'Orpheus',
    world = 'oWoD'
WHERE product_line_id = 105;

-- Update MET (Mind's Eye Theatre - classic WoD)
UPDATE product_lines SET
    game_line = 'Mind''s Eye Theatre',
    world = 'oWoD'
WHERE product_line_id = 107;

-- Update World of Darkness (core)
UPDATE product_lines SET
    game_line = 'World of Darkness',
    world = 'oWoD'
WHERE product_line_id = 106;

-- Update Chronicles of Darkness
UPDATE product_lines SET
    game_line = 'Chronicles of Darkness',
    world = 'CoD'
WHERE product_line_id = 108;

-- Update Beast
UPDATE product_lines SET
    game_line = 'Beast: The Primordial',
    world = 'CoD'
WHERE product_line_id = 109;

-- Update Deviant
UPDATE product_lines SET
    game_line = 'Deviant: The Renegades',
    world = 'CoD'
WHERE product_line_id = 110;

-- Update Geist
UPDATE product_lines SET
    game_line = 'Geist: The Sin-Eaters',
    world = 'CoD'
WHERE product_line_id = 111;

-- Update Promethean
UPDATE product_lines SET
    game_line = 'Promethean: The Created',
    world = 'CoD'
WHERE product_line_id = 112;

-- Now create new product lines for nWoD/CoD versions that share names with oWoD
-- These will be populated based on book title matching

-- Create Vampire: The Requiem
INSERT INTO product_lines (name, setting, abbreviation, game_line, world)
VALUES ('Vampire', 'CoD', 'VTR', 'Vampire: The Requiem', 'CoD')
ON CONFLICT DO NOTHING;

-- Create Werewolf: The Forsaken
INSERT INTO product_lines (name, setting, abbreviation, game_line, world)
VALUES ('Werewolf', 'CoD', 'WTF', 'Werewolf: The Forsaken', 'CoD')
ON CONFLICT DO NOTHING;

-- Create Mage: The Awakening
INSERT INTO product_lines (name, setting, abbreviation, game_line, world)
VALUES ('Mage', 'CoD', 'MTA', 'Mage: The Awakening', 'CoD')
ON CONFLICT DO NOTHING;

-- Create Changeling: The Lost
INSERT INTO product_lines (name, setting, abbreviation, game_line, world)
VALUES ('Changeling', 'CoD', 'CTL', 'Changeling: The Lost', 'CoD')
ON CONFLICT DO NOTHING;

-- Create Hunter: The Vigil
INSERT INTO product_lines (name, setting, abbreviation, game_line, world)
VALUES ('Hunter', 'CoD', 'HTV', 'Hunter: The Vigil', 'CoD')
ON CONFLICT DO NOTHING;

-- Create Mummy: The Curse
INSERT INTO product_lines (name, setting, abbreviation, game_line, world)
VALUES ('Mummy', 'CoD', 'MTC', 'Mummy: The Curse', 'CoD')
ON CONFLICT DO NOTHING;

-- Create Demon: The Descent
INSERT INTO product_lines (name, setting, abbreviation, game_line, world)
VALUES ('Demon', 'CoD', 'DTD', 'Demon: The Descent', 'CoD')
ON CONFLICT DO NOTHING;

-- Get the new product line IDs
DO $$
DECLARE
    vtr_id INTEGER;
    wtf_id INTEGER;
    mta_id INTEGER;
    ctl_id INTEGER;
    htv_id INTEGER;
    mtc_id INTEGER;
    dtd_id INTEGER;
BEGIN
    -- Get new product line IDs
    SELECT product_line_id INTO vtr_id FROM product_lines WHERE game_line = 'Vampire: The Requiem';
    SELECT product_line_id INTO wtf_id FROM product_lines WHERE game_line = 'Werewolf: The Forsaken';
    SELECT product_line_id INTO mta_id FROM product_lines WHERE game_line = 'Mage: The Awakening';
    SELECT product_line_id INTO ctl_id FROM product_lines WHERE game_line = 'Changeling: The Lost';
    SELECT product_line_id INTO htv_id FROM product_lines WHERE game_line = 'Hunter: The Vigil';
    SELECT product_line_id INTO mtc_id FROM product_lines WHERE game_line = 'Mummy: The Curse';
    SELECT product_line_id INTO dtd_id FROM product_lines WHERE game_line = 'Demon: The Descent';

    -- Update books to point to correct product lines based on title

    -- Vampire: The Requiem books
    UPDATE books SET product_line_id = vtr_id
    WHERE title ILIKE '%Requiem%'
    AND product_line_id = 97;

    -- Werewolf: The Forsaken books
    UPDATE books SET product_line_id = wtf_id
    WHERE title ILIKE '%Forsaken%'
    AND product_line_id = 98;

    -- Mage: The Awakening books
    UPDATE books SET product_line_id = mta_id
    WHERE title ILIKE '%Awakening%'
    AND product_line_id = 99;

    -- Changeling: The Lost books
    UPDATE books SET product_line_id = ctl_id
    WHERE (title ILIKE '%The Lost%' OR title ILIKE '%Changeling: The Lost%')
    AND product_line_id = 101;

    -- Hunter: The Vigil books
    UPDATE books SET product_line_id = htv_id
    WHERE title ILIKE '%Vigil%'
    AND product_line_id = 102;

    -- Mummy: The Curse books
    UPDATE books SET product_line_id = mtc_id
    WHERE title ILIKE '%Curse%'
    AND product_line_id = 104;

    -- Demon: The Descent books
    UPDATE books SET product_line_id = dtd_id
    WHERE title ILIKE '%Descent%'
    AND product_line_id = 103;

END $$;

-- Verification query
SELECT
    pl.world,
    pl.game_line,
    COUNT(b.book_id) as book_count,
    SUM(CASE WHEN b.collected THEN 1 ELSE 0 END) as collected
FROM product_lines pl
LEFT JOIN books b ON b.product_line_id = pl.product_line_id
GROUP BY pl.world, pl.game_line
ORDER BY pl.world, pl.game_line;
