import express from 'express';
import { errorHandler } from './middlewares/globalErrorHandler';
const app = express();

app.get('/', async (req, res) => {
    //
    res.status(200).send('Hello smasher');
});

// global error handler 
app.use(errorHandler)

export default app;