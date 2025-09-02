// Check ANDHRA MORNING market configuration
import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Define Market schema
const marketSchema = new mongoose.Schema({
    marketName: String,
    autoResult: Boolean,
    isActive: Boolean,
    openTime: String,
    closeTime: String,
    daysOfWeek: Number
});

const Market = mongoose.model('Market', marketSchema);

async function checkMarket() {
    try {
        const market = await Market.findOne({ marketName: 'ANDHRA MORNING' });

        if (market) {
            console.log('ANDHRA MORNING Market Configuration:');
            console.log('====================================');
            console.log(`Market Name: ${market.marketName}`);
            console.log(`Auto Result: ${market.autoResult}`);
            console.log(`Is Active: ${market.isActive}`);
            console.log(`Open Time: ${market.openTime}`);
            console.log(`Close Time: ${market.closeTime}`);
            console.log(`Days of Week: ${market.daysOfWeek}`);
            console.log(`_id: ${market._id}`);
        } else {
            console.log('❌ ANDHRA MORNING market not found in database');
        }

        // Check all markets with autoResult: true
        console.log('\nAll Markets with Auto Result Enabled:');
        console.log('=====================================');
        const autoMarkets = await Market.find({ autoResult: true, isActive: true });
        autoMarkets.forEach(m => {
            console.log(`✅ ${m.marketName}: ${m.openTime} - ${m.closeTime}`);
        });

    } catch (error) {
        console.error('Error:', error);
    } finally {
        mongoose.connection.close();
    }
}

checkMarket();
