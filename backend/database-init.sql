-- KOL Tracker Pro PostgreSQL Database Schema
-- Replaces MongoDB collections with PostgreSQL tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (for authentication)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    telegram_id BIGINT,
    telegram_username VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);

-- KOLs table
CREATE TABLE IF NOT EXISTS kols (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE,
    username VARCHAR(255) NOT NULL,
    telegram_username VARCHAR(255) UNIQUE,
    display_name VARCHAR(255),
    description TEXT,
    avatar_url TEXT,
    stats JSONB DEFAULT '{}',
    tags TEXT[],
    verification_status VARCHAR(50) DEFAULT 'unverified',
    influence_score INTEGER DEFAULT 0,
    last_activity TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User posts table
CREATE TABLE IF NOT EXISTS user_posts (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE,
    username VARCHAR(255) NOT NULL,
    telegram_username VARCHAR(255),
    text TEXT,
    views INTEGER DEFAULT 0,
    forwards INTEGER DEFAULT 0,
    date TIMESTAMP,
    message_id BIGINT,
    channel_id BIGINT,
    channel_title VARCHAR(255),
    engagement_rate DECIMAL(5,2) DEFAULT 0.0,
    sentiment_score DECIMAL(3,2) DEFAULT 0.5,
    volume_data JSONB DEFAULT '{}',
    fetched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bot detections table
CREATE TABLE IF NOT EXISTS bot_detections (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE,
    username VARCHAR(255) NOT NULL,
    display_name VARCHAR(255),
    telegram_id BIGINT,
    is_bot BOOLEAN DEFAULT FALSE,
    confidence DECIMAL(3,2) DEFAULT 0.0,
    status VARCHAR(50) DEFAULT 'unknown',
    detection_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    profile_analysis JSONB DEFAULT '{}',
    activity_analysis JSONB DEFAULT '{}',
    content_analysis JSONB DEFAULT '{}',
    network_analysis JSONB DEFAULT '{}',
    ai_analysis JSONB DEFAULT '{}',
    metrics JSONB DEFAULT '{}',
    analyzed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- KOL analyses table
CREATE TABLE IF NOT EXISTS kol_analyses (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE,
    username VARCHAR(255) NOT NULL,
    analysis JSONB DEFAULT '{}',
    posts INTEGER DEFAULT 0,
    sentiment_summary JSONB DEFAULT '{}',
    performance_metrics JSONB DEFAULT '{}',
    analyzed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Discovered KOLs table
CREATE TABLE IF NOT EXISTS discovered_kols (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE,
    username VARCHAR(255) NOT NULL,
    display_name VARCHAR(255),
    telegram_username VARCHAR(255),
    discovered_from VARCHAR(255),
    discovery_source VARCHAR(100) DEFAULT 'telegram',
    member_count INTEGER DEFAULT 0,
    engagement_score DECIMAL(5,2) DEFAULT 0.0,
    discovered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Channel scans table
CREATE TABLE IF NOT EXISTS channel_scans (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE,
    channel_name VARCHAR(255) NOT NULL,
    channel_id BIGINT,
    channel_title VARCHAR(255),
    member_count INTEGER DEFAULT 0,
    scan_type VARCHAR(50) DEFAULT 'general',
    scan_results JSONB DEFAULT '{}',
    messages_analyzed INTEGER DEFAULT 0,
    kols_found INTEGER DEFAULT 0,
    scanned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Session storage table (for Telegram sessions)
CREATE TABLE IF NOT EXISTS telegram_sessions (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE,
    user_id INTEGER,
    session_name VARCHAR(255) NOT NULL,
    session_data BYTEA,
    phone_number VARCHAR(20),
    is_authenticated BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_used TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Game results table (for KOL battle games, etc.)
CREATE TABLE IF NOT EXISTS game_results (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE,
    user_id INTEGER,
    game_type VARCHAR(100) NOT NULL,
    game_data JSONB DEFAULT '{}',
    score INTEGER DEFAULT 0,
    duration_seconds INTEGER DEFAULT 0,
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_telegram_id ON users(telegram_id);
CREATE INDEX IF NOT EXISTS idx_kols_telegram_username ON kols(telegram_username);
CREATE INDEX IF NOT EXISTS idx_kols_created_at ON kols(created_at);
CREATE INDEX IF NOT EXISTS idx_user_posts_username ON user_posts(username);
CREATE INDEX IF NOT EXISTS idx_user_posts_date ON user_posts(date);
CREATE INDEX IF NOT EXISTS idx_bot_detections_username ON bot_detections(username);
CREATE INDEX IF NOT EXISTS idx_bot_detections_analyzed_at ON bot_detections(analyzed_at);
CREATE INDEX IF NOT EXISTS idx_kol_analyses_username ON kol_analyses(username);
CREATE INDEX IF NOT EXISTS idx_discovered_kols_discovered_from ON discovered_kols(discovered_from);
CREATE INDEX IF NOT EXISTS idx_channel_scans_channel_name ON channel_scans(channel_name);
CREATE INDEX IF NOT EXISTS idx_telegram_sessions_user_id ON telegram_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_game_results_user_id ON game_results(user_id);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to tables with updated_at column
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_kols_updated_at BEFORE UPDATE ON kols FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_telegram_sessions_updated_at BEFORE UPDATE ON telegram_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 