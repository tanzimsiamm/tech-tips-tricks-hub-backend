import { Request, Response, NextFunction } from 'express';
import httpStatus from 'http-status';
import jwt, { JwtPayload } from 'jsonwebtoken';
import AppError from '../errors/AppError';
import catchAsync from '../utils/catchAsync';
import { User } from '../modules/users/user.model';
import config from '../config';

const auth = (...requiredRoles: string[]) => 
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization;

    // Check if token exists and is properly formatted
    if (!token || !token.startsWith('Bearer ')) {
      throw new AppError(httpStatus.UNAUTHORIZED, 'Authorization token missing or malformed');
    }

    // Extract and verify token
    const extractedToken = token.split(' ')[1];
    
    if (!config.jwt_access_secret) {
      throw new Error('JWT access secret is not configured');
    }

    let decoded: JwtPayload;
    try {
      decoded = jwt.verify(extractedToken, config.jwt_access_secret) as JwtPayload;
    } catch (error) {
      throw new AppError(httpStatus.UNAUTHORIZED, 'Invalid or expired token');
    }

    // Validate JWT payload structure
    if (!decoded._id || typeof decoded._id !== 'string') {
      throw new AppError(httpStatus.UNAUTHORIZED, 'Invalid token payload');
    }

    // Fetch user with security-related fields
    const user = await User.findById(decoded._id)
      .select('+role +isBlocked +passwordChangedAt');
    
    if (!user) {
      throw new AppError(httpStatus.NOT_FOUND, 'User account not found');
    }

    // Check account status
    if (user.isBlocked) {
      throw new AppError(httpStatus.FORBIDDEN, 'This account has been blocked');
    }

    // Verify role permissions
    if (requiredRoles.length && !requiredRoles.includes(user.role)) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        'Insufficient permissions for this operation'
      );
    }

    // Attach sanitized user to request
    const userObject = user.toObject({ virtuals: true, getters: true });
    req.user = {
      ...userObject,
      password: undefined // Explicitly remove password
    };

    next();
  });

export default auth;