import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { statisticsServices } from './statistics.service';

const getOverallStats = catchAsync(async (req: Request, res: Response) => {
    const result = await statisticsServices.getOverallAppStats();
    sendResponse(res, { statusCode: httpStatus.OK, success: true, message: 'Overall statistics retrieved!', data: result });
});

export const statisticsControllers = {
    getOverallStats,
};