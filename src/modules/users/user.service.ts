import { TUser, TUserUpdatePayload, TFollowUnfollowPayload, IUserDocument, TUserProfileResponse, TAdminUserUpdatePayload, TUserBase, TMembership } from "./user.interface";
import { User } from "./user.model";
import AppError from "../../errors/AppError";
import httpStatus from "http-status";
import { Types } from 'mongoose';

// Helper function to map IUserDocument (or lean result) to TUserProfileResponse
// This ensures all _id's are strings and nested populated data matches the response type
const mapToUserProfileResponse = (userDoc: IUserDocument | (TUserBase & { _id: Types.ObjectId; followers?: any[]; following?: any[]; })): TUserProfileResponse => {
    return {
        _id: userDoc._id.toString(), // Convert ObjectId to string
        name: userDoc.name,
        email: userDoc.email,
        role: userDoc.role,
        image: userDoc.image,
        coverImg: userDoc.coverImg,
        memberShip: userDoc.memberShip ? {
            ...userDoc.memberShip,
            takenDate: userDoc.memberShip.takenDate instanceof Date ? userDoc.memberShip.takenDate : new Date(userDoc.memberShip.takenDate),
            exp: userDoc.memberShip.exp instanceof Date ? userDoc.memberShip.exp : new Date(userDoc.memberShip.exp),
        } : null,
        // Map populated fields to their string _id and other selected properties
        followers: userDoc.followers?.map((f: any) => ({ _id: f._id.toString(), name: f.name, email: f.email, image: f.image })) || [],
        following: userDoc.following?.map((f: any) => ({ _id: f._id.toString(), name: f.name, email: f.email, image: f.image })) || [],
        isBlocked: userDoc.isBlocked,
        createdAt: userDoc.createdAt,
        updatedAt: userDoc.updatedAt,
    };
};

const getAllUsersFromDB = async (role?: string): Promise<TUserProfileResponse[]> => {
    let query: Record<string, any> = {};
    if (role) {
        query = { role };
    }
    const result = await User.find(query).select('-password -__v').lean();
    return result.map(mapToUserProfileResponse);
};

const getSingleUserFromDB = async (email: string): Promise<TUserProfileResponse | null> => {
    const result = await User.findOne({ email })
        .populate({ path: 'followers', select: 'name email image' })
        .populate({ path: 'following', select: 'name email image' })
        .select('-password -__v')
        .lean();

    if (!result) return null;

    return mapToUserProfileResponse(result);
};

const updateUserIntoDB = async (id: string, payload: TUserUpdatePayload | TAdminUserUpdatePayload): Promise<TUserProfileResponse | null> => {
    const { password, ...otherUpdateFields } = payload;

    const user = await User.findById(id).select('+password') as IUserDocument | null;
    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, 'User not found!');
    }

    if ('email' in otherUpdateFields && otherUpdateFields.email && otherUpdateFields.email !== user.email) {
        const existingUser = await User.findOne({ email: otherUpdateFields.email });
        if (existingUser) {
            throw new AppError(httpStatus.CONFLICT, 'Email already in use!');
        }
    }

    if (password) {
        user.password = password;
        await user.save();
    }
    
    const updatedUserDoc = await User.findByIdAndUpdate<IUserDocument>(id, otherUpdateFields, { new: true, runValidators: true })
        .select('-password -__v')
        .lean();

    if (!updatedUserDoc) {
        throw new AppError(httpStatus.BAD_REQUEST, 'Failed to update user');
    }

    return mapToUserProfileResponse(updatedUserDoc);
};


const followUser = async (payload: TFollowUnfollowPayload): Promise<TUserProfileResponse | null> => {
    const { userId, targetedUserId } = payload;

    if (userId === targetedUserId) {
        throw new AppError(httpStatus.BAD_REQUEST, 'Cannot follow yourself!');
    }

    const session = await User.startSession();
    session.startTransaction();

    try {
        const userToFollow = await User.findById(targetedUserId).session(session) as IUserDocument | null;
        const followerUser = await User.findById(userId).session(session) as IUserDocument | null;

        if (!userToFollow || !followerUser) {
            throw new AppError(httpStatus.NOT_FOUND, 'User(s) not found!');
        }

        if (userToFollow.followers?.some(f => f.equals(followerUser._id))) {
             throw new AppError(httpStatus.CONFLICT, 'You are already following this user!');
        }

        userToFollow.followers?.push(followerUser._id);
        await userToFollow.save({ session });

        followerUser.following?.push(userToFollow._id);
        await followerUser.save({ session });

        await session.commitTransaction();

        const updatedFollowerUser = await User.findById(userId)
            .select('-password -__v')
            .populate({ path: 'followers', select: 'name email image' })
            .populate({ path: 'following', select: 'name email image' })
            .lean();

        if (!updatedFollowerUser) return null;

        return mapToUserProfileResponse(updatedFollowerUser);

    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
};

const unFollowUser = async (payload: TFollowUnfollowPayload): Promise<TUserProfileResponse | null> => {
    const { userId, targetedUserId } = payload;

    const session = await User.startSession();
    session.startTransaction();

    try {
        const userToUnfollow = await User.findById(targetedUserId).session(session) as IUserDocument | null;
        const unfollowerUser = await User.findById(userId).session(session) as IUserDocument | null;

        if (!userToUnfollow || !unfollowerUser) {
            throw new AppError(httpStatus.NOT_FOUND, 'User(s) not found!');
        }

        if (!userToUnfollow.followers?.some(f => f.equals(unfollowerUser._id))) {
            throw new AppError(httpStatus.CONFLICT, 'You are not following this user!');
        }

        userToUnfollow.followers = userToUnfollow.followers?.filter(
            (id: Types.ObjectId) => !id.equals(unfollowerUser._id)
        );
        await userToUnfollow.save({ session });

        unfollowerUser.following = unfollowerUser.following?.filter(
            (id: Types.ObjectId) => !id.equals(userToUnfollow._id)
        );
        await unfollowerUser.save({ session });

        await session.commitTransaction();

        const updatedUnfollowerUser = await User.findById(userId)
            .select('-password -__v')
            .populate({ path: 'followers', select: 'name email image' })
            .populate({ path: 'following', select: 'name email image' })
            .lean();

        if (!updatedUnfollowerUser) return null;

        return mapToUserProfileResponse(updatedUnfollowerUser);

    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
};


const deleteUserFromDB = async (id: string): Promise<IUserDocument | null> => {
    const user = await User.findByIdAndDelete(id);
    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, 'User not found!');
    }
    return user;
};


export const userServices = {
    getAllUsersFromDB,
    getSingleUserFromDB,
    updateUserIntoDB,
    deleteUserFromDB,
    followUser,
    unFollowUser,
};