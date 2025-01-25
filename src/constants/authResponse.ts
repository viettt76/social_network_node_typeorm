import { httpStatusCode } from './httpStatusCode';

export const authResponse = {
    USERNAME_EXIST: {
        status: httpStatusCode.BAD_REQUEST,
        message: 'Username already exists',
    },
    ACCOUNT_DELETED: {
        status: httpStatusCode.GONE,
        message: 'Your account has been deleted',
    },
    LOGIN_INCORRECT: {
        status: httpStatusCode.UNAUTHORIZED,
        message: 'The username or password you entered is incorrect',
    },
    INVALID_TOKEN: {
        status: httpStatusCode.UNAUTHORIZED,
        message: 'Invalid token',
    },
    INVALID_REFRESH_TOKEN: {
        status: httpStatusCode.UNAUTHORIZED,
        message: 'Invalid refresh token',
    },
};
