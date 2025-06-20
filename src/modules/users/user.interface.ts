import { Document, Types } from 'mongoose';

export type TMembership = {
    takenDate: string;
    exp: string;
    package: {
        name: string;
        price: number;
    };
};

export type TUser = {
    _id: Types.ObjectId;
    name: string;
    password?: string;
    email: string;
    role: 'user' | 'admin';
    image: string;
    coverImg?: string;
    memberShip?: TMembership | null;
    followers?: Types.ObjectId[];
    following?: Types.ObjectId[];
    isBlocked?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
};

export interface IUserDocument extends Omit<TUser, '_id'>, Document {
    matchPassword(enteredPassword: string): Promise<boolean>;
}

export type TUserProfileResponse = Omit<TUser, 'password'> & { _id: string }; // For API responses
export type TUserUpdatePayload = Partial<Omit<TUser, '_id' | 'role' | 'followers' | 'following' | 'memberShip'>>;
export type TAdminUserUpdatePayload = Partial<Omit<TUser, '_id'>>;
export type TFollowUnfollowPayload = { userId: string; targetedUserId: string };