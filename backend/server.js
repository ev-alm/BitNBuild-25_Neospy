// --- Imports and Setup ---
const express = require("express");
const cors = require("cors");
const { ethers, JsonRpcProvider } = require("ethers");
const { v4: uuidv4 } = require("uuid"); // To generate unique claim IDs
const { create } = require("ipfs-http-client"); // IPFS client
const multer = require("multer"); // Middleware for handling file uploads
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { randomBytes } = require("crypto");
require("dotenv").config();

const dbPromise = require("./db/database.js"); // Our database setup
const contractABI =
  require("../contracts/artifacts/contracts/ProofOfPresence.sol/ProofOfPresence.json").abi;

// --- Ethers & Contract Setup (Same as before) ---
const provider = new JsonRpcProvider(process.env.RPC_URL);
const relayerWallet = new ethers.Wallet(
  process.env.RELAYER_PRIVATE_KEY,
  provider
);
const contractAddress = process.env.CONTRACT_ADDRESS;
if (!contractAddress || !ethers.isAddress(contractAddress)) {
  console.error("FATAL: CONTRACT_ADDRESS is missing or invalid in .env file.");
  process.exit(1);
}
const contract = new ethers.Contract(
  contractAddress,
  contractABI,
  relayerWallet
);
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
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

// --- Middleware for Protecting Routes ---
const authenticateOrganizer = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Format: "Bearer TOKEN"

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
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

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
 * Handles all event creation logic (online/offline, badge/cred). Protected route.
 */
