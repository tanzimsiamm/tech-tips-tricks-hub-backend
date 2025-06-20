import { Request, Response, NextFunction } from 'express';
import httpStatus from 'http-status';
import jwt, { JwtPayload } from 'jsonwebtoken';
import AppError from '../errors/AppError'; // Your custom AppError
import catchAsync from '../utils/catchAsync'; // Your catchAsync utility
import { User } from '../modules/users/user.model'; // Import the User model
import { TUser } from '../modules/users/user.interface'; // Import the TUser type from the user module
import config from '../config'; // Import your config for JWT secret

// Extend Express Request interface to include user property
export interface AuthenticatedRequest extends Request {
    user?: TUser; // User data will be attached here
}

const auth = (...requiredRoles: string[]) => catchAsync(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    let token: string | undefined = req.headers.authorization;

    if (!token || !token.startsWith('Bearer ')) {
        throw new AppError(httpStatus.UNAUTHORIZED, 'You are not authorized! No token provided.');
    }

    token = token.split(' ')[1]; // Extract token from "Bearer <token>"

    // Verify token
    let decoded: JwtPayload;
    try {
        if (!config.jwt_access_secret) { // Use config for JWT secret
            throw new Error('JWT_ACCESS_SECRET is not defined in config.');
        }
        decoded = jwt.verify(token, config.jwt_access_secret) as JwtPayload;
    } catch (error) {
        throw new AppError(httpStatus.UNAUTHORIZED, 'Invalid token or token expired!');
    }

    // Attach user to the request
    const user = await User.findById(decoded._id).select('+role +isBlocked'); // Fetch user with role and isBlocked status
    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, 'User not found!');
    }

    // Check if user is blocked
    if (user.isBlocked) {
        throw new AppError(httpStatus.FORBIDDEN, 'Your account is blocked!');
    }

    // Check if user has required roles
    if (requiredRoles.length && !requiredRoles.includes(user.role)) {
        throw new AppError(httpStatus.FORBIDDEN, 'You are not authorized to perform this action!');
    }

    // Attach the user (excluding password) to the request for controllers
    // Ensure that `req.user._id` is a string matching your `TUser` _id type.
    req.user = user.toObject({ getters: true });
    delete req.user.password; // Remove password explicitly

    next();
});

export default auth;