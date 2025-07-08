import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import createHttpError from 'http-errors';
import jwt from 'jsonwebtoken';
import User from '../userModals/usermodal';
import { config } from '../../../config/config';

// Controller function to handle user login
export const loginUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        // Extract email and password from the request body
        const { email, password } = req.body;

        // Check if a user with the provided email exists in the database
        const existingUser = await User.findOne({ email });
        if (!existingUser) {
            // If user not found, pass a 404 error to the error handler
            return next(createHttpError(404, 'User not found'));
        }

        // Compare provided password with stored hashed password
        const isMatch = await bcrypt.compare(password, existingUser.password);
        if (!isMatch) {
            // If password is incorrect, pass a 403 error to the error handler
            return next(createHttpError(403, 'Wrong password'));
        }

        // Generate a JWT token for the authenticated user with a 10-hour expiration
        const token = jwt.sign({ id: existingUser._id }, config.jwtSecret, { expiresIn: '10h' });

        // Send a success response with the generated token, user ID, and user role
        res.status(200).json({
            success: true,
            token,
            userId: existingUser._id,
            message: 'Login successful',
        });
    } catch (error) {
        // Pass any errors to the next middleware for centralized error handling
        next(error);
    }
};