app.post(
  "/organizer/issue-badge",
  authenticateOrganizer,
  upload.single("badgeImage"),
  async (req, res) => {
    const {
      eventName,
      eventDescription,
      latitude,
      longitude,
      radius,
      isOnline,
      issuesBadge,
      estimatedAttendees,
      eventStart,
      eventEnd,
      claimExpiryMinutes,
    } = req.body;

    const issues_badge_bool = issuesBadge === "true";
    const is_online_bool = isOnline === "true";
    const organizationId = req.organization.orgId;

    // --- Validation ---
    if (!eventStart || !eventEnd) {
      return res
        .status(400)
        .json({ error: "Event start and end times are required." });
    }
    if (
      isNaN(startDate.getTime()) ||
      isNaN(endDate.getTime()) ||
      startDate >= endDate
    ) {
      return res.status(400).json({
        error: "Invalid event dates. Start date must be before end date.",
      });
    }
    if (!eventName)
      return res.status(400).json({ error: "Event name is required." });
    if (!is_online_bool && (!latitude || !longitude || !radius)) {
      return res
        .status(400)
        .json({ error: "Location data is required for offline events." });
    }
    if (issues_badge_bool && !req.file) {
      return res
        .status(400)
        .json({ error: "A badge image is required when issuing badges." });
    }

    try {
      let metadataURI = null;
      let eventIdOnChain = null;

      // --- Badge Issuing Logic (On-Chain Interaction) ---
      if (issues_badge_bool) {
        console.log(`Uploading assets to IPFS for NFT badge...`);
        const imageUploadResult = await ipfs.add(req.file.buffer);
        const metadata = {
          name: eventName,
          description: eventDescription || "A Proof of Presence collectible.",
          image: `ipfs://${imageUploadResult.cid.toString()}`,
        };
        const metadataUploadResult = await ipfs.add(JSON.stringify(metadata));
        metadataURI = `ipfs://${metadataUploadResult.cid.toString()}`;

        console.log(`Creating event on-chain with metadata: ${metadataURI}`);
        const tx = await contract.createEvent(metadataURI);
        await tx.wait();
        eventIdOnChain = Number(await contract.getLatestEventId());
      }

      // --- Database Insertion ---
      const startDate = new Date(eventStart);
      const endDate = new Date(eventEnd);
      const claimUUID = uuidv4();
      const claimLink = `http://localhost:${PORT}/claim/${claimUUID}`;
      const db = await dbPromise;

      await db.run(
        `INSERT INTO events (
                eventIdOnChain, organizerAddress, metadataURI, claimLinkUUID, latitude, longitude, radius,
                event_type, issues_badge, estimated_attendees, status,
                event_start_datetime, event_end_datetime, claim_expiry_minutes
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          eventIdOnChain,
          organizationId,
          metadataURI,
          claimUUID,
          is_online_bool ? null : latitude,
          is_online_bool ? null : longitude,
          is_online_bool ? null : radius,
          is_online_bool ? "online" : "offline",
          issues_badge_bool,
          estimatedAttendees || null,
          "active",
          startDate.toISOString(),
          endDate.toISOString(),
          claimExpiryMinutes || 60,
        ]
      );

      console.log(`Event (ID: ${result.lastID}) created in database.`);
      res.status(201).json({
        message: "Event created successfully!",
        claimLink: claimLink,
        issuesBadge: issues_badge_bool,
      });
    } catch (error) {
      console.error("Error issuing badge/cred:", error);
      res.status(500).json({ error: "Failed to create event." });
    }
  }
);

/**
 * @api {post} /claim/:uuid Smart claim endpoint for both Badges (NFTs) and Credentials (off-chain).
 */
app.post("/claim/:uuid", authenticateUser, async (req, res) => {
  // Now a protected route
  const { uuid } = req.params;
  const { attendeeLatitude, attendeeLongitude } = req.body;
  const userId = req.user.userId; // User must be logged in to claim
  const userWalletAddress = req.user.walletAddress;

  try {
    const db = await dbPromise;
    const event = await db.get(
      "SELECT * FROM events WHERE claimLinkUUID = ?",
      uuid
    );

    if (!event)
      return res.status(404).json({ error: "Claim link is invalid." });

    if (event.status !== "active") {
      return res
        .status(403)
        .json({ error: "This event is not active or has been cancelled." });
    }

    const now = new Date();
    const eventEnd = new Date(event.event_end_datetime);

    const expiryTime = new Date(eventEnd.getTime());
    expiryTime.setMinutes(expiryTime.getMinutes() + event.claim_expiry_minutes);

    if (now > expiryTime) {
      return res.status(403).json({
        error: `The claim period for this event has expired. The link was valid until ${expiryTime.toLocaleString()}.`,
      });
    }

    // --- Location Check for Offline Events ---
    if (event.event_type === "offline") {
      const distance = getDistanceInMeters(
        event.latitude,
        event.longitude,
        attendeeLatitude,
        attendeeLongitude
      );
      if (distance > event.radius) {
        return res
          .status(403)
          .json({ error: `You are too far from the event location.` });
      }
    }

    // --- Smart Claim Logic ---
    if (event.issues_badge) {
      // ON-CHAIN: Mint an NFT Badge
      const existingClaim = await db.get(
        "SELECT id FROM claims WHERE eventId = ? AND attendeeAddress = ?",
        [event.id, userWalletAddress]
      );
      if (existingClaim)
        return res.status(409).json({ error: "Badge already claimed." });

      console.log(`Minting NFT for event ${event.id} for user ${userId}...`);
      const tx = await contract.mintBadge(
        event.eventIdOnChain,
        userWalletAddress
      );
      await tx.wait();

      await db.run(
        "INSERT INTO claims (eventId, attendeeAddress) VALUES (?, ?)",
        [event.id, userWalletAddress]
      );
      res.status(200).json({
        message: "NFT Badge claimed successfully!",
        transactionHash: tx.hash,
      });
    } else {
      // OFF-CHAIN: Record a Credential
      const existingCred = await db.get(
        "SELECT id FROM attendance_creds WHERE event_id = ? AND user_id = ?",
        [event.id, userId]
      );
      if (existingCred)
        return res.status(409).json({ error: "Credential already claimed." });

      console.log(
        `Recording credential for event ${event.id} for user ${userId}...`
      );
      await db.run(
        "INSERT INTO attendance_creds (event_id, user_id) VALUES (?, ?)",
        [event.id, userId]
      );
      res
        .status(200)
        .json({ message: "Attendance Credential claimed successfully!" });
    }
  } catch (error) {
    console.error(`Error processing claim for UUID ${uuid}:`, error);
    res.status(500).json({ error: "Failed to process claim." });
  }
});

/**
 * @api {get} /collection/:address Retrieve all POAPs claimed by a specific wallet address.
 * @param {string} address - The wallet address of the user.
 */
app.get("/collection/:address", async (req, res) => {
  const { address } = req.params;

  if (!ethers.isAddress(address)) {
    return res.status(400).json({ error: "Invalid wallet address provided." });
  }

  console.log(`Fetching collection for address: ${address}`);

  try {
    const db = await dbPromise;

    // This SQL query joins the claims and events tables to gather all relevant
    // information for the badges owned by the specified address.
    const badges = await db.all(
      `
            SELECT
                e.eventIdOnChain,
                e.metadataURI,
                e.organizerAddress,
                c.claimedAt
            FROM claims c
            JOIN events e ON c.eventId = e.id
            WHERE c.attendeeAddress = ?
            ORDER BY c.claimedAt DESC
        `,
      address
    );

    if (!badges || badges.length === 0) {
      console.log(`No badges found for address: ${address}`);
      return res.status(200).json([]); // Return an empty array if no badges are found
    }

    console.log(`Found ${badges.length} badge(s) for address: ${address}`);
    res.status(200).json(badges);
  } catch (error) {
    console.error(`Error fetching collection for ${address}:`, error);
    res.status(500).json({ error: "Failed to fetch collection." });
  }
});

/**
 * @api {get} /metadata/:eventIdOnChain (Now reads from IPFS)
 */
app.get("/metadata/:eventIdOnChain", async (req, res) => {
  const { eventIdOnChain } = req.params;
  try {
    const db = await dbPromise;
    const event = await db.get(
      "SELECT metadataURI FROM events WHERE eventIdOnChain = ?",
      eventIdOnChain
    );
    if (!event) {
      return res.status(404).json({ error: "Event not found." });
    }

    // Step 1: Get the IPFS URI from our database
    const metadataURI = event.metadataURI;
    const cid = metadataURI.replace("ipfs://", "");
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
    res.status(500).json({ error: "Failed to fetch metadata." });
  }
});

/**
 * @api {post} /auth/organization/register
 * Creates a new organization account.
 */
app.post("/auth/organization/register", async (req, res) => {
  const {
    name,
    logo_url,
    website,
    industry,
    country,
    city,
    admin_name,
    admin_email,
    password,
  } = req.body;

  // Basic validation
  if (!name || !admin_name || !admin_email || !password) {
    return res.status(400).json({ error: "Required fields are missing." });
  }

  try {
    const db = await dbPromise;

    // Check if email already exists
    const existingOrg = await db.get(
      "SELECT id FROM organizations WHERE admin_email = ?",
      admin_email
    );
    if (existingOrg) {
      return res
        .status(409)
        .json({ error: "An account with this email already exists." });
    }

    // Hash the password before storing it
    const password_hash = await bcrypt.hash(password, 10); // 10 is the salt rounds

    const result = await db.run(
      `INSERT INTO organizations (name, logo_url, website, industry, country, city, admin_name, admin_email, password_hash)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        logo_url,
        website,
        industry,
        country,
        city,
        admin_name,
        admin_email,
        password_hash,
      ]
    );

    res.status(201).json({
      message: "Organization registered successfully!",
      organizationId: result.lastID,
    });
  } catch (error) {
    console.error("Error during organization registration:", error);
    res.status(500).json({ error: "Server error during registration." });
  }
});

