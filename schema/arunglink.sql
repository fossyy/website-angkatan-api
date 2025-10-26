CREATE TABLE IF NOT EXISTS arunglink (
  slug TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category VARCHAR(50) NOT NULL CHECK (category IN ('academic', 'administration', 'organization', 'event')),
  link TEXT NOT NULL,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);