import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Base } from './Base';
import { User } from './User';

export enum NotificationType {
    LIKE = 'LIKE',
    COMMENT = 'COMMENT',
    CONVERSATIOIN = 'CONVERSATIOIN',
    FRIEND_REQUEST = 'FRIEND_REQUEST',
}

export enum referenceType {
    POST = 'POST',
    USER = 'USER',
    CONVERSATIOIN = 'CONVERSATIOIN',
    COMMENT = 'COMMENT',
}

@Entity({ name: 'notifications' })
export class Notification extends Base {
    @Column({ type: 'uuid' })
    userId!: string;

    @Column({ type: 'enum', enum: NotificationType })
    type!: NotificationType;

    @Column({ type: 'uuid' })
    referenceId!: string;

    @Column({ type: 'enum', enum: referenceType })
    referenceType!: referenceType;

    @Column()
    content: string;

    @Column({ default: false })
    isRead!: boolean;

    @Column({ default: false })
    isOpenMenu!: boolean;

    @ManyToOne(() => User, (user) => user.notifications)
    @JoinColumn({ name: 'userId', referencedColumnName: 'id' })
    user: User;
}
