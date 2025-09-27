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

// --- API Endpoints ---

/**
 * @api {post} /organizer/issue-badge Create a new POAP event and get a claim link.
 * This is the primary endpoint for organizers.
 */
app.post('/organizer/issue-badge', async (req, res) => {
    // This endpoint code remains the same as the previous step.
    const { organizerAddress, metadataURI } = req.body;
    if (!organizerAddress || !metadataURI || !ethers.isAddress(organizerAddress)) {
        return res.status(400).json({ error: 'organizerAddress and metadataURI are required.' });
    }
    console.log(`Issuing badge for organizer: ${organizerAddress}`);
    try {
        const tx = await contract.createEvent(metadataURI);
        await tx.wait();
        const latestEventId = await contract.getLatestEventId();
        const eventIdOnChain = Number(latestEventId);
        console.log(`Event created on-chain with ID: ${eventIdOnChain}.`);
        const claimUUID = uuidv4();
        const claimLink = `http://localhost:${PORT}/claim/${claimUUID}`;
        const db = await dbPromise;
        await db.run(
            'INSERT INTO events (eventIdOnChain, organizerAddress, metadataURI, claimLinkUUID) VALUES (?, ?, ?, ?)',
            [eventIdOnChain, organizerAddress, metadataURI, claimUUID]
        );
        res.status(201).json({
            message: "Event created successfully!",
            claimLink: claimLink,
            eventId: eventIdOnChain
        });
    } catch (error) {
        console.error("Error issuing badge:", error);
        res.status(500).json({ error: 'Failed to issue badge.' });
    }
});

/**
 * @api {post} /claim/:uuid Allows an attendee to claim their POAP badge using a unique link.
 * @param {string} uuid - The unique identifier for the claim link.
 * @body {string} attendeeAddress - The wallet address of the attendee.
 * @body {string} signature - The personal_sign signature from the attendee's wallet.
 */
app.post('/claim/:uuid', async (req, res) => {
    const { uuid } = req.params;
    const { attendeeAddress, signature } = req.body;

    if (!attendeeAddress || !signature || !ethers.isAddress(attendeeAddress)) {
        return res.status(400).json({ error: 'attendeeAddress and signature are required.' });
    }

    console.log(`Received claim request for UUID ${uuid} from ${attendeeAddress}`);

    try {
        const db = await dbPromise;

        // Step 1: Find the event using the UUID from the URL.
        const event = await db.get('SELECT * FROM events WHERE claimLinkUUID = ?', uuid);
        if (!event) {
            return res.status(404).json({ error: 'Claim link is invalid or has expired.' });
        }

        const eventIdOnChain = event.eventIdOnChain;
        const localEventId = event.id;

        // Step 2: Verify the signature. The message must now match the UUID.
        // This ties the signature to this specific claim link.
        const message = `Claiming POAP for event link: ${uuid}`;
        const signerAddress = ethers.verifyMessage(message, signature);
        if (signerAddress.toLowerCase() !== attendeeAddress.toLowerCase()) {
            return res.status(403).json({ error: 'Invalid signature.' });
        }
        console.log("Signature verified successfully.");

        // Step 3: Check our LOCAL DATABASE for previous claims. This is much faster.
        const existingClaim = await db.get('SELECT id FROM claims WHERE eventId = ? AND attendeeAddress = ?', [localEventId, attendeeAddress]);
        if (existingClaim) {
            return res.status(409).json({ error: 'This address has already claimed this badge.' });
        }

        // Step 4: If all checks pass, submit the minting transaction.
        console.log(`Submitting mintBadge tx for on-chain event ${eventIdOnChain} to attendee ${attendeeAddress}...`);
        const tx = await contract.mintBadge(eventIdOnChain, attendeeAddress);
        await tx.wait();
        console.log(`Transaction successful! Hash: ${tx.hash}`);

        // Step 5: Record the successful claim in our database.
        await db.run('INSERT INTO claims (eventId, attendeeAddress) VALUES (?, ?)', [localEventId, attendeeAddress]);
        console.log(`Claim by ${attendeeAddress} for local event ${localEventId} saved to database.`);

        res.status(200).json({ message: 'Badge claimed successfully!', transactionHash: tx.hash });

    } catch (error) {
        console.error(`Error processing claim for UUID ${uuid}:`, error);
        res.status(500).json({ error: 'Failed to claim badge.' });
    }
});

// Add this new endpoint after the '/claim/:uuid' endpoint

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

// Add this new endpoint after the '/collection/:address' endpoint

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