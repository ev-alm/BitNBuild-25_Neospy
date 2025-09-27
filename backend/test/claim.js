// test_claim.js (v3 - Location Aware)

const { Wallet } = require('ethers');
const axios = require('axios');

// --- Configuration ---
const BACKEND_URL = 'http://localhost:3001';

// Wallets from the Hardhat Node
const ORGANIZER_PRIVATE_KEY = '0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a'; // Account #2
const ATTENDEE_PRIVATE_KEY = '0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6';  // Account #3

// --- Location Data ---
const EVENT_LOCATION = {
    latitude: 48.8584, // Eiffel Tower Lat
    longitude: 2.2945, // Eiffel Tower Lon
    radius: 200 // 200 meter radius
};

// A location within the 200m radius
const ATTENDEE_LOCATION_VALID = {
    latitude: 48.8580,
    longitude: 2.2946
};

// A location far outside the 200m radius
const ATTENDEE_LOCATION_INVALID = {
    latitude: 48.8628, // Approx 500m away
    longitude: 2.2872
};


// --- Helper Setup ---
const organizerWallet = new Wallet(ORGANIZER_PRIVATE_KEY);
const attendeeWallet = new Wallet(ATTENDEE_PRIVATE_KEY);

async function runTests() {
    console.log("--- Starting Location-Aware POAP Claim Test ---");
    console.log(`Event will be created at [${EVENT_LOCATION.latitude}, ${EVENT_LOCATION.longitude}] with a ${EVENT_LOCATION.radius}m radius.`);
    
    let claimLink = '';
    let claimUUID = '';

    // === Step 1: Organizer creates a location-based event ===
    console.log("\n--- Step 1: Organizer is issuing a location-based badge ---");
    try {
        const response = await axios.post(`${BACKEND_URL}/organizer/issue-badge`, {
            organizerAddress: organizerWallet.address,
            metadataURI: "ipfs://location-aware-event",
            latitude: EVENT_LOCATION.latitude,
            longitude: EVENT_LOCATION.longitude,
            radius: EVENT_LOCATION.radius
        });
        console.log("✅ SUCCESS: Event created via API.");
        claimLink = response.data.claimLink;
        claimUUID = claimLink.split('/').pop();
    } catch (error) {
        console.error("❌ ERROR: Failed to issue badge via API!");
        logApiError(error);
        return;
    }

    // === Step 2: Test with a VALID location (should succeed) ===
    console.log("\n--- Step 2: Testing claim from a VALID location ---");
    const message = `Claiming POAP for event link: ${claimUUID}`;
    const signature = await attendeeWallet.signMessage(message);

    try {
        const response = await axios.post(claimLink, {
            attendeeAddress: attendeeWallet.address,
            signature: signature,
            attendeeLatitude: ATTENDEE_LOCATION_VALID.latitude,
            attendeeLongitude: ATTENDEE_LOCATION_VALID.longitude
        });
        console.log("✅ SUCCESS: Badge claimed successfully from a valid location as expected!");
        console.log("Response Data:", response.data);
    } catch (error) {
        console.error("❌ UNEXPECTED ERROR: Claim from valid location failed!");
        logApiError(error);
    }
    
    // === Step 3: Test with an INVALID location (should be rejected) ===
    console.log("\n--- Step 3: Testing claim from an INVALID location ---");
    try {
        // We can reuse the same signature because the message is the same
        const response = await axios.post(claimLink, {
            attendeeAddress: attendeeWallet.address,
            signature: signature,
            attendeeLatitude: ATTENDEE_LOCATION_INVALID.latitude,
            attendeeLongitude: ATTENDEE_LOCATION_INVALID.longitude
        });
        // If the code reaches here, it means the server gave a 2xx response, which is wrong.
        console.error("❌ TEST FAILED: The server accepted a claim from an invalid location when it should have been rejected.");
        console.error("Response Data:", response.data);

    } catch (error) {
        // We EXPECT an error here. A 403 Forbidden is the correct response.
        if (error.response && error.response.status === 403) {
            console.log("✅ SUCCESS: The server correctly rejected the claim from an invalid location as expected!");
            console.log("Server Response:", error.response.data.error);
        } else {
            console.error("❌ UNEXPECTED ERROR: The claim from an invalid location failed, but not with the expected 403 error.");
            logApiError(error);
        }
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

runTests();