

import app from './src/app';
import { Config } from './src/config';
import { logger } from './src/config/logger';

const startServer = () => {
    const PORT = Config.PORT
    try {
        app.listen(PORT, () => {

            console.log('smasher')

        });
    } catch (error) {
        logger.error(`Error while starting server: ${error}`);
        // process.exit(1);
    }


}

startServer();

