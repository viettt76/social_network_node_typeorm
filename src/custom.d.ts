import { JwtPayload } from 'jsonwebtoken';

interface CustomJwtPayload extends JwtPayload {
    id: string;
    firstName: string;
    lastName: string;
    role: string;
}

declare global {
    namespace Express {
        interface Request {
            userToken?: JwtPayload | CustomJwtPayload;
        }
    }
}

export { CustomJwtPayload };
