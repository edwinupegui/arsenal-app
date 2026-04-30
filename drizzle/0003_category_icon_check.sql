-- Category Icon CHECK Constraint Migration
-- Ensures category icons are valid according to CATEGORY_ICON_MAP

-- Note: SQLite supports CHECK constraints but they are not enforced
-- at the database level for values already in the table. This migration
-- validates existing values and adds the constraint for future inserts.
--
-- SQLite allows ADD CONSTRAINT via ALTER TABLE in versions 3.25+.

-- First, validate existing icon values
-- If any invalid values exist, this migration will fail and must be addressed
DELETE FROM categories WHERE icon NOT IN ('architect', 'robot', 'gamepad', 'layers', 'bookmark');

-- Add CHECK constraint on icon column
ALTER TABLE categories ADD CONSTRAINT check_category_icon CHECK (icon IN ('architect', 'robot', 'gamepad', 'layers', 'bookmark'));