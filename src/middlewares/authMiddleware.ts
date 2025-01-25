import { authResponse } from '@/constants/authResponse';
import { NextFunction, Request, Response } from 'express';
import jwt, { JwtPayload, VerifyErrors } from 'jsonwebtoken';

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const nonSecurePaths = ['/auth/signup', '/auth/login', '/auth/logout'];
    if (nonSecurePaths.includes(req.path)) return next();

    const jwtAccessSecret = process.env.JWT_ACCESS_SECRET;
    const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET;
    const tokenMaxAge = process.env.TOKEN_MAX_AGE;

    if (!jwtAccessSecret || !jwtRefreshSecret || !tokenMaxAge) {
        throw new Error('Missing JWT secrets or token max age');
    }

    const { token, refreshToken } = req.cookies;

    const handleRefreshToken = () => {
        const userToken = jwt.verify(refreshToken, jwtRefreshSecret) as JwtPayload;

        const newToken = jwt.sign(
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
                handleRefreshToken();
                return next();
            } catch (err) {
                handleInvalidRefreshToken();
            }
        } else {
            handleInvalidToken(authResponse.INVALID_TOKEN.message);
        }
    } else {
        jwt.verify(token, jwtAccessSecret, (err: VerifyErrors | null, userToken: JwtPayload | string | undefined) => {
            if (err) {
                if (refreshToken) {
                    try {
                        handleRefreshToken();
                        return next();
                    } catch (err) {
                        handleInvalidRefreshToken();
                    }
                } else {
                    handleInvalidToken(authResponse.INVALID_TOKEN.message);
                }
            }

            if (userToken && typeof userToken !== 'string') {
                req.userToken = userToken;
            }

            return next();
        });
    }
};

export default authMiddleware;
