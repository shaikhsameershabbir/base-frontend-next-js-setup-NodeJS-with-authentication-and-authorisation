#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

// Configuration
const PORT = process.env.PORT || 3001;
const HOSTNAME = process.env.HOSTNAME || '0.0.0.0';

console.log(`🚀 Starting Admin Panel on ${HOSTNAME}:${PORT}`);

// Set environment variables
process.env.PORT = PORT;
process.env.HOSTNAME = HOSTNAME;

// Start the Next.js application
const child = spawn('npm', ['start'], {
    stdio: 'inherit',
    env: {
        ...process.env,
        PORT: PORT,
        HOSTNAME: HOSTNAME
    }
});

child.on('error', (error) => {
    console.error('❌ Failed to start application:', error);
    process.exit(1);
});

child.on('close', (code) => {
    console.log(`🔻 Application exited with code ${code}`);
    process.exit(code);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down gracefully...');
    child.kill('SIGINT');
});

process.on('SIGTERM', () => {
    console.log('\n🛑 Shutting down gracefully...');
    child.kill('SIGTERM');
});
