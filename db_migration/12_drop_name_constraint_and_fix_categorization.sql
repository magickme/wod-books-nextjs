-- Drop unique constraint on name to allow oWoD and nWoD lines with same generic name
ALTER TABLE product_lines DROP CONSTRAINT IF EXISTS product_lines_name_key;

-- Add unique constraint on game_line instead (the actual unique identifier)
ALTER TABLE product_lines ADD CONSTRAINT product_lines_game_line_key UNIQUE (game_line);

-- Now proceed with categorization fix
DO $$
DECLARE
    -- oWoD product lines
    vtm_id INTEGER;
    wta_id INTEGER;
    mta_id INTEGER;
    ctd_id INTEGER;
    htr_id INTEGER;
    dtf_id INTEGER;
    mtr_id INTEGER;

    -- nWoD/CoD product lines (need to create these)
    vtr_id INTEGER;
    wtf_id INTEGER;
    mtaw_id INTEGER;
    ctl_id INTEGER;
    htv_id INTEGER;
    dtd_id INTEGER;
    mtc_id INTEGER;
BEGIN
    -- Get existing oWoD product line IDs
    SELECT product_line_id INTO vtm_id FROM product_lines WHERE game_line = 'Vampire: The Masquerade';
    SELECT product_line_id INTO wta_id FROM product_lines WHERE game_line = 'Werewolf: The Apocalypse';
    SELECT product_line_id INTO mta_id FROM product_lines WHERE game_line = 'Mage: The Ascension';
    SELECT product_line_id INTO ctd_id FROM product_lines WHERE game_line = 'Changeling: The Dreaming';
    SELECT product_line_id INTO htr_id FROM product_lines WHERE game_line = 'Hunter: The Reckoning';
    SELECT product_line_id INTO dtf_id FROM product_lines WHERE game_line = 'Demon: The Fallen';
    SELECT product_line_id INTO mtr_id FROM product_lines WHERE game_line = 'Mummy: The Resurrection';

    -- Check if nWoD product lines exist, if not create them
    SELECT product_line_id INTO vtr_id FROM product_lines WHERE game_line = 'Vampire: The Requiem';
    IF vtr_id IS NULL THEN
        INSERT INTO product_lines (name, setting, abbreviation, game_line, world)
        VALUES ('Vampire', 'CoD', 'VTR', 'Vampire: The Requiem', 'CoD')
        RETURNING product_line_id INTO vtr_id;
        RAISE NOTICE 'Created Vampire: The Requiem product line with ID %', vtr_id;
    END IF;

    SELECT product_line_id INTO wtf_id FROM product_lines WHERE game_line = 'Werewolf: The Forsaken';
    IF wtf_id IS NULL THEN
        INSERT INTO product_lines (name, setting, abbreviation, game_line, world)
        VALUES ('Werewolf', 'CoD', 'WTF', 'Werewolf: The Forsaken', 'CoD')
        RETURNING product_line_id INTO wtf_id;
        RAISE NOTICE 'Created Werewolf: The Forsaken product line with ID %', wtf_id;
    END IF;

    SELECT product_line_id INTO mtaw_id FROM product_lines WHERE game_line = 'Mage: The Awakening';
    IF mtaw_id IS NULL THEN
        INSERT INTO product_lines (name, setting, abbreviation, game_line, world)
        VALUES ('Mage', 'CoD', 'MTAW', 'Mage: The Awakening', 'CoD')
        RETURNING product_line_id INTO mtaw_id;
        RAISE NOTICE 'Created Mage: The Awakening product line with ID %', mtaw_id;
    END IF;

    SELECT product_line_id INTO ctl_id FROM product_lines WHERE game_line = 'Changeling: The Lost';
    IF ctl_id IS NULL THEN
        INSERT INTO product_lines (name, setting, abbreviation, game_line, world)
        VALUES ('Changeling', 'CoD', 'CTL', 'Changeling: The Lost', 'CoD')
        RETURNING product_line_id INTO ctl_id;
        RAISE NOTICE 'Created Changeling: The Lost product line with ID %', ctl_id;
    END IF;

    SELECT product_line_id INTO htv_id FROM product_lines WHERE game_line = 'Hunter: The Vigil';
    IF htv_id IS NULL THEN
        INSERT INTO product_lines (name, setting, abbreviation, game_line, world)
        VALUES ('Hunter', 'CoD', 'HTV', 'Hunter: The Vigil', 'CoD')
        RETURNING product_line_id INTO htv_id;
        RAISE NOTICE 'Created Hunter: The Vigil product line with ID %', htv_id;
    END IF;

    SELECT product_line_id INTO dtd_id FROM product_lines WHERE game_line = 'Demon: The Descent';
    IF dtd_id IS NULL THEN
        INSERT INTO product_lines (name, setting, abbreviation, game_line, world)
        VALUES ('Demon', 'CoD', 'DTD', 'Demon: The Descent', 'CoD')
        RETURNING product_line_id INTO dtd_id;
        RAISE NOTICE 'Created Demon: The Descent product line with ID %', dtd_id;
    END IF;

    SELECT product_line_id INTO mtc_id FROM product_lines WHERE game_line = 'Mummy: The Curse';
    IF mtc_id IS NULL THEN
        INSERT INTO product_lines (name, setting, abbreviation, game_line, world)
        VALUES ('Mummy', 'CoD', 'MTC', 'Mummy: The Curse', 'CoD')
        RETURNING product_line_id INTO mtc_id;
        RAISE NOTICE 'Created Mummy: The Curse product line with ID %', mtc_id;
    END IF;

    -- Now update books to point to correct product lines based on title keywords

    -- Vampire: The Requiem (nWoD)
    UPDATE books SET product_line_id = vtr_id
    WHERE (
        title ILIKE '%Requiem%' OR
        title ILIKE '%VTR%' OR
        title IN (
            'New Wave Requiem',
            'Requiem Chronicler''s Guide',
            'Requiem for Rome',
            'The Blood: The Player''s Guide to the Requiem',
            'Vampire: The Requiem for Dummies'
        )
    )
    AND (product_line_id IS NULL OR product_line_id != vtr_id);

    -- Werewolf: The Forsaken (nWoD)
    UPDATE books SET product_line_id = wtf_id
    WHERE (
        title ILIKE '%Forsaken%' OR
        title ILIKE '%WTF%' OR
        title IN (
            'Forsaken Chronicler''s Guide',
            'Lore of the Forsaken',
            'The Rage: Forsaken Player''s Guide'
        )
    )
    AND (product_line_id IS NULL OR product_line_id != wtf_id);

    -- Mage: The Awakening (nWoD)
    UPDATE books SET product_line_id = mtaw_id
    WHERE (title ILIKE '%Awakening%' OR title ILIKE '%MTAW%')
    AND (product_line_id IS NULL OR product_line_id != mtaw_id)
    AND title NOT ILIKE '%Mind''s Eye Theatre%'; -- Exclude MET books

    -- Changeling: The Lost (nWoD) - comprehensive list based on known supplements
    UPDATE books SET product_line_id = ctl_id
    WHERE (
        title ILIKE '%The Lost%' OR
        title ILIKE '%CTL%' OR
        -- Known Changeling: The Lost supplements
        title IN (
            'Lords of Summer',
            'Rites of Spring',
            'Winter Masques',
            'Dancers in the Dusk',
            'The Equinox Road',
            'Equinox Road',
            'Goblin Markets',
            'Night Horrors: Grim Fears',
            'Victorian Lost',
            'Oak, Ash, and Thorn',
            'Swords at Dawn',
            'Autumn Nightmares'
        )
    )
    AND (product_line_id IS NULL OR product_line_id != ctl_id);

    -- Hunter: The Vigil (nWoD)
    UPDATE books SET product_line_id = htv_id
    WHERE (title ILIKE '%Vigil%' OR title ILIKE '%HTV%')
    AND (product_line_id IS NULL OR product_line_id != htv_id);

    -- Demon: The Descent (nWoD) - comprehensive list
    UPDATE books SET product_line_id = dtd_id
    WHERE (
        title ILIKE '%Descent%' OR
        title ILIKE '%DTD%' OR
        -- Known Demon: The Descent supplements
        title IN (
            'Flowers of Hell: The Demon Players Guide',
            'Heirs to Hell',
            'Splintered City: Seattle',
            'Night Horrors: Enemy Action'
        )
    )
    AND (product_line_id IS NULL OR product_line_id != dtd_id);

    -- Mummy: The Curse (nWoD)
    UPDATE books SET product_line_id = mtc_id
    WHERE (title ILIKE '%The Curse%' OR title ILIKE '%MTC%')
    AND (product_line_id IS NULL OR product_line_id != mtc_id);

    RAISE NOTICE 'Migration complete!';
END $$;

-- Verify the results
SELECT
    pl.world,
    pl.game_line,
    COUNT(b.book_id) as book_count,
    SUM(CASE WHEN b.collected THEN 1 ELSE 0 END) as collected
FROM product_lines pl
LEFT JOIN books b ON b.product_line_id = pl.product_line_id
WHERE pl.world IN ('oWoD', 'CoD')
GROUP BY pl.world, pl.game_line
ORDER BY pl.world, pl.game_line;
