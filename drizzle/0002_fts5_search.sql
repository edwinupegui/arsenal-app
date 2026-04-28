-- FTS5 Full-Text Search Migration
-- Search 2.0: FTS5 + Tags + Sort

-- Create FTS5 virtual table with unicode61 tokenizer for accent-insensitive search
CREATE VIRTUAL TABLE resources_fts USING fts5(
  title,
  description,
  content='resources',
  content_rowid='id',
  tokenize='unicode61 remove_diacritics 1'
);

-- Populate FTS table with existing data
INSERT INTO resources_fts(rowid, title, description)
SELECT id, title, description FROM resources;

-- Trigger to insert into FTS when a new resource is created
CREATE TRIGGER resources_ai AFTER INSERT ON resources BEGIN
  INSERT INTO resources_fts(rowid, title, description)
  VALUES (new.id, new.title, new.description);
END;

-- Trigger to delete from FTS when a resource is deleted
CREATE TRIGGER resources_ad AFTER DELETE ON resources BEGIN
  INSERT INTO resources_fts(resources_fts, rowid, title, description)
  VALUES ('delete', old.id, old.title, old.description);
END;

-- Trigger to update FTS when a resource is updated
CREATE TRIGGER resources_au AFTER UPDATE ON resources BEGIN
  INSERT INTO resources_fts(resources_fts, rowid, title, description)
  VALUES ('delete', old.id, old.title, old.description);
  INSERT INTO resources_fts(rowid, title, description)
  VALUES (new.id, new.title, new.description);
END;