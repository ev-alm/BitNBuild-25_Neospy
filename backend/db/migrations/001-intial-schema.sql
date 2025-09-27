-- 001-initial-schema.sql

-- The 'events' table stores information created by the organizer.
CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    eventIdOnChain INTEGER NOT NULL,
    organizerAddress TEXT NOT NULL,
    metadataURI TEXT NOT NULL,
    claimLinkUUID TEXT NOT NULL UNIQUE,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
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