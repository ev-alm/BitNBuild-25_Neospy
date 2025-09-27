-- Update your database schema to include password field
ALTER TABLE users ADD COLUMN password TEXT;

-- Example of how your users table should look:
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    walletAddress TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE,
    email TEXT UNIQUE NOT NULL,
    displayName TEXT,
    companyName TEXT,
    website TEXT,
    description TEXT,
    password TEXT NOT NULL,
    userType TEXT NOT NULL CHECK (userType IN ('user', 'organizer')),
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);