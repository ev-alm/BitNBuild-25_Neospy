// test_claim.js (MASTER SCRIPT - Full System Verification)

const { Wallet } = require('ethers');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

// --- Configuration ---
console.log("--- Initializing Master Test Script ---");
const BACKEND_URL = 'http://localhost:3001';
const DUMMY_IMAGE_PATH = './test_badge.jpg';

// --- Actors (Using provided account list) ---
const ORG_WALLET = new Wallet('0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a'); // Account #2
const USER_A_WALLET = new Wallet('0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6');  // Account #3
const USER_B_WALLET = new Wallet('0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a'); // Account #4

// --- Test Data ---
const EVENT_LOCATION = { latitude: 48.8584, longitude: 2.2945, radius: 200 };
const INVALID_LOCATION = { latitude: 50.0, longitude: 2.0 };
const ORG_DETAILS = { name: "Block Builders Inc.", admin_name: "Admin Alice", admin_email: `alice_${Date.now()}@block.build`, password: "strongpassword123" };
const USER_A_PROFILE = { displayName: "Bob the Attendee", email: `bob_${Date.now()}@email.com` };

function sleep(ms) {
    console.log(`      -> Waiting for ${ms / 1000} seconds for server to process queue...`);
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function runMasterTest() {
    console.log("--- Starting Test Execution ---");
    if (!fs.existsSync(DUMMY_IMAGE_PATH)) { return console.error(`\nFATAL: Dummy image not found at ${DUMMY_IMAGE_PATH}. Please create this file.`); }

    let orgToken = '', userAToken = '', userBToken = '';
    let eventLinks = {}; // To store links for different events

    // === PHASE 1: AUTHENTICATION & PROFILES ===
    console.log("\n--- PHASE 1: TESTING AUTHENTICATION & PROFILES ---");
    try {
        console.log("   - Registering Organization...");
        await axios.post(`${BACKEND_URL}/auth/organization/register`, ORG_DETAILS);
        const loginRes = await axios.post(`${BACKEND_URL}/auth/organization/login`, { admin_email: ORG_DETAILS.admin_email, password: ORG_DETAILS.password });
        orgToken = loginRes.data.token;
        console.log("   - Updating Organization Profile...");
        await axios.put(`${BACKEND_URL}/organizer/profile`, { country: "France", city: "Paris" }, { headers: { 'Authorization': `Bearer ${orgToken}` } });
        console.log("   - Authenticating User A...");
        userAToken = await authenticateUser(USER_A_WALLET);
        console.log("   - Authenticating User B...");
        userBToken = await authenticateUser(USER_B_WALLET);
        console.log("   - Updating User A Profile...");
        await axios.put(`${BACKEND_URL}/user/profile`, USER_A_PROFILE, { headers: { 'Authorization': `Bearer ${userAToken}` } });
        console.log("✅ SUCCESS: Phase 1 Complete.");
    } catch (error) { return logApiError("Phase 1: Auth & Profiles", error); }

    // === PHASE 2: EVENT CREATION ===
    console.log("\n--- PHASE 2: TESTING EVENT CREATION (ALL TYPES) ---");
    try {
        console.log("   - Creating Offline NFT Event (Live Workshop)...");
        eventLinks.liveWorkshop = await createEvent(orgToken, { eventName: 'Live NFT Workshop', isOnline: 'false', issuesBadge: 'true' });
        console.log("   - Creating Online Credential Event (Webinar)...");
        eventLinks.webinar = await createEvent(orgToken, { eventName: 'Online Webinar', isOnline: 'true', issuesBadge: 'false' });
        console.log("   - Creating Event to be Cancelled...");
        eventLinks.toCancel = await createEvent(orgToken, { eventName: 'Future Canceled Meetup', isOnline: 'true', issuesBadge: 'false' });
        console.log("   - Creating Expired Event...");
        eventLinks.expired = await createEvent(orgToken, { eventName: 'Expired Event', isOnline: 'true', issuesBadge: 'false', isExpired: true });
        console.log("✅ SUCCESS: Phase 2 Complete.");
    } catch (error) { return logApiError("Phase 2: Event Creation", error); }

    // === PHASE 3: EVENT MANAGEMENT ===
    console.log("\n--- PHASE 3: TESTING EVENT MANAGEMENT ---");
    try {
        console.log("   - Cancelling the 'Future Canceled Meetup' event...");
        const dashboardRes = await axios.get(`${BACKEND_URL}/organizer/dashboard`, { headers: { 'Authorization': `Bearer ${orgToken}` } });
        const eventToCancel = dashboardRes.data.events.find(e => e.eventName === 'Future Canceled Meetup');
        await axios.put(`${BACKEND_URL}/organizer/event/${eventToCancel.id}/cancel`, {}, { headers: { 'Authorization': `Bearer ${orgToken}` } });
        console.log("✅ SUCCESS: Phase 3 Complete.");
    } catch (error) { return logApiError("Phase 3: Event Management", error); }

    // === PHASE 4: CLAIMING LOGIC (SUCCESS & FAILURE CASES) ===
    console.log("\n--- PHASE 4: TESTING CLAIMING LOGIC ---");
    try {
        console.log("   - SUCCESS CASE: User A claiming valid NFT badge...");
        await claimCredential(userAToken, eventLinks.liveWorkshop, EVENT_LOCATION.latitude, EVENT_LOCATION.longitude);
        console.log("   - SUCCESS CASE: User B claiming valid NFT badge (for rare badge test)...");
        await claimCredential(userBToken, eventLinks.liveWorkshop, EVENT_LOCATION.latitude, EVENT_LOCATION.longitude);
        console.log("   - SUCCESS CASE: User A claiming valid credential...");
        await claimCredential(userAToken, eventLinks.webinar);
        console.log("   - FAILURE CASE: User A trying to claim same badge again...");
        await expectFailure(() => claimCredential(userAToken, eventLinks.liveWorkshop, EVENT_LOCATION.latitude, EVENT_LOCATION.longitude), 409);
        console.log("   - FAILURE CASE: User A trying to claim from wrong location...");
        await expectFailure(() => claimCredential(userAToken, eventLinks.liveWorkshop, INVALID_LOCATION.latitude, INVALID_LOCATION.longitude), 403);
        console.log("   - FAILURE CASE: User A trying to claim cancelled event...");
        await expectFailure(() => claimCredential(userAToken, eventLinks.toCancel), 403);
        console.log("   - FAILURE CASE: User A trying to claim expired event...");
        await expectFailure(() => claimCredential(userAToken, eventLinks.expired), 403);
        console.log("✅ SUCCESS: Phase 4 Complete.");
    } catch (error) { return logApiError("Phase 4: Claiming Logic", error); }


    // === NEW SECTION: WAIT FOR SERVER PROCESSING ===
    await sleep(5000); // Wait for 5 seconds. Adjust if your local blockchain is slower.


    // === PHASE 5: FINAL VERIFICATION ===
    console.log("\n--- PHASE 5: FINAL VERIFICATION OF ALL ENDPOINTS ---");
    try {
        console.log("   - Verifying Organizer Dashboard...");
        const orgDash = (await axios.get(`${BACKEND_URL}/organizer/dashboard`, { headers: { 'Authorization': `Bearer ${orgToken}` } })).data;
        assert(orgDash.stats.totalEvents === 4, `Org Dash: Expected 4 events, got ${orgDash.stats.totalEvents}`);
        assert(orgDash.stats.badgesDistributed === 2, `Org Dash: Expected 2 badges, got ${orgDash.stats.badgesDistributed}`);
        console.log("   - Verifying User A Dashboard...");
        const userADash = (await axios.get(`${BACKEND_URL}/user/dashboard`, { headers: { 'Authorization': `Bearer ${userAToken}` } })).data;
        assert(userADash.stats.totalBadges === 1, `User A Dash: Expected 1 badge, got ${userADash.stats.totalBadges}`);
        assert(userADash.stats.totalEventsAttended === 2, `User A Dash: Expected 2 events, got ${userADash.stats.totalEventsAttended}`);
        assert(userADash.stats.rareBadges === 1, `User A Dash: Expected 1 rare badge, got ${userADash.stats.rareBadges}`);
        console.log("   - Verifying Event Discovery...");
        const discovery = (await axios.get(`${BACKEND_URL}/events/discover`)).data;
        assert(discovery.nearby.length > 0 || discovery.online.length > 0, "Discovery: No upcoming events found");
        console.log("   - Verifying Public Credential Link...");
        const credUUID = eventLinks.webinar.split('/').pop();
        const verification = (await axios.get(`${BACKEND_URL}/verify/${credUUID}`)).data;
        assert(verification.issuedTo === USER_A_PROFILE.displayName, `Verification: Name mismatch. Expected ${USER_A_PROFILE.displayName}, got ${verification.issuedTo}`);
        console.log("   - Verifying Detailed Badge View...");
        const badgeDetails = (await axios.get(`${BACKEND_URL}/user/badge/1`, { headers: { 'Authorization': `Bearer ${userAToken}` } })).data;
        assert(badgeDetails.token_id === 1, `Badge Detail: Token ID mismatch. Expected 1, got ${badgeDetails.token_id}`);
        console.log("✅ SUCCESS: Phase 5 Complete.");
    } catch (error) { return logApiError("Phase 5: Final Verification", error); }

    console.log("\n\n🎉🎉🎉 MASTER TEST COMPLETE: ALL SYSTEMS OPERATIONAL! 🎉🎉🎉");
}

// --- Helper Functions ---
async function authenticateUser(wallet) {
    const challengeRes = await axios.post(`${BACKEND_URL}/auth/user/challenge`, { walletAddress: wallet.address });
    const signature = await wallet.signMessage(challengeRes.data.message);
    const verifyRes = await axios.post(`${BACKEND_URL}/auth/user/verify`, { walletAddress: wallet.address, message: challengeRes.data.message, signature: signature });
    return verifyRes.data.token;
}

async function createEvent(token, { eventName, isOnline, issuesBadge, isExpired = false }) {
    const form = new FormData();
    form.append('eventName', eventName);
    form.append('organizerAddress', ORG_WALLET.address);
    form.append('isOnline', isOnline);
    form.append('issuesBadge', issuesBadge);

    if (issuesBadge === 'true') form.append('badgeImage', fs.createReadStream(DUMMY_IMAGE_PATH));
    if (isOnline === 'false') {
        form.append('latitude', EVENT_LOCATION.latitude);
        form.append('longitude', EVENT_LOCATION.longitude);
        form.append('radius', EVENT_LOCATION.radius);
    }
    if (isExpired) {
        const past = new Date(Date.now() - 2 * 60 * 60 * 1000); // 2 hours ago
        const pastEvenMore = new Date(Date.now() - 3 * 60 * 60 * 1000); // 3 hours ago
        form.append('eventStart', pastEvenMore.toISOString());
        form.append('eventEnd', past.toISOString());
        form.append('claimExpiryMinutes', '30');
    } else {
    // Create an event that is currently active.
    // This method ensures two completely independent date objects.
    const eventStart = new Date();
    eventStart.setHours(eventStart.getHours() - 1); // Set start time to 1 hour in the past.

    const eventEnd = new Date();
    eventEnd.setHours(eventEnd.getHours() + 2); // Set end time to 2 hours in the future.

    form.append('eventStart', eventStart.toISOString());
    form.append('eventEnd', eventEnd.toISOString());
    form.append('claimExpiryMinutes', '180'); // Give a 3-hour claim window after the event ends.
}
    const res = await axios.post(`${BACKEND_URL}/organizer/issue-badge`, form, { headers: { ...form.getHeaders(), 'Authorization': `Bearer ${token}` } });
    return res.data.claimLink;
}

async function claimCredential(token, link, lat, lon) {
    const body = {};
    if (lat && lon) {
        body.attendeeLatitude = lat;
        body.attendeeLongitude = lon;
    }
    return await axios.post(link, body, { headers: { 'Authorization': `Bearer ${token}` } });
}

async function expectFailure(asyncFunc, expectedStatus) {
    try {
        await asyncFunc();
        // If we get here, it's a failure because no error was thrown
        throw new Error(`Test failed: Expected an error with status ${expectedStatus} but got success.`);
    } catch (error) {
        if (error.response && error.response.status === expectedStatus) {
            console.log(`      -> ✅ Correctly failed with status ${expectedStatus} as expected.`);
        } else {
            // Re-throw if it's an unexpected error
            throw error;
        }
    }
}

function assert(condition, message) {
    if (!condition) {
        throw new Error(`Assertion failed: ${message}`);
    }
}

function logApiError(step, error) {
    console.error(`\n❌ FATAL FAILURE at Step: ${step}`);
    if (error.response) {
        console.error("   - Status:", error.response.status);
        console.error("   - Data:", error.response.data);
    } else {
        console.error("   - Error:", error.message);
    }
}

runMasterTest();