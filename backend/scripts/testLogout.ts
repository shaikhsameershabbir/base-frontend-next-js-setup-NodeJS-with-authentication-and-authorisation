import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { TokenBlacklist } from '../src/models/TokenBlacklist';
import { User } from '../src/models/User';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/matka_booking';
const JWT_SECRET = process.env.JWT_SECRET || 'test-secret';

async function testLogout() {
    try {
        // Connect to MongoDB
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        // Create a test user
        const testUser = new User({
            username: 'testuser',
            password: 'password123',
            role: 'player',
            balance: 1000,
            isActive: true
        });
        await testUser.save();
        console.log('Test user created:', testUser.username);

        // Generate a test token
        const tokenPayload = {
            userId: testUser._id.toString(),
            username: testUser.username,
            balance: testUser.balance,
            role: testUser.role,
            type: 'access',
            jti: 'test-token-id-' + Date.now(),
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + (15 * 60) // 15 minutes
        };

        const testToken = jwt.sign(tokenPayload, JWT_SECRET);
        console.log('Test token generated');

        // Test the logout functionality (simulate what the controller does)
        try {
            const decoded = jwt.verify(testToken, JWT_SECRET) as any;

            // Add token to blacklist with required fields
            const blacklistEntry = await TokenBlacklist.create({
                tokenId: decoded.jti || testToken,
                userId: decoded.userId,
                expiresAt: new Date(decoded.exp * 1000)
            });

            console.log('✅ Token successfully blacklisted:', blacklistEntry);
        } catch (tokenError) {
            console.error('❌ Error blacklisting token:', tokenError);
        }

        // Verify the token is in blacklist
        const blacklistedToken = await TokenBlacklist.findOne({ tokenId: tokenPayload.jti });
        if (blacklistedToken) {
            console.log('✅ Token found in blacklist');
        } else {
            console.log('❌ Token not found in blacklist');
        }

        // Clean up
        await User.findByIdAndDelete(testUser._id);
        await TokenBlacklist.findOneAndDelete({ tokenId: tokenPayload.jti });
        console.log('Test data cleaned up');

    } catch (error) {
        console.error('Test failed:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

// Run the test
testLogout(); 