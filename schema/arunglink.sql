CREATE TABLE IF NOT EXISTS arunglink (
  slug TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category VARCHAR(50) NOT NULL CHECK (category IN ('academic', 'administration', 'organization', 'event')),
  link TEXT NOT NULL,
  status VARCHAR(10) NOT NULL DEFAULT 'none' CHECK (status IN ('new', 'on', 'none')),
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);