// test_claim.js (FINAL v2 - Multi-Scenario Test)

const { Wallet } = require('ethers');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

// --- Configuration ---
const BACKEND_URL = 'http://localhost:3001';
const DUMMY_IMAGE_PATH = './test_badge.jpg';

// Wallets and Location data
const ORGANIZER_WALLET = new Wallet('0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a'); // Account #2
const ATTENDEE_WALLET = new Wallet('0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6');  // Account #3
const EVENT_LOCATION = { latitude: 48.8584, longitude: 2.2945, radius: 200 };

// Test Data
const ORG_DETAILS = { name: "Test Org Inc.", admin_name: "Test Admin", admin_email: `admin_${Date.now()}@test.com`, password: "password123" };
const USER_PROFILE_UPDATE = { displayName: "Test Attendee", email: `attendee_${Date.now()}@test.com` };

async function runFullTest() {
    console.log("--- Starting FINAL End-to-End Test for Full Platform ---");

    if (!fs.existsSync(DUMMY_IMAGE_PATH)) {
        console.error(`ERROR: Dummy image not found at ${DUMMY_IMAGE_PATH}.`);
        return;
    }

    let orgToken = '', userToken = '';
    let badgeClaimLink = '', credClaimLink = '';

    // === Steps 1 & 2: Organization Auth ===
    console.log("\n--- 1 & 2. Registering and Logging in Organization ---");
    try {
        await axios.post(`${BACKEND_URL}/auth/organization/register`, ORG_DETAILS);
        const loginResponse = await axios.post(`${BACKEND_URL}/auth/organization/login`, { admin_email: ORG_DETAILS.admin_email, password: ORG_DETAILS.password });
        orgToken = loginResponse.data.token;
        console.log("✅ SUCCESS: Organization authenticated.");
    } catch (error) { return logApiError("Organization Auth", error); }

    // === Steps 3 & 4: User Auth and Profile Update ===
    console.log("\n--- 3 & 4. Authenticating User and Updating Profile ---");
    try {
        const challengeResponse = await axios.post(`${BACKEND_URL}/auth/user/challenge`, { walletAddress: ATTENDEE_WALLET.address });
        const signature = await ATTENDEE_WALLET.signMessage(challengeResponse.data.message);
        const verifyResponse = await axios.post(`${BACKEND_URL}/auth/user/verify`, { walletAddress: ATTENDEE_WALLET.address, message: challengeResponse.data.message, signature: signature });
        userToken = verifyResponse.data.token;
        await axios.put(`${BACKEND_URL}/user/profile`, USER_PROFILE_UPDATE, { headers: { 'Authorization': `Bearer ${userToken}` } });
        console.log("✅ SUCCESS: User authenticated and profile updated.");
    } catch (error) { return logApiError("User Auth/Profile", error); }

    // === SCENARIO A: OFFLINE EVENT WITH NFT BADGE ===
    console.log("\n--- SCENARIO A: Testing Offline Event with NFT Badge ---");

    // Step 5: Issue Offline Badge
    console.log("--- 5. Issuing Offline Badge ---");
    try {
        const form = new FormData();
        form.append('eventName', 'Offline Workshop');
        form.append('organizerAddress', ORGANIZER_WALLET.address);
        form.append('isOnline', 'false'); // New Toggle
        form.append('issuesBadge', 'true'); // New Toggle
        form.append('latitude', EVENT_LOCATION.latitude);
        form.append('longitude', EVENT_LOCATION.longitude);
        form.append('radius', EVENT_LOCATION.radius);
        form.append('badgeImage', fs.createReadStream(DUMMY_IMAGE_PATH));
        
        const response = await axios.post(`${BACKEND_URL}/organizer/issue-badge`, form, { headers: { ...form.getHeaders(), 'Authorization': `Bearer ${orgToken}` } });
        badgeClaimLink = response.data.claimLink;
        console.log("✅ SUCCESS: Offline Badge event created.");
    } catch (error) { return logApiError("Issue Offline Badge", error); }

    // Step 6: Claim Offline Badge
    console.log("--- 6. Claiming Offline Badge ---");
    try {
        await axios.post(badgeClaimLink, { attendeeLatitude: EVENT_LOCATION.latitude, attendeeLongitude: EVENT_LOCATION.longitude }, { headers: { 'Authorization': `Bearer ${userToken}` } });
        console.log("✅ SUCCESS: Offline Badge claimed.");
    } catch (error) { return logApiError("Claim Offline Badge", error); }


    // === SCENARIO B: ONLINE EVENT WITH CREDENTIAL ===
    console.log("\n--- SCENARIO B: Testing Online Event with Credential ---");

    // Step 7: Issue Online Credential
    console.log("--- 7. Issuing Online Credential ---");
    try {
        const form = new FormData();
        form.append('eventName', 'Online Webinar');
        form.append('organizerAddress', ORGANIZER_WALLET.address);
        form.append('isOnline', 'true'); // New Toggle
        form.append('issuesBadge', 'false'); // New Toggle
        // No image or location data needed
        
        const response = await axios.post(`${BACKEND_URL}/organizer/issue-badge`, form, { headers: { ...form.getHeaders(), 'Authorization': `Bearer ${orgToken}` } });
        credClaimLink = response.data.claimLink;
        console.log("✅ SUCCESS: Online Credential event created.");
    } catch (error) { return logApiError("Issue Online Credential", error); }

    // Step 8: Claim Online Credential
    console.log("--- 8. Claiming Online Credential ---");
    try {
        // No location data needed for claim
        await axios.post(credClaimLink, {}, { headers: { 'Authorization': `Bearer ${userToken}` } });
        console.log("✅ SUCCESS: Online Credential claimed.");
    } catch (error) { return logApiError("Claim Online Credential", error); }


    // === FINAL VERIFICATION CHECKS ===
    console.log("\n--- Final Verification Checks ---");
    
    // Step 9: Verify Organizer Dashboard
    try {
        const response = await axios.get(`${BACKEND_URL}/organizer/dashboard`, { headers: { 'Authorization': `Bearer ${orgToken}` } });
        const stats = response.data.stats;
        console.log("--- 9. Verifying Organizer Dashboard ---");
        if (stats.totalEvents === 2 && stats.badgesDistributed === 1) {
            console.log("✅ SUCCESS: Organizer stats are correct.", stats);
        } else { throw new Error(`Organizer stats mismatch! Got: ${JSON.stringify(stats)}`); }
    } catch (error) { return logApiError("Organizer Dashboard Verification", error); }
    
    // Step 10: Verify Attendee Dashboard
    try {
        const response = await axios.get(`${BACKEND_URL}/user/dashboard`, { headers: { 'Authorization': `Bearer ${userToken}` } });
        const stats = response.data.stats;
        console.log("--- 10. Verifying Attendee Dashboard ---");
        if (stats.totalBadges === 1 && stats.totalEventsAttended === 2) {
            console.log("✅ SUCCESS: Attendee stats are correct.", stats);
        } else { throw new Error(`Attendee stats mismatch! Got: ${JSON.stringify(stats)}`); }
    } catch (error) { return logApiError("Attendee Dashboard Verification", error); }

    console.log("\n🎉🎉🎉 ALL SCENARIOS AND TESTS PASSED! 🎉🎉🎉");
}

function logApiError(step, error) { /* ... same as before ... */ }
runFullTest();