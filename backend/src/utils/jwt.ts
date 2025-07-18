import jwt, { JwtPayload } from 'jsonwebtoken';
import { IUser } from '../models/User';
import crypto from 'crypto';

const JWT_SECRET: jwt.Secret = process.env.JWT_SECRET || crypto.randomBytes(64).toString('hex');
const JWT_REFRESH_SECRET: jwt.Secret = process.env.JWT_REFRESH_SECRET || crypto.randomBytes(64).toString('hex');

export interface JWTPayload extends JwtPayload {
    userId: string;
    username: string;
    balance: number;
    role: string;
    parentId?: string;
    type: 'access' | 'refresh';
    jti?: string; // JWT ID for token revocation
}

export interface TokenPair {
    accessToken: string;
    refreshToken: string;
    accessTokenExpires: number;
    refreshTokenExpires: number;
    device: string;
}

// Generate a unique token ID for revocation tracking
const generateTokenId = (): string => {
    return crypto.randomBytes(32).toString('hex');
};

export const generateTokenPair = (user: IUser, device: string = 'unknown'): TokenPair => {
    const tokenId = generateTokenId();
    const now = Math.floor(Date.now() / 1000);

    const accessTokenPayload: JWTPayload = {
        userId: String(user._id),
        username: user.username,
        balance: user.balance,
        role: user.role,
        device: device,
        parentId: user.parentId ? String(user.parentId) : undefined,
        type: 'access',
        jti: tokenId,
        iat: now,
        exp: now + (15 * 60) // 15 minutes
    };

    const refreshTokenPayload: JWTPayload = {
        userId: String(user._id),
        username: user.username,
        balance: user.balance,
        role: user.role,
        device: device,
        parentId: user.parentId ? String(user.parentId) : undefined,
        type: 'refresh',
        jti: tokenId,
        iat: now,
        exp: now + (7 * 24 * 60 * 60) // 7 days
    };

    const accessToken = jwt.sign(accessTokenPayload, JWT_SECRET, {
        algorithm: 'HS256'
    });

    const refreshToken = jwt.sign(refreshTokenPayload, JWT_REFRESH_SECRET, {
        algorithm: 'HS256'
    });

    return {
        accessToken,
        refreshToken,
        accessTokenExpires: accessTokenPayload.exp!,
        refreshTokenExpires: refreshTokenPayload.exp!,
        device
    };
};

export const generateAccessToken = (user: IUser, device: string = 'unknown'): string => {
    const tokenId = generateTokenId();
    const now = Math.floor(Date.now() / 1000);

    const payload: JWTPayload = {
        userId: String(user._id),
        username: user.username,
        balance: user.balance,
        role: user.role,
        device: device,
        parentId: user.parentId ? String(user.parentId) : undefined,
        type: 'access',
        jti: tokenId,
        iat: now,
        exp: now + (15 * 60) // 15 minutes
    };

    return jwt.sign(payload, JWT_SECRET, {
        algorithm: 'HS256'
    });
};

export const verifyAccessToken = (token: string): JWTPayload => {
    try {
        const decoded = jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] }) as JWTPayload;

        if (decoded.type !== 'access') {
            throw new Error('Invalid token type');
        }

        return decoded;
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            throw new Error('Access token expired');
        }
        throw new Error('Invalid access token');
    }
};

export const verifyRefreshToken = (token: string): JWTPayload => {
    try {
        const decoded = jwt.verify(token, JWT_REFRESH_SECRET, { algorithms: ['HS256'] }) as JWTPayload;

        if (decoded.type !== 'refresh') {
            throw new Error('Invalid token type');
        }

        return decoded;
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            throw new Error('Refresh token expired');
        }
        throw new Error('Invalid refresh token');
    }
};

export const extractTokenFromHeader = (authHeader: string): string => {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new Error('Authorization header must start with Bearer');
    }

    return authHeader.substring(7);
};

// Cookie-based token extraction
export const extractTokenFromCookie = (cookieHeader: string): string | null => {
    if (!cookieHeader) return null;

    const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
        const [key, value] = cookie.trim().split('=');
        acc[key] = value;
        return acc;
    }, {} as Record<string, string>);

    return cookies.authToken || null;
};

// Extract refresh token from cookies
export const extractRefreshTokenFromCookie = (cookieHeader: string): string | null => {
    if (!cookieHeader) return null;

    const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
        const [key, value] = cookie.trim().split('=');
        acc[key] = value;
        return acc;
    }, {} as Record<string, string>);

    return cookies.refreshToken || null;
};

// Set cookie options for access token
export const getAccessTokenCookieOptions = () => {
    const isProduction = process.env.NODE_ENV === 'production';

    return {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'strict' : 'lax' as 'strict' | 'lax',
        maxAge: 15 * 60 * 1000, // 15 minutes
        path: '/',
        domain: process.env.COOKIE_DOMAIN || undefined
    };
};

// Set cookie options for refresh token
export const getRefreshTokenCookieOptions = () => {
    const isProduction = process.env.NODE_ENV === 'production';

    return {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'strict' : 'lax' as 'strict' | 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        path: '/',
        domain: process.env.COOKIE_DOMAIN || undefined
    };
};

// Clear cookie options
export const getClearCookieOptions = () => {
    const isProduction = process.env.NODE_ENV === 'production';

    return {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'strict' : 'lax' as 'strict' | 'lax',
        path: '/',
        domain: process.env.COOKIE_DOMAIN || undefined,
        expires: new Date(0)
    };
}; 