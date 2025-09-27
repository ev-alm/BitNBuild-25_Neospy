CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    walletAddress TEXT NOT NULL UNIQUE,
    userType TEXT NOT NULL CHECK (userType IN ('user', 'organizer')),
    
    -- User-specific fields
    username TEXT UNIQUE,
    displayName TEXT,
    
    -- Organizer-specific fields
    companyName TEXT,
    website TEXT,
    description TEXT,
    
    -- Common fields
    email TEXT NOT NULL UNIQUE,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);