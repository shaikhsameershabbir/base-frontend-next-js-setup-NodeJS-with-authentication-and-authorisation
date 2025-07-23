import axios from 'axios';

const API_BASE_URL = 'http://localhost:5555';

async function testMarketsAPI() {
    try {
        console.log('🧪 Testing Markets API...\n');

        // Test 1: Login as a player
        console.log('1. Logging in as a player...');
        const loginResponse = await axios.post(`${API_BASE_URL}/api/auth/`, {
            username: 'player1',
            password: 'password123',
            login: 'web'
        });

        if (!loginResponse.data.success) {
            throw new Error('Login failed: ' + loginResponse.data.message);
        }

        const token = loginResponse.data.data.token;
        console.log('✅ Login successful');
        console.log('User:', loginResponse.data.data.user.username);
        console.log('Role:', loginResponse.data.data.user.role);
        console.log('Balance:', loginResponse.data.data.user.balance);
        console.log('');

        // Test 2: Get assigned markets
        console.log('2. Getting assigned markets...');
        const marketsResponse = await axios.get(`${API_BASE_URL}/api/player/assigned-markets`, {
            headers: {
                'Authorization': `Bearer ${token}`
            },
            withCredentials: true
        });

        if (!marketsResponse.data.success) {
            throw new Error('Failed to get markets: ' + marketsResponse.data.message);
        }

        const markets = marketsResponse.data.data.assignments;
        console.log('✅ Markets retrieved successfully');
        console.log(`📊 Found ${markets.length} assigned markets:`);

        if (markets.length === 0) {
            console.log('   No markets assigned to this player.');
            console.log('   This is normal if no markets have been assigned yet.');
        } else {
            markets.forEach((assignment: any, index: number) => {
                const market = assignment.marketId;
                console.log(`   ${index + 1}. ${market.marketName}`);
                console.log(`      Open: ${new Date(market.openTime).toLocaleTimeString()}`);
                console.log(`      Close: ${new Date(market.closeTime).toLocaleTimeString()}`);
                console.log(`      Active: ${market.isActive}`);
                console.log('');
            });
        }

        // Test 3: Test market status calculation
        console.log('3. Testing market status calculation...');
        const now = new Date();
        if (markets.length > 0) {
            markets.forEach((assignment: any) => {
                const market = assignment.marketId;
                const openTime = new Date(market.openTime);
                const closeTime = new Date(market.closeTime);

                let status = 'Unknown';
                if (!market.isActive) {
                    status = 'Market closed';
                } else if (now < openTime) {
                    status = 'Coming soon';
                } else if (now >= openTime && now <= closeTime) {
                    status = 'Market is open';
                } else {
                    status = 'Market close for today';
                }

                console.log(`   ${market.marketName}: ${status}`);
            });
        } else {
            console.log('   No markets to calculate status for.');
        }

        console.log('\n🎉 All tests passed!');

    } catch (error: any) {
        console.error('❌ Test failed:', error.response?.data || error.message);

        if (error.response?.status === 401) {
            console.log('\n💡 Tip: Make sure you have a player user created in the database.');
            console.log('   You can create one using the seed script or manually.');
        }
    }
}

// Run the test
testMarketsAPI(); 