import { NextFunction, Request, Response } from 'express';
import { CustomJwtPayload } from '@/custom';
import { httpStatusCode } from '@/constants/httpStatusCode';
import userResponse from '@/constants/userResponse';
import { userService } from '@/services/userService';

class UserController {
    // [GET] /user/my-info
    async getMyInfo(req: Request, res: Response, next: NextFunction) {
        const { id } = req.userToken as CustomJwtPayload;

        const user = await userService.findUserById(id);

        if (user) {
            res.status(httpStatusCode.OK).json({
                id: user.id,
                lastName: user.lastName,
                firstName: user.firstName,
                birthday: user.birthday,
                role: user.role,
                homeTown: user.homeTown,
                school: user.school,
                workplace: user.workplace,
                avatar: user.avatar,
                isPrivate: user.isPrivate,
            });
        } else {
            res.clearCookie('token');
            res.clearCookie('refreshToken');
            res.status(userResponse.USER_NOT_FOUND.status).json({
                message: userResponse.USER_NOT_FOUND.message,
            });
        }
    }
}

export const userController = new UserController();
