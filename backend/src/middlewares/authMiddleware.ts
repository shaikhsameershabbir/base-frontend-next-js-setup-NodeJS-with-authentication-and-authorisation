// middlewares/authMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/config';
import createHttpError from 'http-errors';
if (!config.jwtSecret) {
    throw new Error('JWT_SECRET not set in environment variables');
}
export const authenticateJWT = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return next(createHttpError(401, 'Authorization header missing'));
    }
    const token = authHeader.split(' ')[1];


    jwt.verify(token, config.jwtSecret, (err) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid or expired token' });
        }
        // Attach the user data from the token to the request object
        // req.user = decoded as { id: string }; // Assuming the token payload contains user ID as 'id'
        next();
    });
};
