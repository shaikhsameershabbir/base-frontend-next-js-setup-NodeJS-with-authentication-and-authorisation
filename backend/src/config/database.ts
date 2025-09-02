import mongoose from 'mongoose';
import { logger } from './logger';

export const connectDB = async (): Promise<void> => {
    try {
        const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/matka-sk';

        // Modern connection options compatible with MongoDB Atlas
        const options = {
            maxPoolSize: 10, // Maintain up to 10 socket connections
            serverSelectionTimeoutMS: 15000, // Keep trying to send operations for 15 seconds
            socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
            // Remove deprecated options
            // bufferMaxEntries: 0, // This option is deprecated
            // bufferCommands: false, // This option is deprecated
            // useNewUrlParser: true, // This option is deprecated
            // useUnifiedTopology: true, // This option is deprecated
        };

        logger.info(`Connecting to MongoDB: ${mongoURI.replace(/\/\/.*@/, '//***@')}`);

        await mongoose.connect(mongoURI, options);

        // Handle connection events
        mongoose.connection.on('error', (error: Error) => {
            logger.error('MongoDB connection error:', error);
        });

        mongoose.connection.on('disconnected', () => {
            logger.warn('MongoDB disconnected');
        });

        mongoose.connection.on('connected', () => {
            logger.info('MongoDB connected successfully');
        });

        mongoose.connection.on('reconnected', () => {
            logger.info('MongoDB reconnected');
        });

        // Wait for connection to be ready
        if (mongoose.connection.readyState !== 1) {
            await new Promise<void>((resolve, reject) => {
                const timeout = setTimeout(() => {
                    reject(new Error('Database connection timeout'));
                }, 20000); // 20 second timeout

                const checkConnection = () => {
                    if (mongoose.connection.readyState === 1) {
                        clearTimeout(timeout);
                        resolve();
                    } else {
                        setTimeout(checkConnection, 100);
                    }
                };
                checkConnection();
            });
        }

        logger.info('MongoDB connection established and ready');

        // Graceful shutdown
        process.on('SIGINT', async () => {
            logger.info('Received SIGINT, closing database connection...');
            await mongoose.connection.close();
            logger.info('Database connection closed');
            process.exit(0);
        });

        process.on('SIGTERM', async () => {
            logger.info('Received SIGTERM, closing database connection...');
            await mongoose.connection.close();
            logger.info('Database connection closed');
            process.exit(0);
        });

    } catch (error) {
        logger.error('MongoDB connection failed:', error);
        throw error;
    }
}; 