import { User } from '../users/user.model';
import { TLoginPayload, TRegisterPayload } from './auth.interface';
import AppError from '../../errors/AppError';
import httpStatus from 'http-status';
import generateToken from '../../utils/generateToken';
import { TUserProfileResponse, TUserBase, IUserDocument } from '../users/user.interface';
import { mapToUserProfileResponse } from '../users/user.mapper';

const registerUser = async (payload: TRegisterPayload) => {
    const { email, password, name, image, role } = payload;

    const userExists = await User.findOne({ email });
    if (userExists) {
        throw new AppError(httpStatus.CONFLICT, 'User with this email already exists!');
    }

    const newUser = await User.create({
        name,
        email,
        password, // FIX APPLIED HERE: password is now guaranteed string by TRegisterPayload
        image: image || 'https://placehold.co/150x150/cccccc/ffffff?text=No+Image',
        role: role || 'user',
        isBlocked: false,
        followers: [],
        following: [],
        memberShip: null,
    } as TUserBase); // Cast to TUserBase for creation

    const userResponse: TUserProfileResponse = mapToUserProfileResponse(newUser); // Use mapper
    return { user: userResponse, token: generateToken(newUser._id.toString()) };
};

const loginUser = async (payload: TLoginPayload) => {
    const { email, password } = payload;

    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.matchPassword(password as string))) { // Ensure password is treated as string
        throw new AppError(httpStatus.UNAUTHORIZED, 'Invalid credentials!');
    }

    if (user.isBlocked) {
        throw new AppError(httpStatus.FORBIDDEN, 'Your account is blocked. Please contact support.');
    }

    const userResponse: TUserProfileResponse = mapToUserProfileResponse(user); // Use mapper
    return { user: userResponse, token: generateToken(user._id.toString()) };
};

export const authServices = {
    registerUser,
    loginUser,
};