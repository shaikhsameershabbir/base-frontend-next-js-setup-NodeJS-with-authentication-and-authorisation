
import { Request, Response, NextFunction } from 'express';

import { HttpError } from "http-errors";
import { logger } from "../config/logger";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorHandler = (err: HttpError, req: Request, res: Response, next: NextFunction) => {

    logger.error(err.message);
    const statusCode = err.statusCode || 500
    res.status(statusCode).json({
        errors: [
            {
                type: err.name,
                msg: err.message,
                path: "",
                location: ""
            }
        ]
    });

};