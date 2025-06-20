import jwt from 'jsonwebtoken';
import config from '../config';

const generateToken = (id: string): string => {
    if (!config.jwt_access_secret || !config.jwt_access_expires) {
        throw new Error('JWT_ACCESS_SECRET or JWT_ACCESS_EXPIRES_IN is not defined in config');
    }
    
    return jwt.sign(
        { _id: id }, 
        config.jwt_access_secret as jwt.Secret, 
        { 
            expiresIn: config.jwt_access_expires 
        } as jwt.SignOptions
    );
};

export default generateToken;