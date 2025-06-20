import { Document, Types } from 'mongoose';

export type TMembership = {
  takenDate: string;
  exp: string;
  package: object;
};

export type TUser = {
  _id?: Types.ObjectId;
  name: string;
  password?: string;
  email: string;
  role: 'user' | 'admin';
  image: string;
  coverImg?: string;
  memberShip?: TMembership | null;
  followers?: Types.ObjectId[];
  following?: Types.ObjectId[];
  iat?: number;
  exp?: number;
  isBlocked?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
};

export interface IUserDocument extends Omit<TUser, '_id'>, Document {
  matchPassword(enteredPassword: string): Promise<boolean>;
}

export type TUserProfileResponse = Omit<TUser, 'password' | 'iat' | 'exp'>;
export type TUserUpdatePayload = Partial<Omit<TUser, '_id' | 'role' | 'iat' | 'exp' | 'followers' | 'following' | 'memberShip' | 'isBlocked'>>;
export type TAdminUserUpdatePayload = Partial<Omit<TUser, '_id' | 'iat' | 'exp'>>;
export type TFollowUnfollowPayload = { userId: string; targetedUserId: string };