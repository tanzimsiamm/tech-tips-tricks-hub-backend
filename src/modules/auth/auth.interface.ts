import { TUserProfileResponse, TUserBase } from '../users/user.interface';

export type TLoginPayload = Pick<TUserBase, 'email' | 'password'>;
// For register, we need name, email, password, image, role (role might be default)
export type TRegisterPayload = Pick<TUserBase, 'name' | 'email' | 'password' | 'image'> & { role?: TUserBase['role'] };

export interface IAuthResponse {
    token: string;
    user: TUserProfileResponse;
}