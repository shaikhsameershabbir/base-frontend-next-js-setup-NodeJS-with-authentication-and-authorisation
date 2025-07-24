import axios from 'axios';

async function testPlayerAPI() {
    try {
        // First, login as a player to get a token
        const loginResponse = await axios.post('http://localhost:3001/api/v1/auth/login', {
            username: 'player',
            password: 'password123',
            loginSource: 'web'
        });

        if (loginResponse.data.success) {
            const token = loginResponse.data.data.accessToken;
            console.log('✅ Login successful');
            console.log('🔑 Token:', token);
            console.log('📊 Login response:', JSON.stringify(loginResponse.data, null, 2));

            // Test the assigned markets endpoint
            const marketsResponse = await axios.get('http://localhost:3001/api/v1/player/assigned-markets', {
                headers: {
                    'Cookie': `authToken=${token}`
                }
            });

            if (marketsResponse.data.success) {
                console.log('✅ Markets API call successful');
                console.log('📊 Response data:', JSON.stringify(marketsResponse.data.data, null, 2));

                const { assignments } = marketsResponse.data.data;
                console.log(`📈 Found ${assignments.length} market assignments`);

                // Check ranks
                const marketsWithRanks = assignments.filter((m: any) => m.rank !== null);
                const marketsWithoutRanks = assignments.filter((m: any) => m.rank === null);

                console.log(`🏆 Markets with ranks: ${marketsWithRanks.length}`);
                console.log(`❌ Markets without ranks: ${marketsWithoutRanks.length}`);

                // Show markets with ranks
                if (marketsWithRanks.length > 0) {
                    console.log('\n🏆 Markets with ranks:');
                    marketsWithRanks.forEach((market: any) => {
                        console.log(`  Rank ${market.rank}: ${market.marketData?.marketName || 'Unknown'} ${market.marketData?.isGolden ? '⭐' : ''}`);
                    });
                }

                // Show markets without ranks
                if (marketsWithoutRanks.length > 0) {
                    console.log('\n❌ Markets without ranks:');
                    marketsWithoutRanks.forEach((market: any) => {
                        console.log(`  No rank: ${market.marketData?.marketName || 'Unknown'} ${market.marketData?.isGolden ? '⭐' : ''}`);
                    });
                }
            } else {
                console.log('❌ Markets API call failed:', marketsResponse.data.message);
            }
        } else {
            console.log('❌ Login failed:', loginResponse.data.message);
        }
    } catch (error: any) {
        console.error('❌ Test failed:', error.response?.data || error.message);
    }
}

// Run the test
testPlayerAPI(); 