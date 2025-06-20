import { Document, Types } from 'mongoose';

export type TMembership = {
    takenDate: Date;
    exp: Date;
    package: {
        name: string;
        price: number;
    };
};

// Base user type without _id for schema definition
export type TUserBase = {
    name: string;
    password?: string;
    email: string;
    role: 'user' | 'admin';
    image: string; // Profile picture URL
    coverImg?: string; // Cover image URL
    memberShip?: TMembership | null;
    followers?: Types.ObjectId[]; // Array of User Objectids (Mongoose internal)
    following?: Types.ObjectId[]; // Array of User Objectids (Mongoose internal)
    isBlocked?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
};

// Mongoose Document interface. It extends TUserBase and Mongoose's Document, explicitly adding _id.
export interface IUserDocument extends TUserBase, Document {
    _id: Types.ObjectId; // Explicitly define _id here for the Mongoose Document
    matchPassword(enteredPassword: string): Promise<boolean>; // Mongoose instance method
}

// Complete user type, including _id for general use outside Mongoose Document context
export type TUser = TUserBase & {
    _id: Types.ObjectId;
};

// FIX APPLIED HERE: Added TPopulatedUser interface
// Type for a *populated* user (used within populated arrays like followers/following)
// This reflects the `select` clause in your populate option (`name email image`)
export type TPopulatedUser = {
    _id: string; // When populated and lean, _id usually becomes string in final JSON.
    name: string;
    email: string;
    image?: string;
};


// Response type for user profile, matching the *plain JSON object* you return from service
export type TUserProfileResponse = {
    _id: string; // Explicitly string for API response
    name: string;
    email: string;
    role: 'user' | 'admin';
    image: string;
    coverImg?: string;
    memberShip?: TMembership | null; // Membership can contain Date objects
    followers?: TPopulatedUser[]; // Now references TPopulatedUser
    following?: TPopulatedUser[]; // Now references TPopulatedUser
    isBlocked?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
};

// Payload types for requests
export type TUserUpdatePayload = Partial<Omit<TUser, '_id' | 'role' | 'followers' | 'following' | 'memberShip'>>;
export type TAdminUserUpdatePayload = Partial<Omit<TUser, '_id'>>;
export type TFollowUnfollowPayload = {
    userId: string;
    targetedUserId: string
};