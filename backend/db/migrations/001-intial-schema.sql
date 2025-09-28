-- 001-initial-schema.sql

-- The 'events' table stores information created by the organizer.
CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    eventIdOnChain INTEGER NOT NULL,
    organizerAddress TEXT NOT NULL,
    metadataURI TEXT NOT NULL,
    claimLinkUUID TEXT NOT NULL UNIQUE,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    longitude REAL NOT NULL,
    latitude REAL NOT NULL,
    radius INTEGER NOT NULL
);

-- The 'claims' table tracks who has claimed a badge for which event.
-- This prevents double-minting much more efficiently than checking the blockchain every time.
CREATE TABLE IF NOT EXISTS claims (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    eventId INTEGER NOT NULL,
    attendeeAddress TEXT NOT NULL,
    claimedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(eventId) REFERENCES events(id),
    UNIQUE(eventId, attendeeAddress)
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