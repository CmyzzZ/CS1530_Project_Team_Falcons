CREATE TABLE IF NOT EXISTS ingredients (
    id TEXT PRIMARY KEY CHECK (btrim(id) <> ''),
    name_en TEXT NOT NULL UNIQUE CHECK (btrim(name_en) <> ''),
    name_zh TEXT NOT NULL UNIQUE CHECK (btrim(name_zh) <> ''),
    aliases TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[]
);

CREATE TABLE IF NOT EXISTS recipes (
    id INTEGER PRIMARY KEY,
    name_en TEXT NOT NULL CHECK (btrim(name_en) <> ''),
    name_zh TEXT NOT NULL CHECK (btrim(name_zh) <> '')
);

CREATE TABLE IF NOT EXISTS recipe_ingredients (
    recipe_id INTEGER NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
    ingredient_id TEXT NOT NULL REFERENCES ingredients(id),
    PRIMARY KEY (recipe_id, ingredient_id)
);