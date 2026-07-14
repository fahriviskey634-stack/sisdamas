-- 001_initial_schema.sql
-- Initial Schema Migration for SISDAMAS Digital Platform (KKN Kelompok 56 Sukahaji)
-- Created: 2026-07-14

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. System & Admin Group
CREATE TABLE IF NOT EXISTS project (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- user_profile table (extends auth.users)
CREATE TABLE IF NOT EXISTS user_profile (
    id UUID PRIMARY KEY, -- Will link to auth.users.id
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('super_admin', 'kkn_member')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 2. Geographic Hierarchy Group
CREATE TABLE IF NOT EXISTS dusun (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES project(id) ON DELETE RESTRICT,
    name VARCHAR(100) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS rw (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dusun_id UUID NOT NULL REFERENCES dusun(id) ON DELETE RESTRICT,
    rw_number VARCHAR(10) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(dusun_id, rw_number)
);

CREATE TABLE IF NOT EXISTS rt (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rw_id UUID NOT NULL REFERENCES rw(id) ON DELETE RESTRICT,
    rt_number VARCHAR(10) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(rw_id, rt_number)
);

-- 3. Survey Domain Group
CREATE TABLE IF NOT EXISTS household (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rt_id UUID NOT NULL REFERENCES rt(id) ON DELETE RESTRICT,
    kk_name VARCHAR(150) NOT NULL,
    kk_number VARCHAR(50),
    latitude NUMERIC(10, 7) NOT NULL,
    longitude NUMERIC(10, 7) NOT NULL,
    gps_accuracy NUMERIC(5, 2),
    survey_status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (survey_status IN ('pending', 'completed', 'verified', 'locked', 'rejected')),
    created_by UUID REFERENCES user_profile(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS survey (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    household_id UUID NOT NULL REFERENCES household(id) ON DELETE CASCADE,
    surveyor_id UUID NOT NULL REFERENCES user_profile(id) ON DELETE RESTRICT,
    project_id UUID NOT NULL REFERENCES project(id) ON DELETE RESTRICT,
    family_size INTEGER NOT NULL CHECK (family_size >= 1),
    housing_status VARCHAR(50) NOT NULL,
    housing_condition VARCHAR(50) NOT NULL,
    client_uuid UUID UNIQUE,
    submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS problem (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    survey_id UUID NOT NULL REFERENCES survey(id) ON DELETE CASCADE,
    category VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS potential (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    survey_id UUID NOT NULL REFERENCES survey(id) ON DELETE CASCADE,
    category VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS household_photo (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    household_id UUID NOT NULL REFERENCES household(id) ON DELETE CASCADE,
    storage_url TEXT NOT NULL,
    caption VARCHAR(255),
    uploaded_by UUID REFERENCES user_profile(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 4. Sticky Notes Group (Cycle 1)
CREATE TABLE IF NOT EXISTS sticky_board (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES project(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sticky_column (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    board_id UUID NOT NULL REFERENCES sticky_board(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    sort_order INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS sticky_note (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    column_id UUID NOT NULL REFERENCES sticky_column(id) ON DELETE CASCADE,
    user_id UUID REFERENCES user_profile(id) ON DELETE SET NULL,
    rt_id UUID REFERENCES rt(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    color VARCHAR(30) NOT NULL DEFAULT 'yellow',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 5. Priority & Action Group (Cycles 3-4)
CREATE TABLE IF NOT EXISTS priority_matrix (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES project(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    is_locked BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS priority_item (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    matrix_id UUID NOT NULL REFERENCES priority_matrix(id) ON DELETE CASCADE,
    problem_id UUID REFERENCES problem(id) ON DELETE SET NULL,
    manual_problem_text TEXT,
    urgency INTEGER NOT NULL CHECK (urgency BETWEEN 1 AND 5),
    seriousness INTEGER NOT NULL CHECK (seriousness BETWEEN 1 AND 5),
    growth INTEGER NOT NULL CHECK (growth BETWEEN 1 AND 5),
    total_score INTEGER NOT NULL,
    rank_number INTEGER,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS program (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    priority_item_id UUID NOT NULL REFERENCES priority_item(id) ON DELETE RESTRICT,
    pic_id UUID REFERENCES user_profile(id) ON DELETE SET NULL,
    name VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'completed', 'cancelled')),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS program_task (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    program_id UUID NOT NULL REFERENCES program(id) ON DELETE CASCADE,
    assignee_id UUID REFERENCES user_profile(id) ON DELETE SET NULL,
    title VARCHAR(150) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'done')),
    due_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 6. Supporting Group
CREATE TABLE IF NOT EXISTS document (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES project(id) ON DELETE RESTRICT,
    uploaded_by UUID REFERENCES user_profile(id) ON DELETE SET NULL,
    file_name VARCHAR(255) NOT NULL,
    storage_url TEXT NOT NULL,
    doc_type VARCHAR(100) NOT NULL,
    sisdamas_cycle VARCHAR(50) NOT NULL,
    drive_link TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS notification (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES user_profile(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES user_profile(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id UUID NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_household_rt_id ON household(rt_id);
CREATE INDEX IF NOT EXISTS idx_household_survey_status ON household(survey_status);
CREATE INDEX IF NOT EXISTS idx_household_deleted_at ON household(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_survey_household_id ON survey(household_id);
CREATE INDEX IF NOT EXISTS idx_survey_deleted_at ON survey(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_problem_survey_id ON problem(survey_id);
CREATE INDEX IF NOT EXISTS idx_potential_survey_id ON potential(survey_id);
CREATE INDEX IF NOT EXISTS idx_sticky_note_column_id ON sticky_note(column_id);
CREATE INDEX IF NOT EXISTS idx_priority_item_matrix_id ON priority_item(matrix_id);
CREATE INDEX IF NOT EXISTS idx_program_task_program_id ON program_task(program_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON audit_log(created_at);
