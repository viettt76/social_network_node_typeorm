import { Request, Response } from 'express';

type ErrorType = {
    statusCode?: number;
    message?: string;
    stack?: string;
};

export const errorHandler = (error: ErrorType, req: Request, res: Response) => {
    const responseError = {
        statusCode: error.statusCode || 500,
        message: error.message || 'INTERNAL_SERVER_ERROR',
        stack: error.stack,
    };
    console.log(responseError);

    if (process.env.BUILD_MODE !== 'dev') delete responseError.stack;

    res.status(responseError.statusCode).json(responseError);
};
