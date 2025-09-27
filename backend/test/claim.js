// test_claim.js (v2 - API Driven)

const { ethers, Wallet } = require('ethers');
const axios = require('axios');

// --- Configuration ---
const BACKEND_URL = 'http://localhost:3001';

// Wallets from the Hardhat Node. These should match the private keys from npx hardhat node.
const ORGANIZER_PRIVATE_KEY = '0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a'; // Account #2
const ATTENDEE_PRIVATE_KEY = '0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6';  // Account #3

// --- Helper Setup ---
// We don't need a provider here as we are not directly talking to the blockchain.
const organizerWallet = new Wallet(ORGANIZER_PRIVATE_KEY);
const attendeeWallet = new Wallet(ATTENDEE_PRIVATE_KEY);

async function runTest() {
    console.log("--- Starting API-Driven POAP Claim Test ---");
    console.log(`Organizer Address: ${organizerWallet.address}`);
    console.log(`Attendee Address: ${attendeeWallet.address}`);

    let claimLink = '';
    let claimUUID = '';

    // === Step 1: Organizer calls the /organizer/issue-badge API ===
    console.log("\n--- Step 1: Organizer is issuing a badge ---");
    try {
        const response = await axios.post(`${BACKEND_URL}/organizer/issue-badge`, {
            organizerAddress: organizerWallet.address,
            metadataURI: "ipfs://new_event_from_api"
        });

        console.log("✅ SUCCESS: Event created via API.");
        console.log("Response Data:", response.data);
        claimLink = response.data.claimLink;
        
        // Extract the UUID from the full claim link URL
        claimUUID = claimLink.split('/').pop();
        if (!claimUUID) {
            throw new Error("Could not parse UUID from claim link.");
        }
        console.log(`Extracted Claim UUID: ${claimUUID}`);

    } catch (error) {
        console.error("❌ ERROR: Failed to issue badge via API!");
        logApiError(error);
        return; // Stop the test if this fails
    }

    // === Step 2: Attendee Signs the Claim Message with the UUID ===
    console.log("\n--- Step 2: Attendee is signing the claim message ---");
    const message = `Claiming POAP for event link: ${claimUUID}`;
    console.log(`Signing message: "${message}"`);
    const signature = await attendeeWallet.signMessage(message);
    console.log("Generated Signature:", signature);

    // === Step 3: Attendee calls the unique /claim/:uuid API Endpoint ===
    console.log("\n--- Step 3: Attendee is claiming the badge via the unique link ---");
    try {
        const response = await axios.post(claimLink, { // Use the full claimLink URL
            attendeeAddress: attendeeWallet.address,
            signature: signature
        });

        console.log("✅ SUCCESS: Badge claimed successfully via API!");
        console.log("Response Data:", response.data);

    } catch (error) {
        console.error("❌ ERROR: Failed to claim badge via API!");
        logApiError(error);
    }
}

// Helper function to log detailed API errors
function logApiError(error) {
    if (error.response) {
        console.error("Response Status:", error.response.status);
        console.error("Response Data:", error.response.data);
    } else {
        console.error("Error message:", error.message);
    }
}

runTest();