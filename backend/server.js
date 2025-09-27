// --- Imports and Setup ---
const express = require('express');
const cors = require('cors');
const { ethers, JsonRpcProvider } = require('ethers');
const { v4: uuidv4 } = require('uuid'); // To generate unique claim IDs
require('dotenv').config();

const dbPromise = require('./db/database.js'); // Our database setup
const contractABI = require('../contracts/artifacts/contracts/ProofOfPresence.sol/ProofOfPresence.json').abi;

// --- Ethers & Contract Setup (Same as before) ---
const provider = new JsonRpcProvider(process.env.RPC_URL);
const relayerWallet = new ethers.Wallet(process.env.RELAYER_PRIVATE_KEY, provider);
const contractAddress = process.env.CONTRACT_ADDRESS;
if (!contractAddress || !ethers.isAddress(contractAddress)) {
    console.error("FATAL: CONTRACT_ADDRESS is missing or invalid in .env file.");
    process.exit(1);
}
const contract = new ethers.Contract(contractAddress, contractABI, relayerWallet);
console.log(`Connected to contract at: ${contract.target}`);
console.log(`Relayer Wallet Address: ${relayerWallet.address}`);

// --- Express App Setup ---
const app = express();
const PORT = process.env.PORT || 3001;
app.use(cors());
app.use(express.json());

// --- Helper Functions ---

/**
 * Calculates the distance between two GPS coordinates in meters.
 * @param {number} lat1 Latitude of point 1
 * @param {number} lon1 Longitude of point 1
 * @param {number} lat2 Latitude of point 2
 * @param {number} lon2 Longitude of point 2
 * @returns {number} The distance in meters.
 */
function getDistanceInMeters(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
}

// --- API Endpoints ---

/**
 * @api {post} /organizer/issue-badge Create a new POAP event with location data.
 * @body {string} organizerAddress
 * @body {string} metadataURI
 * @body {number} latitude - The latitude of the event venue.
 * @body {number} longitude - The longitude of the event venue.
 * @body {number} radius - The valid claim radius in meters.
 */
app.post('/organizer/issue-badge', async (req, res) => {
    // Now expecting location data in the request body
    const { organizerAddress, metadataURI, latitude, longitude, radius } = req.body;

    // --- NEW: Enhanced Validation ---
    if (!organizerAddress || !metadataURI || latitude === undefined || longitude === undefined || radius === undefined) {
        return res.status(400).json({ error: 'organizerAddress, metadataURI, latitude, longitude, and radius are required.' });
    }
    if (!ethers.isAddress(organizerAddress)) {
        return res.status(400).json({ error: 'Invalid organizerAddress.' });
    }
    if (radius <= 0) {
        return res.status(400).json({ error: 'Radius must be a positive number.' });
    }

    console.log(`Issuing badge for organizer ${organizerAddress} at [${latitude}, ${longitude}] with a ${radius}m radius.`);

    try {
        // Step 1: Create event on-chain (this logic remains the same)
        const tx = await contract.createEvent(metadataURI);
        await tx.wait();
        const eventIdOnChain = Number(await contract.getLatestEventId());
        console.log(`Event created on-chain with ID: ${eventIdOnChain}.`);

        // Step 2: Generate unique claim link (this logic remains the same)
        const claimUUID = uuidv4();
        const claimLink = `http://localhost:${PORT}/claim/${claimUUID}`;

        // Step 3: --- UPDATED: Save event details WITH location to our database ---
        const db = await dbPromise;
        await db.run(
            'INSERT INTO events (eventIdOnChain, organizerAddress, metadataURI, claimLinkUUID, latitude, longitude, radius) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [eventIdOnChain, organizerAddress, metadataURI, claimUUID, latitude, longitude, radius]
        );
        
        console.log(`Event with location data saved to database.`);

        // Step 4: Return the unique claim link to the organizer (this logic remains the same)
        res.status(201).json({
            message: "Event with location verification created successfully!",
            claimLink: claimLink,
            eventId: eventIdOnChain
        });

    } catch (error) {
        console.error("Error issuing badge:", error);
        res.status(500).json({ error: 'Failed to issue badge.' });
    }
});

/**
 * @api {post} /claim/:uuid Allows an attendee to claim their POAP badge with location verification.
 * @param {string} uuid
 * @body {string} attendeeAddress
 * @body {string} signature
 * @body {number} attendeeLatitude - The attendee's current latitude.
 * @body {number} attendeeLongitude - The attendee's current longitude.
 */