/**
 * @api {post} /auth/organization/login
 * Logs in an organization and returns a JWT.
 */
app.post("/auth/organization/login", async (req, res) => {
  const { admin_email, password } = req.body;
  if (!admin_email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  try {
    const db = await dbPromise;
    const org = await db.get(
      "SELECT id, password_hash FROM organizations WHERE admin_email = ?",
      admin_email
    );

    // Check if org exists and if password is correct
    if (!org || !(await bcrypt.compare(password, org.password_hash))) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    // If credentials are valid, create a JWT
    const payload = {
      orgId: org.id,
      email: admin_email,
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "8h",
    }); // Token expires in 8 hours

    res.status(200).json({ message: "Login successful!", token: token });
  } catch (error) {
    console.error("Error during organization login:", error);
    res.status(500).json({ error: "Server error during login." });
  }
});

/**
 * @api {post} /auth/user/challenge
 * Generates a unique message for a user to sign.
 * @body {string} walletAddress - The user's wallet address.
 */
app.post("/auth/user/challenge", async (req, res) => {
  const { walletAddress } = req.body;
  if (!ethers.isAddress(walletAddress)) {
    return res.status(400).json({ error: "Invalid wallet address." });
  }

  // Generate a secure, random nonce
  const nonce = randomBytes(16).toString("hex");
  const message = `Welcome to Proof of Presence! Sign this message to authenticate.\n\nNonce: ${nonce}`;

  // In a production app, you would save this nonce to the user's record in the DB
  // with an expiry to prevent replay attacks. For now, we send it directly.

  res.status(200).json({ message: message });
});

