// test_claim.js (v3 - Location Aware)

const { Wallet } = require('ethers');
const axios = require('axios');
const FormData = require('form-data'); // Import FormData
const fs = require('fs'); // Import File System module

// --- Configuration ---
const BACKEND_URL = 'http://localhost:3001';
const DUMMY_IMAGE_PATH = './test_badge.jpg';

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
    console.log("--- Starting FINAL IPFS-Integrated Test ---");

    if (!fs.existsSync(DUMMY_IMAGE_PATH)) {
        console.error(`\nERROR: Dummy image not found at ${DUMMY_IMAGE_PATH}. Please create this file.\n`);
        return;
    }

    let claimLink = '';

    // === Step 1: Organizer creates an event using form-data ===
    console.log("\n--- Step 1: Organizer issuing badge via form-data ---");
    try {
        const form = new FormData();
        // Append all the text fields
        form.append('organizerAddress', organizerWallet.address);
        form.append('eventName', 'My Real IPFS Event');
        form.append('eventDescription', 'This badge was created with a real IPFS upload!');
        form.append('latitude', EVENT_LOCATION.latitude);
        form.append('longitude', EVENT_LOCATION.longitude);
        form.append('radius', EVENT_LOCATION.radius);
        
        // Append the image file
        form.append('badgeImage', fs.createReadStream(DUMMY_IMAGE_PATH));

        const response = await axios.post(`${BACKEND_URL}/organizer/issue-badge`, form, {
            headers: {
                ...form.getHeaders() // This is crucial for multipart/form-data
            }
        });
        
        console.log("✅ SUCCESS: Event created and assets uploaded to IPFS.");
        console.log("Response Data:", response.data);
        claimLink = response.data.claimLink;

    } catch (error) {
        console.error("❌ ERROR: Failed to issue badge via API!");
        logApiError(error);
        return;
    }

    // === Step 2: Attendee claims the badge (this part of the test is the same) ===
    console.log("\n--- Step 2: Testing claim from a VALID location ---");
    const claimUUID = claimLink.split('/').pop();
    const message = `Claiming POAP for event link: ${claimUUID}`;
    const signature = await attendeeWallet.signMessage(message);

    try {
        const response = await axios.post(claimLink, {
            attendeeAddress: attendeeWallet.address,
            signature: signature,
            attendeeLatitude: EVENT_LOCATION.latitude, // Using event center for simplicity
            attendeeLongitude: EVENT_LOCATION.longitude
        });
        console.log("✅ SUCCESS: Badge claimed successfully!");
    } catch (error) {
        console.error("❌ UNEXPECTED ERROR: Claim from valid location failed!");
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

runTests();