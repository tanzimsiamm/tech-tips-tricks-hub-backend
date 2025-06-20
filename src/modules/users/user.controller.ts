import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { userServices } from "./user.service";
import AppError from "../../errors/AppError";
import { AuthenticatedRequest } from "../../middleware/auth";

const getAllUsers = catchAsync(async (req, res) => {
    const { role } = req.query;
    const result = await userServices.getAllUsersFromDB(role as string | undefined);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Users retrieved successfully',
        data: result,
    });
});

const getSingleUser = catchAsync(async (req, res) => {
    const { email } = req.params;
    const result = await userServices.getSingleUserFromDB(email);

    if (!result) {
        throw new AppError(httpStatus.NOT_FOUND, 'User not found');
    }

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'User retrieved successfully',
        data: result,
    });
});

const updateUser = catchAsync(async (req: AuthenticatedRequest, res) => {
    const { id } = req.params;
    const requestingUser = req.user;

    if (requestingUser?.role !== 'admin' && String(requestingUser?._id) !== id) {
        throw new AppError(httpStatus.FORBIDDEN, 'You are not authorized to update this user\'s profile!');
    }

    const result = await userServices.updateUserIntoDB(id, req.body);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'User updated successfully',
        data: result,
    });
});

const followUser = catchAsync(async (req: AuthenticatedRequest, res) => {
    const { targetedUserId } = req.body;
    const userId = String(req.user!._id);

    const result = await userServices.followUser({ userId, targetedUserId });

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'You followed the user',
        data: result,
    });
});

const unFollowUser = catchAsync(async (req: AuthenticatedRequest, res) => {
    const { targetedUserId } = req.body;
    const userId = String(req.user!._id);

    const result = await userServices.unFollowUser({ userId, targetedUserId });

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'You unfollowed the user',
        data: result,
    });
});

const deleteUser = catchAsync(async (req, res) => {
    const { id } = req.params;
    const result = await userServices.deleteUserFromDB(id);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'User deleted successfully',
        data: result,
    });
});

export const userControllers = {
    getAllUsers, getSingleUser, updateUser, deleteUser,
    followUser, unFollowUser
};