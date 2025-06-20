import { User } from '../users/user.model';
import { TLoginPayload, TRegisterPayload } from './auth.interface';
import AppError from '../../errors/AppError';
import httpStatus from 'http-status';
import { TUserBase } from '../users/user.interface';
import generateToken from '../../utils/generateToken';

const registerUser = async (payload: TRegisterPayload) => {
    const { email, password, name, image, role } = payload;

    const userExists = await User.findOne({ email });
    if (userExists) {
        throw new AppError(httpStatus.CONFLICT, 'User with this email already exists!');
    }

    const newUser = await User.create({
        name,
        email,
        password,
        image: image || 'https://placehold.co/150x150/cccccc/ffffff?text=No+Image', // Default image
        role: role || 'user',
        isBlocked: false,
        // Initialize other fields as per schema if not provided and no default
        followers: [],
        following: [],
        memberShip: null,
    });

    const userResponse: TUserBase = newUser.toObject({ getters: true });
    delete userResponse.password; // Ensure password is removed
    return { user: userResponse, token: generateToken(newUser._id.toString()) };
};

const loginUser = async (payload: TLoginPayload) => {
    const { email, password } = payload;

    if (!password) {
        throw new AppError(httpStatus.UNAUTHORIZED, 'Invalid credentials!');
    }

    const user = await User.findOne({ email }).select('+password'); // Explicitly select password for comparison

    if (!user || !(await user.matchPassword(password))) {
        throw new AppError(httpStatus.UNAUTHORIZED, 'Invalid credentials!');
    }

    if (user.isBlocked) {
        throw new AppError(httpStatus.FORBIDDEN, 'Your account is blocked. Please contact support.');
    }

    const userResponse: TUserBase = user.toObject({ getters: true });
    delete userResponse.password;
    return { user: userResponse, token: generateToken(user._id.toString()) };
};

export const authServices = {
    registerUser,
    loginUser,
};