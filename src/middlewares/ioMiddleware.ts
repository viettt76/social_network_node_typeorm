import { NextFunction, Request, Response } from 'express';
import { Server } from 'socket.io';

interface IoRequest extends Request {
    io?: Server;
}

const ioMiddleware = (io: Server) => (req: IoRequest, res: Response, next: NextFunction) => {
    req.io = io;
    next();
};

export default ioMiddleware;
