import { TUser, TUserBase, TUserProfileResponse } from '../users/user.interface';

export type TLoginPayload = Pick<TUserBase, 'email' | 'password'>;
// FIX APPLIED HERE: TRegisterPayload's password is now explicitly 'string'
export type TRegisterPayload = Pick<TUserBase, 'name' | 'email'> & {
    password: string; // Password is required and guaranteed string after Zod validation
    image?: string;
    role?: TUserBase['role'];
};

export interface IAuthResponse {
    token: string;
    user: TUserProfileResponse;
}