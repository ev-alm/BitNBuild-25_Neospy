// backend/db/database.js
const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');

// This is an async function that sets up our database
async function setupDb() {
    const db = await open({
        filename: './proof_of_presence.db',
        driver: sqlite3.Database
    });

    // The 'migrate' function will create our table if it doesn't exist
    await db.migrate({
        migrationsPath: './db/migrations', // Path to our migration files
        force: 'last'
    });

    console.log("Database connection established and migrations run.");
    return db;
}

// We will export a promise that resolves with the database object
module.exports = setupDb();