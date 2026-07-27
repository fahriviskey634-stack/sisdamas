-- 003_sticky_note_sync_fix.sql
-- Migration: Tambah kolom flat untuk sinkronisasi sticky notes lintas device
-- Dan ubah data "Aspirasi" menjadi "Harapan"
-- 
-- CARA PAKAI: Copy-paste seluruh isi file ini ke Supabase SQL Editor lalu klik "Run"
-- ===============================================================================

-- 1. Tambah kolom flat yang dibutuhkan frontend (aman kalau sudah ada)
ALTER TABLE sticky_note ADD COLUMN IF NOT EXISTS column_name VARCHAR(50) DEFAULT 'Lainnya';
ALTER TABLE sticky_note ADD COLUMN IF NOT EXISTS rt_number VARCHAR(50) DEFAULT 'Umum';
ALTER TABLE sticky_note ADD COLUMN IF NOT EXISTS author VARCHAR(100) DEFAULT 'Anonim';

-- 2. Ubah column_id jadi nullable (frontend tidak pakai FK ini)
ALTER TABLE sticky_note ALTER COLUMN column_id DROP NOT NULL;

-- 3. Update data lama: rename "Aspirasi" menjadi "Harapan"
UPDATE sticky_note SET column_name = 'Harapan' WHERE column_name = 'Aspirasi';

-- 4. Verifikasi hasil
SELECT column_name, COUNT(*) as jumlah FROM sticky_note GROUP BY column_name ORDER BY column_name;
