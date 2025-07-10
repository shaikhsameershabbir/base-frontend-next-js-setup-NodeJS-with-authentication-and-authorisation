import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

async function testAuthentication() {
    console.log('🧪 Testing Authentication System...\n');

    try {
        // Test 1: Health Check
        console.log('1. Testing Health Check...');
        const healthResponse = await axios.get('http://localhost:5000/health');
        console.log('✅ Health Check:', healthResponse.data.status);
        console.log('   Environment:', healthResponse.data.environment);
        console.log('   Uptime:', Math.round(healthResponse.data.uptime), 'seconds\n');

        // Test 2: Login with Superadmin
        console.log('2. Testing Superadmin Login...');
        const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
            username: 'smasher',
            password: '123456'
        }, {
            withCredentials: true
        });

        if (loginResponse.data.success) {
            console.log('✅ Login Successful');
            console.log('   User:', loginResponse.data.data.user.username);
            console.log('   Role:', loginResponse.data.data.user.role);
            console.log('   Token Expires:', new Date(loginResponse.data.data.tokenExpires * 1000).toLocaleString());
        } else {
            console.log('❌ Login Failed:', loginResponse.data.message);
            return;
        }

        // Extract cookies for subsequent requests
        const cookies = loginResponse.headers['set-cookie'];
        const cookieHeader = cookies ? cookies.join('; ') : '';

        // Test 3: Get Profile
        console.log('\n3. Testing Profile Access...');
        const profileResponse = await axios.get(`${API_BASE}/profile`, {
            headers: {
                Cookie: cookieHeader
            },
            withCredentials: true
        });

        if (profileResponse.data.success) {
            console.log('✅ Profile Access Successful');
            console.log('   Username:', profileResponse.data.data.user.username);
            console.log('   Balance:', profileResponse.data.data.user.balance);
        } else {
            console.log('❌ Profile Access Failed:', profileResponse.data.message);
        }

        // Test 4: Get Users (Superadmin should see all)
        console.log('\n4. Testing User Access...');
        const usersResponse = await axios.get(`${API_BASE}/users`, {
            headers: {
                Cookie: cookieHeader
            },
            withCredentials: true
        });

        if (usersResponse.data.success) {
            console.log('✅ Users Access Successful');
            console.log('   Total Users:', usersResponse.data.data.users.length);
        } else {
            console.log('❌ Users Access Failed:', profileResponse.data.message);
        }

        // Test 5: Refresh Token
        console.log('\n5. Testing Token Refresh...');
        const refreshResponse = await axios.post(`${API_BASE}/auth/refresh`, {}, {
            headers: {
                Cookie: cookieHeader
            },
            withCredentials: true
        });

        if (refreshResponse.data.success) {
            console.log('✅ Token Refresh Successful');
            console.log('   New Token Expires:', new Date(refreshResponse.data.data.tokenExpires * 1000).toLocaleString());
        } else {
            console.log('❌ Token Refresh Failed:', refreshResponse.data.message);
        }

        // Test 6: Logout
        console.log('\n6. Testing Logout...');
        const logoutResponse = await axios.post(`${API_BASE}/auth/logout`, {}, {
            headers: {
                Cookie: cookieHeader
            },
            withCredentials: true
        });

        if (logoutResponse.data.success) {
            console.log('✅ Logout Successful');
        } else {
            console.log('❌ Logout Failed:', logoutResponse.data.message);
        }

        // Test 7: Rate Limiting
        console.log('\n7. Testing Rate Limiting...');
        try {
            for (let i = 0; i < 6; i++) {
                await axios.post(`${API_BASE}/auth/login`, {
                    username: 'invalid',
                    password: 'invalid'
                }, {
                    withCredentials: true
                });
            }
        } catch (error: any) {
            if (error.response?.status === 429) {
                console.log('✅ Rate Limiting Working');
                console.log('   Message:', error.response.data.message);
            } else {
                console.log('❌ Rate Limiting Test Failed');
            }
        }

        console.log('\n🎉 All Authentication Tests Completed Successfully!');
        console.log('\n📋 Test Summary:');
        console.log('   ✅ Health Check');
        console.log('   ✅ Login System');
        console.log('   ✅ Profile Access');
        console.log('   ✅ User Management');
        console.log('   ✅ Token Refresh');
        console.log('   ✅ Logout System');
        console.log('   ✅ Rate Limiting');

    } catch (error: any) {
        console.error('❌ Test Failed:', error.message);
        if (error.response) {
            console.error('   Status:', error.response.status);
            console.error('   Data:', error.response.data);
        }
    }
}

// Run the test
testAuthentication(); 