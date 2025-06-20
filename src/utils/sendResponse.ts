import { Response } from 'express';

interface IApiResponse<T> {
    statusCode: number;
    success: boolean;
    message?: string;
    data?: T;
    meta?: { // Optional for pagination/etc.
        page: number;
        limit: number;
        total: number;
    };
}

const sendResponse = <T>(res: Response, data: IApiResponse<T>): void => {
    res.status(data.statusCode).json({
        success: data.success,
        message: data.message,
        data: data.data,
        meta: data.meta,
    });
};

export default sendResponse;