app.post('/claim/:uuid', async (req, res) => {
    const { uuid } = req.params;
    // Now expecting attendee's location data
    const { attendeeAddress, signature, attendeeLatitude, attendeeLongitude } = req.body;

    if (!attendeeAddress || !signature || attendeeLatitude === undefined || attendeeLongitude === undefined) {
        return res.status(400).json({ error: 'attendeeAddress, signature, and location data are required.' });
    }
    // ... other validation remains the same

    try {
        const db = await dbPromise;

        // Step 1: Find the event and its location rules from the DB
        const event = await db.get('SELECT * FROM events WHERE claimLinkUUID = ?', uuid);
        if (!event) {
            return res.status(404).json({ error: 'Claim link is invalid or has expired.' });
        }
        
        // --- NEW: Step 2: Perform Location Check ---
        // If the event has location data, we must enforce the check.
        if (event.latitude !== null && event.longitude !== null) {
            const distance = getDistanceInMeters(
                event.latitude,
                event.longitude,
                attendeeLatitude,
                attendeeLongitude
            );

            console.log(`Attendee is ${Math.round(distance)} meters away from the event center.`);

            // If the attendee is outside the allowed radius, reject the claim.
            if (distance > event.radius) {
                return res.status(403).json({ 
                    error: `You are too far from the event location. You are ${Math.round(distance)}m away, but must be within ${event.radius}m.` 
                });
            }
            console.log("Location check passed.");
        }

        // Steps 3, 4, 5, etc. (Signature check, DB claim check, minting) remain the same...
        const message = `Claiming POAP for event link: ${uuid}`;
        const signerAddress = ethers.verifyMessage(message, signature);
        if (signerAddress.toLowerCase() !== attendeeAddress.toLowerCase()) {
            return res.status(403).json({ error: 'Invalid signature.' });
        }
        console.log("Signature verified successfully.");

        const existingClaim = await db.get('SELECT id FROM claims WHERE eventId = ? AND attendeeAddress = ?', [event.id, attendeeAddress]);
        if (existingClaim) {
            return res.status(409).json({ error: 'This address has already claimed this badge.' });
        }

        const tx = await contract.mintBadge(event.eventIdOnChain, attendeeAddress);
        await tx.wait();
        console.log(`Transaction successful! Hash: ${tx.hash}`);

        await db.run('INSERT INTO claims (eventId, attendeeAddress) VALUES (?, ?)', [event.id, attendeeAddress]);

        res.status(200).json({ message: 'Badge claimed successfully!', transactionHash: tx.hash });

    } catch (error) {
        console.error(`Error processing claim for UUID ${uuid}:`, error);
        res.status(500).json({ error: 'Failed to claim badge.' });
    }
});

/**
 * @api {get} /collection/:address Retrieve all POAPs claimed by a specific wallet address.
 * @param {string} address - The wallet address of the user.
 */
app.get('/collection/:address', async (req, res) => {
    const { address } = req.params;

    if (!ethers.isAddress(address)) {
        return res.status(400).json({ error: 'Invalid wallet address provided.' });
    }

    console.log(`Fetching collection for address: ${address}`);

    try {
        const db = await dbPromise;

        // This SQL query joins the claims and events tables to gather all relevant
        // information for the badges owned by the specified address.
        const badges = await db.all(`
            SELECT
                e.eventIdOnChain,
                e.metadataURI,
                e.organizerAddress,
                c.claimedAt
            FROM claims c
            JOIN events e ON c.eventId = e.id
            WHERE c.attendeeAddress = ?
            ORDER BY c.claimedAt DESC
        `, address);

        if (!badges || badges.length === 0) {
            console.log(`No badges found for address: ${address}`);
            return res.status(200).json([]); // Return an empty array if no badges are found
        }

        console.log(`Found ${badges.length} badge(s) for address: ${address}`);
        res.status(200).json(badges);

    } catch (error) {
        console.error(`Error fetching collection for ${address}:`, error);
        res.status(500).json({ error: 'Failed to fetch collection.' });
    }
});

/**
 * @api {get} /metadata/:eventIdOnChain Retrieve the ERC-721 metadata for a specific POAP.
 * @param {number} eventIdOnChain - The on-chain ID of the event.
 */
app.get('/metadata/:eventIdOnChain', async (req, res) => {
    const { eventIdOnChain } = req.params;
    const eventId = parseInt(eventIdOnChain);

    if (isNaN(eventId) || eventId <= 0) {
        return res.status(400).json({ error: 'A valid on-chain event ID is required.' });
    }

    console.log(`Fetching metadata for on-chain event ID: ${eventId}`);

    try {
        const db = await dbPromise;

        // Find the event in our database using its on-chain ID
        const event = await db.get('SELECT * FROM events WHERE eventIdOnChain = ?', eventId);

        if (!event) {
            return res.status(404).json({ error: 'Metadata for the specified event not found.' });
        }

        // --- IPFS Data Fetching Simulation ---
        // In a real-world application, you would use an IPFS client (like ipfs-http-client)
        // to fetch the content from event.metadataURI.
        // For this test, we will simulate it by returning a structured JSON object.
        // We can imagine the metadataURI contains the data for "Crypto Dev Meetup".
        
        const metadata = {
            name: `Crypto Dev Meetup #${event.eventIdOnChain}`,
            description: "A digital souvenir commemorating attendance at the Crypto Dev Meetup. This badge proves you were there!",
            image: "ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi/chainlink-logo.png", // Using a real, public IPFS image link for a good example
            attributes: [
                {
                    "trait_type": "Event Date",
                    "value": new Date(event.createdAt).toLocaleDateString()
                },
                {
                    "trait_type": "Organizer",
                    "value": event.organizerAddress
                }
            ]
        };

        console.log(`Serving metadata for event ${eventId}`);
        res.status(200).json(metadata);

    } catch (error) {
        console.error(`Error fetching metadata for event ${eventId}:`, error);
        res.status(500).json({ error: 'Failed to fetch metadata.' });
    }
});

// --- Server Start ---
// We wrap the server start in a function to ensure the DB is ready first.
async function startServer() {
    await dbPromise; // Make sure the database is connected
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
}

startServer();