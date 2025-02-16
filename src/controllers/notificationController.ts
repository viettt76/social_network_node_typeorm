import { Request, Response } from 'express';
import { CustomJwtPayload } from '@/custom';
import { httpStatusCode } from '@/constants/httpStatusCode';
import { Notification } from '@/entity/Notification';
import { notificationService } from '@/services/notificationService';

class NotificationController {
    // [GET] /notifications
    async getNotifications(req: Request, res: Response): Promise<any> {
        const { id } = req.userToken as CustomJwtPayload;

        const rawNotifications = await notificationService.getNotifications(id);

        const notifications = rawNotifications.reduce((acc, notification) => {
            const typeKey = notification.type;
            if (!acc[typeKey]) {
                acc[typeKey] = [];
            }
            acc[typeKey].push(notification);
            return acc;
        }, {} as Record<string, Notification[]>);

        return res.status(httpStatusCode.OK).json(notifications);
    }
}

export const notificationController = new NotificationController();
