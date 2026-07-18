-- Migration: Create logbook tables for SISDAMAS Digital Platform
-- Created: 2026-07-18

CREATE TABLE IF NOT EXISTS logbook_entry (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nim VARCHAR(50) NOT NULL,
    entry_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(nim, entry_date)
);

CREATE TABLE IF NOT EXISTS logbook_activity (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entry_id UUID NOT NULL REFERENCES logbook_entry(id) ON DELETE CASCADE,
    kegiatan TEXT NOT NULL,
    output TEXT NOT NULL,
    volume INTEGER NOT NULL DEFAULT 1,
    satuan VARCHAR(50) NOT NULL DEFAULT 'kali',
    bukti_foto_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Index for date queries and relationship performance
CREATE INDEX IF NOT EXISTS idx_logbook_entry_nim_date ON logbook_entry(nim, entry_date);
CREATE INDEX IF NOT EXISTS idx_logbook_activity_entry_id ON logbook_activity(entry_id);