/**
 * @api {post} /auth/user/verify
 * Verifies a signed message and logs the user in, returning a JWT.
 */
app.post("/auth/user/verify", async (req, res) => {
  const { walletAddress, message, signature } = req.body;
  if (!walletAddress || !message || !signature) {
    return res
      .status(400)
      .json({ error: "walletAddress, message, and signature are required." });
  }

  try {
    // Step 1: Verify the signature
    const signerAddress = ethers.verifyMessage(message, signature);
    if (signerAddress.toLowerCase() !== walletAddress.toLowerCase()) {
      return res.status(401).json({
        error:
          "Signature verification failed. Wallet address does not match signer.",
      });
    }

    const db = await dbPromise;

    // Step 2: Find or create the user in the database
    let user = await db.get(
      "SELECT * FROM users WHERE wallet_address = ?",
      walletAddress
    );
    if (!user) {
      console.log(
        `First-time login for ${walletAddress}. Creating user profile.`
      );
      const result = await db.run(
        "INSERT INTO users (wallet_address) VALUES (?)",
        walletAddress
      );
      user = { id: result.lastID, wallet_address: walletAddress };
    }

    // Step 3: Create a JWT for the authenticated user
    const payload = {
      userId: user.id,
      walletAddress: user.wallet_address,
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "8h",
    });

    res.status(200).json({ message: "Login successful!", token: token });
  } catch (error) {
    console.error("Error during user signature verification:", error);
    res.status(500).json({ error: "Server error during verification." });
  }
});

// --- User Profile Endpoints ---

/**
 * @api {get} /user/profile
 * Gets the profile of the currently logged-in user. (Protected)
 */
app.get("/user/profile", authenticateUser, async (req, res) => {
  try {
    const db = await dbPromise;
    // req.user is populated by the authenticateUser middleware
    const userProfile = await db.get(
      "SELECT id, wallet_address, display_name, avatar_url, email, joined_at FROM users WHERE id = ?",
      req.user.userId
    );

    if (!userProfile) {
      return res.status(404).json({ error: "User profile not found." });
    }
    res.status(200).json(userProfile);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user profile." });
  }
});

/**
 * @api {put} /user/profile
 * Updates the profile of the currently logged-in user. (Protected)
 * @body {string} displayName
 * @body {string} email
 */
app.put("/user/profile", authenticateUser, async (req, res) => {
  const { displayName, email } = req.body;
  // We don't allow changing avatar via this endpoint for simplicity,
  // that would typically be a separate file upload endpoint.

  try {
    const db = await dbPromise;
    await db.run("UPDATE users SET display_name = ?, email = ? WHERE id = ?", [
      displayName,
      email,
      req.user.userId,
    ]);
    res.status(200).json({ message: "Profile updated successfully." });
  } catch (error) {
    res.status(500).json({ error: "Failed to update user profile." });
  }
});

/**
 * @api {put} /organizer/profile
 * Updates the profile of the currently logged-in organization.
 */
app.put("/organizer/profile", authenticateOrganizer, async (req, res) => {
  const organizationId = req.organization.orgId;
  // We only allow updating non-critical fields. Email/password would be separate flows.
  const { name, logo_url, website, industry, country, city, admin_name } =
    req.body;

  try {
    const db = await dbPromise;
    // The COALESCE function is a safe way to update: if a new value isn't provided,
    // it keeps the existing value from the database.
    await db.run(
      `
            UPDATE organizations SET
                name = COALESCE(?, name),
                logo_url = COALESCE(?, logo_url),
                website = COALESCE(?, website),
                industry = COALESCE(?, industry),
                country = COALESCE(?, country),
                city = COALESCE(?, city),
                admin_name = COALESCE(?, admin_name)
            WHERE id = ?
        `,
      [
        name,
        logo_url,
        website,
        industry,
        country,
        city,
        admin_name,
        organizationId,
      ]
    );

    res
      .status(200)
      .json({ message: "Organization profile updated successfully." });
  } catch (error) {
    console.error("Error updating organization profile:", error);
    res.status(500).json({ error: "Failed to update profile." });
  }
});

