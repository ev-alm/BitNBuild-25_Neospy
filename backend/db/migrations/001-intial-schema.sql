-- 001-initial-schema.sql

-- The 'events' table stores information created by the organizer.
CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    eventName TEXT,
    eventDescription TEXT,
    eventIdOnChain INTEGER,
    organizerAddress TEXT NOT NULL,
    metadataURI TEXT,
    claimLinkUUID TEXT NOT NULL UNIQUE,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    longitude REAL,
    latitude REAL,
    radius INTEGER,
    event_type TEXT NOT NULL DEFAULT 'offline',
    event_status TEXT NOT NULL DEFAULT 'active',
    issues_badge BOOLEAN NOT NULL DEFAULT 1,
    estimated_attendees INTEGER,
    event_start_datetime TEXT,
    event_end_datetime TEXT,
    claim_expiry_minutes INTEGER NOT NULL DEFAULT 30
);

-- The 'claims' table tracks who has claimed a badge for which event.
-- This prevents double-minting much more efficiently than checking the blockchain every time.
CREATE TABLE IF NOT EXISTS claims (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    eventId INTEGER NOT NULL,
    attendeeAddress TEXT NOT NULL,
    transaction_hash TEXT,
    token_id INTEGER,
    claimedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(eventId) REFERENCES events(id),
    UNIQUE(eventId, attendeeAddress)
);

-- Create a new table to track "credential" claims for non-badge events.
-- This is the off-chain equivalent of the on-chain 'claims' table.
CREATE TABLE IF NOT EXISTS attendance_creds (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    claimed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(event_id) REFERENCES events(id),
    FOREIGN KEY(user_id) REFERENCES users(id),
    UNIQUE(event_id, user_id)
);

-- Table to store organization profiles and login credentials
CREATE TABLE IF NOT EXISTS organizations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    logo_url TEXT,
    website TEXT,
    industry TEXT,
    country TEXT,
    city TEXT,
    admin_name TEXT NOT NULL,
    admin_email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Table to store profiles for users/attendees
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    wallet_address TEXT NOT NULL UNIQUE,
    display_name TEXT,
    avatar_url TEXT,
    email TEXT,
    joined_at DATETIME DEFAULT CURRENT_TIMESTAMP
);