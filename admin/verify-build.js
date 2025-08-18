const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying build configuration...\n');

// Check if .next directory exists
const nextDir = path.join(__dirname, '.next');
if (!fs.existsSync(nextDir)) {
    console.log('❌ No .next directory found. Run npm run build first.');
    process.exit(1);
}

// Check environment variables
console.log('📋 Environment Variables:');
console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);
console.log(`   PORT: ${process.env.PORT || 'not set'}`);
console.log(`   NEXT_PUBLIC_API_URL: ${process.env.NEXT_PUBLIC_API_URL || 'not set'}`);

// Check .env file
const envFile = path.join(__dirname, '.env');
if (fs.existsSync(envFile)) {
    console.log('\n📁 .env file contents:');
    const envContent = fs.readFileSync(envFile, 'utf8');
    console.log(envContent);
} else {
    console.log('\n❌ No .env file found');
}

// Check if build includes the correct API URL
try {
    const buildManifest = path.join(__dirname, '.next/build-manifest.json');
    if (fs.existsSync(buildManifest)) {
        console.log('\n✅ Build manifest found');

        // Look for any files that might contain the API URL
        const staticDir = path.join(__dirname, '.next/static');
        if (fs.existsSync(staticDir)) {
            console.log('✅ Static files directory found');
        }
    }
} catch (error) {
    console.log('❌ Error checking build files:', error.message);
}

console.log('\n🎯 Next steps if API URL is wrong:');
console.log('1. Stop PM2: pm2 stop matka-admin');
console.log('2. Clean build: rm -rf .next');
console.log('3. Rebuild: NEXT_PUBLIC_API_URL=http://104.248.144.160:5555/api/v1 npm run build');
console.log('4. Restart: pm2 start ecosystem.config.js --env production --update-env');
