// --- Imports and Setup ---
const express = require('express');
const cors = require('cors');
const { ethers, JsonRpcProvider } = require('ethers');
const { v4: uuidv4 } = require('uuid'); // To generate unique claim IDs
const { create } = require('ipfs-http-client'); // IPFS client
const multer = require('multer'); // Middleware for handling file uploads
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { randomBytes } = require('crypto')
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

// --- IPFS & Multer Setup ---
const ipfs = create({ url: process.env.IPFS_API_URL });
const upload = multer({ storage: multer.memoryStorage() }); // Store files in memory buffer

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

// --- Middleware for Protecting Routes ---
const authenticateOrganizer = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer TOKEN"

    if (token == null) {
        return res.sendStatus(401); // Unauthorized
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, org) => {
        if (err) {
            return res.sendStatus(403); // Forbidden (invalid token)
        }
        req.organization = org; // Add the decoded token payload to the request object
        next(); // Proceed to the next function in the chain
    });
};

const authenticateUser = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) return res.sendStatus(401);

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user; // Add the user payload to the request
        next();
    });
};

// --- API Endpoints ---

/**
 * @api {post} /organizer/issue-badge (multipart/form-data)
 * Now accepts form-data with an image file.
 * @field {File} badgeImage - The image file for the NFT badge.
 * @field {string} organizerAddress
 * @field {string} eventName
 * @field {string} eventDescription
 * @field {number} latitude
 * @field {number} longitude
 * @field {number} radius
 */
