import { IUserDocument, TUserProfileResponse, TUserBase, TMembership, TPopulatedUser } from './user.interface';
import { Types } from 'mongoose';

// Helper function to map a single Mongoose Document (or lean result) to TUserProfileResponse
// This function explicitly handles all _id.toString() and nested mapping.
export const mapToUserProfileResponse = (
    userDoc: IUserDocument | (TUserBase & { _id: Types.ObjectId; followers?: any[]; following?: any[]; }) // The input could be a full doc or a lean result
): TUserProfileResponse => {
    // Safely map TMembership dates from potential strings/Date objects
    const mapMembership = (membership: TMembership | null | undefined): TMembership | null => {
        if (!membership) return null;
        return {
            ...membership,
            takenDate: membership.takenDate instanceof Date ? membership.takenDate : new Date(membership.takenDate),
            exp: membership.exp instanceof Date ? membership.exp : new Date(membership.exp),
        };
    };

    // Safely map populated user sub-documents (like in followers/following arrays)
    const mapPopulatedUser = (populatedUser: any): TPopulatedUser => {
        return {
            _id: populatedUser._id.toString(), // Ensure _id is string
            name: populatedUser.name,
            email: populatedUser.email,
            image: populatedUser.image,
        };
    };

    return {
        _id: userDoc._id.toString(), // Convert ObjectId to string
        name: userDoc.name,
        email: userDoc.email,
        role: userDoc.role,
        image: userDoc.image,
        coverImg: userDoc.coverImg,
        memberShip: mapMembership(userDoc.memberShip),
        isBlocked: userDoc.isBlocked,
        createdAt: userDoc.createdAt,
        updatedAt: userDoc.updatedAt,
        // Map followers/following arrays using the helper for populated users
        followers: userDoc.followers?.map(mapPopulatedUser) || [],
        following: userDoc.following?.map(mapPopulatedUser) || [],
    };
};