/**
 * @api {put} /organizer/event/:id/cancel
 * Cancels an event. Can only be done by the event's creator.
 */
app.put(
  "/organizer/event/:id/cancel",
  authenticateOrganizer,
  async (req, res) => {
    const organizationId = req.organization.orgId;
    const { id: eventId } = req.params; // The local DB ID of the event

    try {
      const db = await dbPromise;

      // Security Check: First, verify that the event belongs to the logged-in organizer
      const event = await db.get(
        "SELECT id, organizerAddress FROM events WHERE id = ?",
        eventId
      );

      if (!event) {
        return res.status(404).json({ error: "Event not found." });
      }
      if (event.organizerAddress !== organizationId) {
        return res
          .status(403)
          .json({ error: "Forbidden: You are not the creator of this event." });
      }

      // If checks pass, update the event status to 'cancelled'
      await db.run(
        `UPDATE events SET status = 'cancelled' WHERE id = ?`,
        eventId
      );

      res
        .status(200)
        .json({ message: "Event has been successfully cancelled." });
    } catch (error) {
      console.error(`Error cancelling event ${eventId}:`, error);
      res.status(500).json({ error: "Failed to cancel event." });
    }
  }
);

// --- Organizer Dashboard Endpoints ---

/**
 * @api {get} /organizer/dashboard
 * Retrieves aggregated statistics and event lists for the logged-in organizer.
 */
app.get("/organizer/dashboard", authenticateOrganizer, async (req, res) => {
  const organizationId = req.organization.orgId;

  try {
    const db = await dbPromise;

    // --- STATISTIC CALCULATIONS ---

    // 1. Total Events created by this organizer
    const totalEventsResult = await db.get(
      "SELECT COUNT(*) as totalEvents FROM events WHERE organizerAddress = ?",
      organizationId
    );

    // 2. Active Events (we'll define 'active' as created in the last 30 days for this example)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const activeEventsResult = await db.get(
      `SELECT COUNT(*) as activeEvents FROM events WHERE organizerAddress = ? AND createdAt > ?`,
      organizationId,
      thirtyDaysAgo.toISOString()
    );

    // 3. Total Badges Distributed (sum of claims for badge-issuing events)
    const badgesDistributedResult = await db.get(
      `
            SELECT COUNT(c.id) as badgesDistributed
            FROM claims c
            JOIN events e ON c.eventId = e.id
            WHERE e.organizerAddress = ? AND e.issues_badge = 1
        `,
      organizationId
    );

    // 4. Claim Rate (total claims / total estimated attendees for events with estimates)
    const claimRateStats = await db.get(
      `
            SELECT
                SUM(e.estimated_attendees) as totalEstimatedAttendees,
                (SELECT COUNT(*) FROM claims c JOIN events e2 ON c.eventId = e2.id WHERE e2.organizerAddress = ?) as totalBadgeClaims,
                (SELECT COUNT(*) FROM attendance_creds ac JOIN events e3 ON ac.event_id = e3.id WHERE e3.organizerAddress = ?) as totalCredClaims
            FROM events e
            WHERE e.organizerAddress = ? AND e.estimated_attendees IS NOT NULL
        `,
      [organizationId, organizationId, organizationId]
    );

    let claimRate = 0;
    if (claimRateStats.totalEstimatedAttendees > 0) {
      const totalClaims =
        claimRateStats.totalBadgeClaims + claimRateStats.totalCredClaims;
      claimRate = (totalClaims / claimRateStats.totalEstimatedAttendees) * 100;
    }

    // --- EVENT LISTS ---

    // 5. Fetch Recent/All Events
    const allEvents = await db.all(
      `
            SELECT
                id,
                eventName,
                event_type,
                issues_badge,
                claimLinkUUID,
                createdAt,
                (SELECT COUNT(*) FROM claims WHERE eventId = e.id) + (SELECT COUNT(*) FROM attendance_creds WHERE event_id = e.id) as totalClaims
            FROM events e
            WHERE organizerAddress = ?
            ORDER BY createdAt DESC
        `,
      organizationId
    );

    // --- COMPILE RESPONSE ---
    const dashboardData = {
      stats: {
        totalEvents: totalEventsResult.totalEvents || 0,
        activeEvents: activeEventsResult.activeEvents || 0,
        badgesDistributed: badgesDistributedResult.badgesDistributed || 0,
        claimRate: parseFloat(claimRate.toFixed(2)), // Format to 2 decimal places
      },
      events: allEvents,
    };

    res.status(200).json(dashboardData);
  } catch (error) {
    console.error("Error fetching organizer dashboard data:", error);
    res.status(500).json({ error: "Failed to fetch dashboard data." });
  }
});