app.post('/organizer/issue-badge', authenticateOrganizer, upload.single('badgeImage'), async (req, res) => {
    const { organizerAddress, eventName, eventDescription, latitude, longitude, radius } = req.body;
    
    // Check for the uploaded file
    if (!req.file) {
        return res.status(400).json({ error: 'badgeImage file is required.' });
    }
    // ... (add validation for other fields as before)

    console.log(`Received new badge request from ${organizerAddress} for event "${eventName}"`);

    try {
        // Step 1: Upload the image file to IPFS
        console.log("Uploading image to IPFS...");
        const imageUploadResult = await ipfs.add(req.file.buffer);
        const imageCID = imageUploadResult.cid.toString();
        console.log(`Image uploaded to IPFS. CID: ${imageCID}`);

        // Step 2: Construct the JSON metadata
        const metadata = {
            name: eventName,
            description: eventDescription,
            image: `ipfs://${imageCID}`, // The crucial link to the image
            attributes: [
                { "trait_type": "Organizer", "value": organizerAddress },
                { "trait_type": "Location", "value": `${latitude}, ${longitude}` }
            ]
        };

        // Step 3: Upload the JSON metadata to IPFS
        console.log("Uploading metadata JSON to IPFS...");
        const metadataUploadResult = await ipfs.add(JSON.stringify(metadata));
        const metadataCID = metadataUploadResult.cid.toString();
        const metadataURI = `ipfs://${metadataCID}`;
        console.log(`Metadata uploaded to IPFS. URI: ${metadataURI}`);

        // Step 4: Call the smart contract with the new, real metadataURI
        const tx = await contract.createEvent(metadataURI);
        await tx.wait();
        const eventIdOnChain = Number(await contract.getLatestEventId());
        
        // Step 5: Save to DB and respond (logic is the same as before)
        const claimUUID = uuidv4();
        const claimLink = `http://localhost:${PORT}/claim/${claimUUID}`;
        const db = await dbPromise;
        await db.run(
            'INSERT INTO events (eventIdOnChain, organizerAddress, metadataURI, claimLinkUUID, latitude, longitude, radius) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [eventIdOnChain, organizerAddress, metadataURI, claimUUID, latitude, longitude, radius]
        );
        
        res.status(201).json({
            message: "Event created and assets uploaded to IPFS successfully!",
            claimLink: claimLink,
            metadataURI: metadataURI
        });

    } catch (error) {
        console.error("Error issuing badge with IPFS:", error);
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
 * @api {get} /metadata/:eventIdOnChain (Now reads from IPFS)
 */
app.get('/metadata/:eventIdOnChain', async (req, res) => {
    const { eventIdOnChain } = req.params;
    try {
        const db = await dbPromise;
        const event = await db.get('SELECT metadataURI FROM events WHERE eventIdOnChain = ?', eventIdOnChain);
        if (!event) {
            return res.status(404).json({ error: 'Event not found.' });
        }

        // Step 1: Get the IPFS URI from our database
        const metadataURI = event.metadataURI;
        const cid = metadataURI.replace('ipfs://', '');
        console.log(`Fetching metadata from IPFS for CID: ${cid}`);
        
        // Step 2: Use the IPFS client to fetch the file content
        let content = [];
        for await (const chunk of ipfs.cat(cid)) {
            content.push(chunk);
        }
        
        // Step 3: Decode the content and parse it as JSON
        const metadata = JSON.parse(Buffer.concat(content).toString());
        
        res.status(200).json(metadata);

    } catch (error) {
        console.error("Error fetching metadata from IPFS:", error);
        res.status(500).json({ error: 'Failed to fetch metadata.' });
    }
});

/**
 * @api {post} /auth/organization/register
 * Creates a new organization account.
 */
app.post('/auth/organization/register', async (req, res) => {
    const {
        name, logo_url, website, industry, country, city,
        admin_name, admin_email, password
    } = req.body;

    // Basic validation
    if (!name || !admin_name || !admin_email || !password) {
        return res.status(400).json({ error: 'Required fields are missing.' });
    }

    try {
        const db = await dbPromise;

        // Check if email already exists
        const existingOrg = await db.get('SELECT id FROM organizations WHERE admin_email = ?', admin_email);
        if (existingOrg) {
            return res.status(409).json({ error: 'An account with this email already exists.' });
        }

        // Hash the password before storing it
        const password_hash = await bcrypt.hash(password, 10); // 10 is the salt rounds

        const result = await db.run(
            `INSERT INTO organizations (name, logo_url, website, industry, country, city, admin_name, admin_email, password_hash)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [name, logo_url, website, industry, country, city, admin_name, admin_email, password_hash]
        );

        res.status(201).json({ message: 'Organization registered successfully!', organizationId: result.lastID });
    } catch (error) {
        console.error("Error during organization registration:", error);
        res.status(500).json({ error: 'Server error during registration.' });
    }
});


/**
 * @api {post} /auth/organization/login
 * Logs in an organization and returns a JWT.
 */
app.post('/auth/organization/login', async (req, res) => {
    const { admin_email, password } = req.body;
    if (!admin_email || !password) {
        return res.status(400).json({ error: 'Email and password are required.' });
    }

    try {
        const db = await dbPromise;
        const org = await db.get('SELECT id, password_hash FROM organizations WHERE admin_email = ?', admin_email);

        // Check if org exists and if password is correct
        if (!org || !(await bcrypt.compare(password, org.password_hash))) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        // If credentials are valid, create a JWT
        const payload = {
            orgId: org.id,
            email: admin_email
        };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '8h' }); // Token expires in 8 hours

        res.status(200).json({ message: 'Login successful!', token: token });

    } catch (error) {
        console.error("Error during organization login:", error);
        res.status(500).json({ error: 'Server error during login.' });
    }
});

/**
 * @api {post} /auth/user/challenge
 * Generates a unique message for a user to sign.
 * @body {string} walletAddress - The user's wallet address.
 */
app.post('/auth/user/challenge', async (req, res) => {
    const { walletAddress } = req.body;
    if (!ethers.isAddress(walletAddress)) {
        return res.status(400).json({ error: 'Invalid wallet address.' });
    }
    
    // Generate a secure, random nonce
    const nonce = randomBytes(16).toString('hex');
    const message = `Welcome to Proof of Presence! Sign this message to authenticate.\n\nNonce: ${nonce}`;

    // In a production app, you would save this nonce to the user's record in the DB
    // with an expiry to prevent replay attacks. For now, we send it directly.
    
    res.status(200).json({ message: message });
});


/**
 * @api {post} /auth/user/verify
 * Verifies a signed message and logs the user in, returning a JWT.
 */
app.post('/auth/user/verify', async (req, res) => {
    const { walletAddress, message, signature } = req.body;
    if (!walletAddress || !message || !signature) {
        return res.status(400).json({ error: 'walletAddress, message, and signature are required.' });
    }

    try {
        // Step 1: Verify the signature
        const signerAddress = ethers.verifyMessage(message, signature);
        if (signerAddress.toLowerCase() !== walletAddress.toLowerCase()) {
            return res.status(401).json({ error: 'Signature verification failed. Wallet address does not match signer.' });
        }
        
        const db = await dbPromise;
        
        // Step 2: Find or create the user in the database
        let user = await db.get('SELECT * FROM users WHERE wallet_address = ?', walletAddress);
        if (!user) {
            console.log(`First-time login for ${walletAddress}. Creating user profile.`);
            const result = await db.run('INSERT INTO users (wallet_address) VALUES (?)', walletAddress);
            user = { id: result.lastID, wallet_address: walletAddress };
        }

        // Step 3: Create a JWT for the authenticated user
        const payload = {
            userId: user.id,
            walletAddress: user.wallet_address
        };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '8h' });

        res.status(200).json({ message: 'Login successful!', token: token });

    } catch (error) {
        console.error("Error during user signature verification:", error);
        res.status(500).json({ error: 'Server error during verification.' });
    }
});

// --- User Profile Endpoints ---

/**
 * @api {get} /user/profile
 * Gets the profile of the currently logged-in user. (Protected)
 */
app.get('/user/profile', authenticateUser, async (req, res) => {
    try {
        const db = await dbPromise;
        // req.user is populated by the authenticateUser middleware
        const userProfile = await db.get('SELECT id, wallet_address, display_name, avatar_url, email, joined_at FROM users WHERE id = ?', req.user.userId);
        
        if (!userProfile) {
            return res.status(404).json({ error: 'User profile not found.' });
        }
        res.status(200).json(userProfile);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch user profile.' });
    }
});

/**
 * @api {put} /user/profile
 * Updates the profile of the currently logged-in user. (Protected)
 * @body {string} displayName
 * @body {string} email
 */
app.put('/user/profile', authenticateUser, async (req, res) => {
    const { displayName, email } = req.body;
    // We don't allow changing avatar via this endpoint for simplicity,
    // that would typically be a separate file upload endpoint.

    try {
        const db = await dbPromise;
        await db.run(
            'UPDATE users SET display_name = ?, email = ? WHERE id = ?',
            [displayName, email, req.user.userId]
        );
        res.status(200).json({ message: 'Profile updated successfully.' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update user profile.' });
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