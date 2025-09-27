const axios = require('axios');

const API_BASE = 'http://localhost:3001';

async function testAuthAPI() {
    console.log('🧪 Testing Authentication API...\n');

    // Test Data
    const testUser = {
        email: 'testuser@example.com',
        password: 'password123',
        role: 'user',
        displayName: 'Test User',
        username: 'testuser'
    };

    const testOrganizer = {
        email: 'testorg@example.com',
        password: 'password123',
        role: 'organizer',
        companyName: 'Test Events Inc',
        website: 'https://testevents.com',
        description: 'We host amazing events!'
    };

    try {
        // Test 1: Register User
        console.log('1. Testing User Registration...');
        const userRegResponse = await axios.post(`${API_BASE}/auth/register`, testUser);
        console.log('✅ User Registration:', userRegResponse.data.message);
        console.log('   User ID:', userRegResponse.data.user.id);
        console.log('   Token:', userRegResponse.data.token.substring(0, 50) + '...\n');

        // Test 2: Register Organizer
        console.log('2. Testing Organizer Registration...');
        const orgRegResponse = await axios.post(`${API_BASE}/auth/register`, testOrganizer);
        console.log('✅ Organizer Registration:', orgRegResponse.data.message);
        console.log('   Organizer ID:', orgRegResponse.data.user.id);
        console.log('   Token:', orgRegResponse.data.token.substring(0, 50) + '...\n');

        // Test 3: User Login
        console.log('3. Testing User Login...');
        const userLoginResponse = await axios.post(`${API_BASE}/auth/login`, {
            email: testUser.email,
            password: testUser.password,
            role: testUser.role
        });
        console.log('✅ User Login:', userLoginResponse.data.message);
        console.log('   User:', userLoginResponse.data.user.displayName);
        console.log('   Token:', userLoginResponse.data.token.substring(0, 50) + '...\n');

        // Test 4: Organizer Login
        console.log('4. Testing Organizer Login...');
        const orgLoginResponse = await axios.post(`${API_BASE}/auth/login`, {
            email: testOrganizer.email,
            password: testOrganizer.password,
            role: testOrganizer.role
        });
        console.log('✅ Organizer Login:', orgLoginResponse.data.message);
        console.log('   Organizer:', orgLoginResponse.data.user.companyName);
        console.log('   Token:', orgLoginResponse.data.token.substring(0, 50) + '...\n');

        // Test 5: Protected Route
        console.log('5. Testing Protected Route...');
        const meResponse = await axios.get(`${API_BASE}/auth/me`, {
            headers: {
                'Authorization': `Bearer ${userLoginResponse.data.token}`
            }
        });
        console.log('✅ Protected Route Accessible');
        console.log('   Current User:', meResponse.data.user.email, '\n');

        // Test 6: Invalid Login
        console.log('6. Testing Invalid Login...');
        try {
            await axios.post(`${API_BASE}/auth/login`, {
                email: testUser.email,
                password: 'wrongpassword',
                role: testUser.role
            });
        } catch (error) {
            console.log('✅ Invalid Password Handling:', error.response.data.error);
        }

        console.log('\n🎉 All tests passed! The authentication API is working correctly.');

    } catch (error) {
        if (error.response) {
            console.error('❌ API Error:', error.response.data);
        } else {
            console.error('❌ Network Error:', error.message);
        }
    }
}

// Run tests if this file is executed directly
if (require.main === module) {
    testAuthAPI();
}

module.exports = testAuthAPI;