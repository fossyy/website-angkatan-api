CREATE TABLE IF NOT EXISTS public.mahasiswa (
    id SERIAL PRIMARY KEY,
    nama VARCHAR(100) NOT NULL,
    panggilan VARCHAR(50),
    jurusan VARCHAR(100) NOT NULL,
    birthdate DATE,
    sosmed JSONB,
    description TEXT,
    message TEXT,
    interests TEXT[],
    avatar TEXT
);

CREATE TABLE IF NOT EXISTS message (
    id SERIAL PRIMARY KEY,
    mahasiswa_id INT NOT NULL REFERENCES mahasiswa(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);