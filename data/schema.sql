-- FOUNDryAI — Database Schema
-- Optional: for saving blueprints / analytics

CREATE TABLE IF NOT EXISTS blueprints (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    query       TEXT NOT NULL,
    provider    VARCHAR(20) NOT NULL,
    markdown    TEXT NOT NULL,
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata    JSONB DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS feedback (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    blueprint_id  UUID REFERENCES blueprints(id) ON DELETE CASCADE,
    rating        SMALLINT CHECK (rating BETWEEN 1 AND 5),
    comment       TEXT,
    created_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_blueprints_created ON blueprints (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_blueprints_provider ON blueprints (provider);
