import { httpStatusCode } from './httpStatusCode';

export const postResponse = {
    POST_NOT_FOUND: {
        status: httpStatusCode.BAD_REQUEST,
        message: 'Post not found',
    },
};
