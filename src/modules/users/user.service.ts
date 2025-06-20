// services/user.service.ts
import httpStatus from 'http-status';
import { Types } from 'mongoose';

import AppError from '../../errors/AppError';
import {
  TUserUpdatePayload,
  TFollowUnfollowPayload,
  IUserDocument,
  TUserProfileResponse,
} from './user.interface';
import { User } from './user.model';

/* ------------------------------------------------
   Helpers
------------------------------------------------- */
const projection = '-password -__v';
const toProfile = (doc: unknown) => doc as TUserProfileResponse;

/* ------------------------------------------------
   Read
------------------------------------------------- */
 const getAllUsersFromDB = async (
  role?: string
): Promise<TUserProfileResponse[]> => {
  const query = role ? { role } : {};
  const users = await User.find(query).select(projection).lean();
  return users.map(toProfile);
};

 const getSingleUserFromDB = async (
  email: string
): Promise<TUserProfileResponse | null> => {
  const user = await User.findOne({ email })
    .populate({ path: 'followers', select: 'name email image' })
    .populate({ path: 'following', select: 'name email image' })
    .select(projection)
    .lean();

  return user ? toProfile(user) : null;
};

/* ------------------------------------------------
   Update
------------------------------------------------- */
 const updateUserIntoDB = async (
  id: string,
  payload: TUserUpdatePayload
): Promise<TUserProfileResponse | null> => {
  const { password, ...other } = payload;

  const user = await User.findById(id).select('+password');
  if (!user) throw new AppError(httpStatus.NOT_FOUND, 'User not found!');

  /* Ensure e‑mail uniqueness */
  if (other.email && other.email !== user.email) {
    const duplicate = await User.exists({ email: other.email });
    if (duplicate)
      throw new AppError(httpStatus.CONFLICT, 'Email already in use!');
  }

  /* Assign new fields */
  Object.assign(user, other);

  /* Handle password via pre‑save hook */
  if (password) user.password = password;

  await user.save(); // fires validators + hooks

  const { password: _, __v, ...rest } = user.toObject<IUserDocument>();
  return rest as TUserProfileResponse;
};

/* ------------------------------------------------
   Follow / Unfollow (atomic)
------------------------------------------------- */
 const followUser = async (
  { userId, targetedUserId }: TFollowUnfollowPayload
): Promise<TUserProfileResponse | null> => {
  if (userId === targetedUserId)
    throw new AppError(httpStatus.BAD_REQUEST, 'Cannot follow yourself!');

  /* Validate both users exist */
  const [targetExists, actorExists] = await Promise.all([
    User.exists({ _id: targetedUserId }),
    User.exists({ _id: userId }),
  ]);
  if (!targetExists || !actorExists)
    throw new AppError(httpStatus.NOT_FOUND, 'User(s) not found!');

  /* Add with $addToSet to avoid duplicates */
  await Promise.all([
    User.updateOne(
      { _id: targetedUserId },
      { $addToSet: { followers: new Types.ObjectId(userId) } }
    ),
    User.updateOne(
      { _id: userId },
      { $addToSet: { following: new Types.ObjectId(targetedUserId) } }
    ),
  ]);

  const updated = await User.findById(userId).select(projection).lean();
  return updated ? toProfile(updated) : null;
};

 const unFollowUser = async (
  { userId, targetedUserId }: TFollowUnfollowPayload
): Promise<TUserProfileResponse | null> => {
  /* Validate both users exist */
  const [targetExists, actorExists] = await Promise.all([
    User.exists({ _id: targetedUserId }),
    User.exists({ _id: userId }),
  ]);
  if (!targetExists || !actorExists)
    throw new AppError(httpStatus.NOT_FOUND, 'User(s) not found!');

  await Promise.all([
    User.updateOne(
      { _id: targetedUserId },
      { $pull: { followers: new Types.ObjectId(userId) } }
    ),
    User.updateOne(
      { _id: userId },
      { $pull: { following: new Types.ObjectId(targetedUserId) } }
    ),
  ]);

  const updated = await User.findById(userId).select(projection).lean();
  return updated ? toProfile(updated) : null;
};

/* ------------------------------------------------
   Delete
------------------------------------------------- */
 const deleteUserFromDB = async (
  id: string
): Promise<IUserDocument | null> => {
  const user = await User.findByIdAndDelete(id);
  if (!user) throw new AppError(httpStatus.NOT_FOUND, 'User not found!');
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