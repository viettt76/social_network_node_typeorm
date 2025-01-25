import { Entity, Column, OneToMany, OneToOne, Index } from 'typeorm';
import { Base } from './Base';
import { ConversationParticipant } from './ConversationParticipant';
import { Comment } from './Comment';
import { ConversationHistory } from './ConversationHistory';
import { EmotionComment } from './EmotionComment';
import { EmotionMessage } from './EmotionMessage';
import { EmotionPost } from './EmotionPost';
import { FriendRequest } from './FriendRequest';
import { Message } from './Message';
import { Notification } from './Notification';
import { Post } from './Post';
import { Relationship } from './Relationship';

export enum Gender {
    MALE = 'MALE',
    FEMALE = 'FEMALE',
    OTHER = 'OTHER',
}

export enum Role {
    USER = 'USER',
    ADMIN = 'ADMIN',
}

@Entity({ name: 'users' })
export class User extends Base {
    @Column()
    firstName!: string;

    @Column()
    lastName!: string;

    @Column({ unique: true })
    username!: string;

    @Column()
    password!: string;

    @Column({ nullable: true })
    birthday?: Date;

    @Column({ type: 'enum', enum: Gender })
    gender!: Gender;

    @Column({ nullable: true })
    homeTown?: string;

    @Column({ nullable: true })
    school?: string;

    @Column({ nullable: true })
    workplace?: string;

    @Column({ nullable: true })
    avatar?: string;

    @Column({ default: false })
    isPrivate!: boolean;

    @Column({ type: 'enum', enum: Role, default: Role.USER })
    role!: Role;

    @OneToMany(() => Comment, (comment) => comment.commentator, {
        cascade: ['soft-remove', 'recover', 'remove'],
    })
    comments: Comment[];

    @OneToMany(() => ConversationHistory, (conversationHistory) => conversationHistory.user, {
        cascade: ['soft-remove', 'recover', 'remove'],
    })
    conversationHistory: ConversationHistory[];

    @OneToMany(() => ConversationParticipant, (conversationParticipant) => conversationParticipant.user, {
        cascade: ['soft-remove', 'recover', 'remove'],
    })
    conversationParticipant: ConversationParticipant[];

    @OneToMany(() => EmotionComment, (emotionComment) => emotionComment.user, {
        cascade: ['soft-remove', 'recover', 'remove'],
    })
    emotionComments: EmotionComment[];

    @OneToMany(() => EmotionMessage, (emotionMessage) => emotionMessage.user, {
        cascade: ['soft-remove', 'recover', 'remove'],
    })
    emotionMessages: EmotionMessage[];

    @OneToMany(() => EmotionPost, (emotionPost) => emotionPost.user, {
        cascade: ['soft-remove', 'recover', 'remove'],
    })
    emotionPosts: EmotionPost[];

    @OneToMany(() => FriendRequest, (friendRequest) => friendRequest.sender, {
        cascade: ['soft-remove', 'recover', 'remove'],
    })
    friendRequestAsSender: FriendRequest[];

    @OneToMany(() => FriendRequest, (friendRequest) => friendRequest.receiver, {
        cascade: ['soft-remove', 'recover', 'remove'],
    })
    friendRequestAsReceiver: FriendRequest[];

    @OneToMany(() => Message, (message) => message.sender, {
        cascade: ['soft-remove', 'recover', 'remove'],
    })
    message: Message[];

    @OneToMany(() => Notification, (notification) => notification.user, {
        cascade: ['soft-remove', 'recover', 'remove'],
    })
    notifications: Notification[];

    @OneToMany(() => Post, (post) => post.poster, {
        cascade: ['soft-remove', 'recover', 'remove'],
    })
    posts: Post[];

    @OneToMany(() => Relationship, (relationship) => relationship.user1, {
        cascade: ['soft-remove', 'recover', 'remove'],
    })
    relationshipAsUser1: Relationship[];

    @OneToMany(() => Relationship, (relationship) => relationship.user2, {
        cascade: ['soft-remove', 'recover', 'remove'],
    })
    relationshipAsUser2: Relationship[];
}