// --- Attendee (User) Dashboard & Discovery Endpoints ---

/**
 * @api {get} /user/dashboard
 * Retrieves aggregated statistics for the logged-in user. Protected route.
 */
app.get("/user/dashboard", authenticateUser, async (req, res) => {
  const userId = req.user.userId;
  const userWalletAddress = req.user.walletAddress;

  try {
    const db = await dbPromise;

    // 1. Total Badges (NFTs claimed)
    const totalBadgesResult = await db.get(
      `
            SELECT COUNT(*) as totalBadges FROM claims WHERE attendeeAddress = ?
        `,
      userWalletAddress
    );

    // 2. Total Events Attended (includes both badge and cred claims)
    const totalCredsResult = await db.get(
      `
            SELECT COUNT(*) as totalCreds FROM attendance_creds WHERE user_id = ?
        `,
      userId
    );

    const totalEventsAttended =
      (totalBadgesResult.totalBadges || 0) + (totalCredsResult.totalCreds || 0);

    // 3. Rare Badges (This is a conceptual example. We'll define "rare" as an event
    // where fewer than 10 total badges have been claimed so far.)
    const rareBadgesResult = await db.get(
      `
            SELECT COUNT(*) as rareBadges
            FROM claims c
            JOIN (
                SELECT eventId, COUNT(*) as totalClaims
                FROM claims
                GROUP BY eventId
                HAVING totalClaims < 10
            ) as rareEvents ON c.eventId = rareEvents.eventId
            WHERE c.attendeeAddress = ?
        `,
      userWalletAddress
    );

    const dashboardData = {
      stats: {
        totalBadges: totalBadgesResult.totalBadges || 0,
        rareBadges: rareBadgesResult.rareBadges || 0,
        totalEventsAttended: totalEventsAttended,
      },
    };

    res.status(200).json(dashboardData);
  } catch (error) {
    console.error("Error fetching user dashboard data:", error);
    res.status(500).json({ error: "Failed to fetch dashboard data." });
  }
});

/**
 * @api {get} /events/discover
 * Public endpoint to discover upcoming online and nearby offline events.
 * @query {number} [latitude] - User's current latitude.
 * @query {number} [longitude] - User's current longitude.
 * @query {number} [radiusKm=50] - Search radius in kilometers for nearby events.
 */
app.get("/events/discover", async (req, res) => {
  const { latitude, longitude, radiusKm = 50 } = req.query;

  try {
    const db = await dbPromise;
    const nowISO = new Date().toISOString();

    // Fetch all active & upcoming events (online and offline)
    const events = await db.all(
      `
      SELECT 
        id, 
        eventName, 
        event_type, 
        issues_badge, 
        event_start_datetime, 
        event_end_datetime, 
        latitude, 
        longitude
      FROM events
      WHERE 
        status = 'active'
        AND event_end_datetime > ?
        AND event_type IN ('online', 'offline')
      ORDER BY event_start_datetime ASC
      LIMIT 50
    `,
      nowISO
    );

    const onlineEvents = events.filter(
      (event) => event.event_type === "online"
    );
    let nearbyEvents = [];

    if (latitude && longitude) {
      const lat = parseFloat(latitude);
      const lon = parseFloat(longitude);
      const radiusMeters = parseInt(radiusKm) * 1000;

      nearbyEvents = events.filter((event) => {
        if (event.event_type !== "offline") return false;
        if (!event.latitude || !event.longitude) return false;

        const distance = getDistanceInMeters(
          lat,
          lon,
          event.latitude,
          event.longitude
        );
        return distance <= radiusMeters;
      });
    }

    res.status(200).json({
      online: onlineEvents,
      nearby: nearbyEvents,
    });
  } catch (error) {
    console.error("Error fetching discoverable events:", error);
    res.status(500).json({ error: "Failed to fetch events." });
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
