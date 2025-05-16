import { authResponse } from '@/constants/authResponse';
import { CustomJwtPayload } from '@/custom';
import { userService } from '@/services/userService';
import { NextFunction, Request, Response } from 'express';
import { verify, sign, JwtPayload, VerifyErrors } from 'jsonwebtoken';
import { Server } from 'socket.io';

const authMiddleware = async (req: Request, res: Response, next: NextFunction, io: Server) => {
    const nonSecurePaths = ['/auth/users', '/auth/token', '/auth/recover-account'];
    if (nonSecurePaths.includes(req.path)) return next();

    const jwtAccessSecret = process.env.JWT_ACCESS_SECRET;
    const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET;
    const tokenMaxAge = process.env.TOKEN_MAX_AGE;

    if (!jwtAccessSecret || !jwtRefreshSecret || !tokenMaxAge) {
        throw new Error('Missing JWT secrets or token max age');
    }

    const { token, refreshToken } = req.cookies;

    const handleRefreshToken = async () => {
        const userToken = verify(refreshToken, jwtRefreshSecret) as CustomJwtPayload;

        const user = await userService.getUserFields({ userId: userToken.id, fields: ['isActive'] });

        if (!user?.isActive) {
            res.clearCookie('token');
            res.clearCookie('refreshToken');
            return res.status(authResponse.ACCOUNT_LOCKED.status).json({
                message: authResponse.ACCOUNT_LOCKED.message,
                code: authResponse.ACCOUNT_LOCKED.code,
            });
        }

        const newToken = sign(
            {
                id: userToken.id,
                firstName: userToken.firstName,
                lastName: userToken.lastName,
                role: userToken.role,
            },
            jwtAccessSecret,
        );

        res.cookie('token', newToken, {
            httpOnly: true,
            sameSite: 'none',
            secure: true,
            maxAge: eval(tokenMaxAge),
        });

        req.userToken = userToken;
        return next();
    };

    const handleInvalidToken = (message: string) => {
        res.clearCookie('token');
        res.clearCookie('refreshToken');
        return res.status(authResponse.INVALID_TOKEN.status).json({ message });
    };

    const handleInvalidRefreshToken = () => {
        return res
            .status(authResponse.INVALID_REFRESH_TOKEN.status)
            .json({ message: authResponse.INVALID_REFRESH_TOKEN.message });
    };

    if (!token) {
        if (refreshToken) {
            try {
                return await handleRefreshToken();
            } catch (err) {
                return handleInvalidRefreshToken();
            }
        } else {
            return handleInvalidToken(authResponse.INVALID_TOKEN.message);
        }
    } else {
        verify(token, jwtAccessSecret, async (err: VerifyErrors | null, userToken: JwtPayload | string | undefined) => {
            if (err) {
                if (refreshToken) {
                    try {
                        return await handleRefreshToken();
                    } catch (err) {
                        return handleInvalidRefreshToken();
                    }
                } else {
                    return handleInvalidToken(authResponse.INVALID_TOKEN.message);
                }
            }

            if (userToken && typeof userToken !== 'string') {
                (async () => {
                    const user = await userService.getUserFields({ userId: userToken.id, fields: ['isActive'] });

                    if (!user?.isActive) {
                        io.to(`user-${userToken.id}`).emit('accountLocked', authResponse.ACCOUNT_LOCKED.message);

                        res.clearCookie('token');
                        res.clearCookie('refreshToken');

                        return res.status(authResponse.ACCOUNT_LOCKED.status).json({
                            message: authResponse.ACCOUNT_LOCKED.message,
                            code: authResponse.ACCOUNT_LOCKED.code,
                        });
                    }

                    req.userToken = userToken;
                    return next();
                })();
            }
        });
    }
};

export default authMiddleware;
