import AppError from "../../errors/AppError";
import { TUser, TUserUpdatePayload, TFollowUnfollowPayload, IUserDocument, TUserProfileResponse } from "./user.interface";
import { User } from "./user.model";
import httpStatus from "http-status";

const getAllUsersFromDB = async (role?: string): Promise<TUserProfileResponse[]> => {
    let query: Record<string, any> = {};
    if (role) {
        query = { role };
    }
    // Exclude password and select relevant fields
    const result = await User.find(query).select('-password -__v').lean();
    return result as TUserProfileResponse[];
};

const getSingleUserFromDB = async (email: string): Promise<TUserProfileResponse | null> => {
    const result = await User.findOne({ email })
        .populate({ path: 'followers', select: 'name email image' }) // Populate with specific fields
        .populate({ path: 'following', select: 'name email image' })
        .select('-password -__v') // Exclude password and version key
        .lean(); // Use lean() for plain JS objects

    return result as TUserProfileResponse | null;
};

const updateUserIntoDB = async (id: string, payload: TUserUpdatePayload): Promise<TUserProfileResponse | null> => {
    const { password, ...otherUpdateFields } = payload;

    // Find user by ID first
    const user = await User.findById(id);
    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, 'User not found!');
    }

    // If email is being updated, check for uniqueness
    if (otherUpdateFields.email && otherUpdateFields.email !== user.email) {
        const existingUser = await User.findOne({ email: otherUpdateFields.email });
        if (existingUser) {
            throw new AppError(httpStatus.CONFLICT, 'Email already in use!');
        }
    }

    // Handle password update separately through Mongoose pre-save hook
    if (password) {
        user.password = password; // Mongoose pre-save hook will hash this
        await user.save(); // Save to trigger hashing and update password
        delete otherUpdateFields.password; // Remove password from other fields as it's handled
    }

    const result = await User.findByIdAndUpdate(id, otherUpdateFields, { new: true, runValidators: true })
        .select('-password -__v')
        .lean(); // Use lean() for plain JS object

    if (!result) {
        throw new AppError(httpStatus.BAD_REQUEST, 'Failed to update user');
    }
    return result as TUserProfileResponse;
};


const followUser = async (payload: TFollowUnfollowPayload): Promise<TUserProfileResponse | null> => {
    const { userId, targetedUserId } = payload;

    if (userId === targetedUserId) {
        throw new AppError(httpStatus.BAD_REQUEST, 'Cannot follow yourself!');
    }

    const [userToFollow, followerUser] = await Promise.all([
        User.findById(targetedUserId),
        User.findById(userId)
    ]);

    if (!userToFollow || !followerUser) {
        throw new AppError(httpStatus.NOT_FOUND, 'User(s) not found!');
    }

    if (userToFollow.followers?.includes(followerUser._id)) {
        throw new AppError(httpStatus.CONFLICT, 'You are already following this user!');
    }

    // Update the user who will be followed
    userToFollow.followers?.push(followerUser._id);
    await userToFollow.save();

    // Update the user who requested to follow
    followerUser.following?.push(userToFollow._id);
    await followerUser.save();

    // Return the updated follower user's profile (or the userToFollow, based on what FE needs)
    const updatedFollowerUser = await User.findById(userId).select('-password -__v').lean();
    return updatedFollowerUser as TUserProfileResponse;
};

const unFollowUser = async (payload: TFollowUnfollowPayload): Promise<TUserProfileResponse | null> => {
    const { userId, targetedUserId } = payload;

    const [userToUnfollow, unfollowerUser] = await Promise.all([
        User.findById(targetedUserId),
        User.findById(userId)
    ]);

    if (!userToUnfollow || !unfollowerUser) {
        throw new AppError(httpStatus.NOT_FOUND, 'User(s) not found!');
    }

    if (!userToUnfollow.followers?.includes(unfollowerUser._id)) {
        throw new AppError(httpStatus.CONFLICT, 'You are not following this user!');
    }

    // Update the user who will be unfollowed
    userToUnfollow.followers = userToUnfollow.followers?.filter(
        (id) => id.toString() !== unfollowerUser._id.toString()
    );
    await userToUnfollow.save();

    // Update the user who requested to unfollow
    unfollowerUser.following = unfollowerUser.following?.filter(
        (id) => id.toString() !== userToUnfollow._id.toString()
    );
    await unfollowerUser.save();

    const updatedUnfollowerUser = await User.findById(userId).select('-password -__v').lean();
    return updatedUnfollowerUser as TUserProfileResponse;
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