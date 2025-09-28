// test_claim.js (FINAL - Full Auth Flow)

const { Wallet } = require('ethers');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

// --- Configuration ---
const BACKEND_URL = 'http://localhost:3001';
const DUMMY_IMAGE_PATH = './test_badge.jpg';

// Wallets and Location data remain the same
const ORGANIZER_WALLET = new Wallet('0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a'); // Account #2
const ATTENDEE_WALLET = new Wallet('0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6');  // Account #3
const EVENT_LOCATION = { latitude: 48.8584, longitude: 2.2945, radius: 200 };

// --- Test Data ---
const ORG_DETAILS = {
    name: "Test Org Inc.",
    admin_name: "Test Admin",
    admin_email: `admin_${Date.now()}@test.com`, // Unique email for each run
    password: "password123"
};

const USER_PROFILE_UPDATE = {
    displayName: "Test Attendee",
    email: `attendee_${Date.now()}@test.com`
};

async function runFullTest() {
    console.log("--- Starting FINAL End-to-End Test for Full Auth Flow ---");

    if (!fs.existsSync(DUMMY_IMAGE_PATH)) {
        console.error(`ERROR: Dummy image not found at ${DUMMY_IMAGE_PATH}.`);
        return;
    }

    let orgToken = '';
    let userToken = '';
    let claimLink = '';

    // === Step 1: Organization Registration ===
    console.log("\n--- 1. Registering Organization ---");
    try {
        await axios.post(`${BACKEND_URL}/auth/organization/register`, ORG_DETAILS);
        console.log("✅ SUCCESS: Organization registered.");
    } catch (error) {
        return logApiError("Organization Registration Failed", error);
    }

    // === Step 2: Organization Login ===
    console.log("\n--- 2. Logging in as Organization ---");
    try {
        const response = await axios.post(`${BACKEND_URL}/auth/organization/login`, {
            admin_email: ORG_DETAILS.admin_email,
            password: ORG_DETAILS.password
        });
        orgToken = response.data.token;
        console.log("✅ SUCCESS: Organization logged in.");
    } catch (error) {
        return logApiError("Organization Login Failed", error);
    }

    // === Step 3: Issue Badge (Authenticated) ===
    console.log("\n--- 3. Issuing a Badge (Authenticated) ---");
    try {
        const form = new FormData();
        form.append('organizerAddress', ORGANIZER_WALLET.address);
        form.append('eventName', 'Authenticated Event');
        form.append('eventDescription', 'This was issued by a logged-in org.');
        form.append('latitude', EVENT_LOCATION.latitude);
        form.append('longitude', EVENT_LOCATION.longitude);
        form.append('radius', EVENT_LOCATION.radius);
        form.append('badgeImage', fs.createReadStream(DUMMY_IMAGE_PATH));
        
        const response = await axios.post(`${BACKEND_URL}/organizer/issue-badge`, form, {
            headers: {
                ...form.getHeaders(),
                'Authorization': `Bearer ${orgToken}` // The crucial auth header
            }
        });
        claimLink = response.data.claimLink;
        console.log("✅ SUCCESS: Badge issued via protected route.");
    } catch (error) {
        return logApiError("Issuing Badge Failed", error);
    }

    // === Step 4: User Authentication (SIWE Flow) ===
    console.log("\n--- 4. Authenticating User (Sign-in with Ethereum) ---");
    try {
        // 4a. Get challenge
        const challengeResponse = await axios.post(`${BACKEND_URL}/auth/user/challenge`, { walletAddress: ATTENDEE_WALLET.address });
        const message = challengeResponse.data.message;
        console.log("   - Got challenge from server.");
        
        // 4b. Sign challenge
        const signature = await ATTENDEE_WALLET.signMessage(message);
        console.log("   - Signed challenge with wallet.");
        
        // 4c. Verify signature and get token
        const verifyResponse = await axios.post(`${BACKEND_URL}/auth/user/verify`, {
            walletAddress: ATTENDEE_WALLET.address,
            message: message,
            signature: signature
        });
        userToken = verifyResponse.data.token;
        console.log("✅ SUCCESS: User authenticated and received JWT.");
    } catch (error) {
        return logApiError("User Authentication Failed", error);
    }

    // === Step 5: Update User Profile (Authenticated) ===
    console.log("\n--- 5. Updating User Profile (Authenticated) ---");
    try {
        await axios.put(`${BACKEND_URL}/user/profile`, USER_PROFILE_UPDATE, {
            headers: { 'Authorization': `Bearer ${userToken}` }
        });
        console.log("✅ SUCCESS: User profile updated via protected route.");
    } catch (error) {
        return logApiError("User Profile Update Failed", error);
    }
    
    // === Step 6: Claim Badge ===
    console.log("\n--- 6. Claiming the Badge ---");
    try {
        const claimUUID = claimLink.split('/').pop();
        const claimMessage = `Claiming POAP for event link: ${claimUUID}`;
        const claimSignature = await ATTENDEE_WALLET.signMessage(claimMessage);
        await axios.post(claimLink, {
            attendeeAddress: ATTENDEE_WALLET.address,
            signature: claimSignature,
            attendeeLatitude: EVENT_LOCATION.latitude,
            attendeeLongitude: EVENT_LOCATION.longitude
        });
        console.log("✅ SUCCESS: Badge claimed.");
    } catch (error) {
        return logApiError("Badge Claim Failed", error);
    }

    // === Step 7: Verify Collection ===
    console.log("\n--- 7. Verifying Badge in Collection ---");
    try {
        const response = await axios.get(`${BACKEND_URL}/collection/${ATTENDEE_WALLET.address}`);
        if (response.data && response.data.length > 0) {
            console.log("✅ SUCCESS: Found badge in user's collection.");
        } else {
            throw new Error("Badge not found in collection.");
        }
    } catch (error) {
        return logApiError("Collection Verification Failed", error);
    }

    console.log("\n🎉🎉🎉 ALL TESTS PASSED! 🎉🎉🎉");
}

function logApiError(step, error) {
    console.error(`❌ FAILURE at Step: ${step}`);
    if (error.response) {
        console.error("   - Status:", error.response.status);
        console.error("   - Data:", error.response.data);
    } else {
        console.error("   - Error:", error.message);
    }
}

runFullTest();