import { httpStatusCode } from '@/constants/httpStatusCode';
import relationshipResponse from '@/constants/relationshipResponse';
import { IoRequest } from '@/custom';
import { NotificationType } from '@/entity/Notification';
import { notificationService } from '@/services/notificationService';
import { relationshipService } from '@/services/relationshipService';
import { userService } from '@/services/userService';
import ApiError from '@/utils/ApiError';
import { Request, Response } from 'express';
import { JwtPayload } from 'jsonwebtoken';

class RelationshipController {
    // [GET] /relationships/suggestions
    async getSuggestions(req: Request, res: Response): Promise<any> {
        const { id } = req.userToken as JwtPayload;
        const { page } = req.query;
        const suggestions = await relationshipService.getSuggestions({ userId: id, page: Number(page) });

        return res.status(httpStatusCode.OK).json(suggestions);
    }

    // [POST] /relationships/friend-requests
    async sendFriendRequest(req: Request, res: Response): Promise<any> {
        const { id, firstName, lastName } = req.userToken as JwtPayload;
        const { receiverId } = req.body;
        const { io } = req as IoRequest;

        const friendRequest = await relationshipService.getFriendRequestByUserId({ userId: id, receiverId });
        if (!!friendRequest) {
            throw new ApiError(
                relationshipResponse.FRIEND_REQUEST_EXISTS.status,
                relationshipResponse.FRIEND_REQUEST_EXISTS.message,
            );
        }

        await relationshipService.createFriendRequest({ userId: id, receiverId });
        const newFriendRequestNotification = await notificationService.createNotification({
            userId: receiverId,
            actorId: id,
            type: NotificationType.FRIEND_REQUEST,
            referenceId: id,
            content: `<b>${lastName} ${firstName}</b> đã gửi lời mời kết bạn cho bạn`,
        });
        io.to(`user-${receiverId}`).emit('newFriendRequestNotification', {
            friendRequestId: newFriendRequestNotification.id,
            senderId: newFriendRequestNotification.referenceId,
            content: newFriendRequestNotification.content,
            createdAt: newFriendRequestNotification.createdAt,
        });

        return res.status(httpStatusCode.CREATED).json();
    }

    // [GET] /relationships/friend-requests
    async getFriendRequests(req: Request, res: Response): Promise<any> {
        const { id } = req.userToken as JwtPayload;
        const { page } = req.query;

        const friendRequests = await relationshipService.getFriendRequests({ receiverId: id, page: Number(page) });

        return res.status(httpStatusCode.OK).json(friendRequests);
    }

    // [GET] /relationships/friend-requests/count
    async getFriendRequestCount(req: Request, res: Response): Promise<any> {
        const { id } = req.userToken as JwtPayload;

        const friendRequestCount = await relationshipService.getFriendRequestCount(id);

        return res.status(httpStatusCode.OK).json(friendRequestCount);
    }

    // [GET] /relationships/sent-requests
    async getSentFriendRequests(req: Request, res: Response): Promise<any> {
        const { id } = req.userToken as JwtPayload;
        const { page } = req.query;

        const sentRequests = await relationshipService.getSentFriendRequests({ senderId: id, page: Number(page) });

        return res.status(httpStatusCode.OK).json(sentRequests);
    }

    // [POST] /relationships/friend-requests/:friendRequestId/acceptance
    async acceptFriendRequest(req: Request, res: Response): Promise<any> {
        const { id } = req.userToken as JwtPayload;
        const { friendRequestId } = req.params;
        const { senderId } = req.body;

        const friendRequest = await relationshipService.getFriendRequestById(friendRequestId);

        if (!friendRequest) {
            const sender = await userService.findUserById(senderId);
            return res.status(relationshipResponse.FRIEND_REQUEST_NOT_FOUND.status).json({
                message: relationshipResponse.FRIEND_REQUEST_NOT_FOUND.message.replace(
                    '{name}',
                    `${sender?.lastName} ${sender?.firstName}`,
                ),
            });
        }

        await relationshipService.addFriend({
            userId: id,
            senderId,
            friendRequestId,
        });
        return res.status(httpStatusCode.CREATED).json();
    }

    // [DELETE] /relationships/friend-requests/:friendRequestId
    async deleteFriendRequest(req: Request, res: Response): Promise<any> {
        const { friendRequestId } = req.params;

        const friendRequest = await relationshipService.getFriendRequestById(friendRequestId);

        if (!friendRequest) {
            return res.status(relationshipResponse.ALREADY_FRIENDS.status).json({
                message: relationshipResponse.ALREADY_FRIENDS.message,
            });
        }

        await relationshipService.deleteFriendRequest(friendRequestId);

        return res.status(httpStatusCode.NO_CONTENT).json();
    }

    // [GET] /relationships/friends
    async getFriends(req: Request, res: Response): Promise<any> {
        const { id } = req.userToken as JwtPayload;

        const friends = await relationshipService.getFriends(id);

        return res.status(httpStatusCode.OK).json(friends);
    }

    // [DELETE] /relationships/:friendId
    async unfriend(req: Request, res: Response): Promise<any> {
        const { id } = req.userToken as JwtPayload;
        const { friendId } = req.params;

        await relationshipService.unfriend({ userId: id, friendId });

        return res.status(httpStatusCode.NO_CONTENT).json();
    }
}

export const relationshipController = new RelationshipController();
