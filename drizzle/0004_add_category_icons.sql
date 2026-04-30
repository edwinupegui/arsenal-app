-- Add new category icons
-- shield, database, check, briefcase, trending

ALTER TABLE categories ADD COLUMN icon TEXT NOT NULL DEFAULT 'bookmark';
UPDATE categories SET icon = 'shield' WHERE id = 6;
UPDATE categories SET icon = 'database' WHERE id = 7;
UPDATE categories SET icon = 'check' WHERE id = 8;
UPDATE categories SET icon = 'briefcase' WHERE id = 9;

-- Add constraint to enforce icon values
CREATE INDEX IF NOT EXISTS category_icon_idx ON categories(icon);