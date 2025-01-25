import { Entity, Column, Index, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Base } from './Base';
import { User } from './User';
import { EmotionMessage } from './EmotionMessage';

export enum MessageType {
    TEXT = 'TEXT',
    IMAGE = 'IMAGE',
    FILE = 'FILE',
    VIDEO = 'VIDEO',
}

@Entity({ name: 'messages' })
@Index(['conversationId'])
export class Message extends Base {
    @Column({ type: 'uuid' })
    senderId!: string;

    @Column({ type: 'uuid' })
    conversationId!: string;

    @Column({ type: 'text', nullable: true })
    content?: string;

    @Column({
        type: 'enum',
        enum: MessageType,
        default: MessageType.TEXT,
    })
    messageType: MessageType;

    @Column({ default: false })
    isRead: boolean;

    @ManyToOne(() => User, (user) => user.message)
    @JoinColumn({ name: 'senderId', referencedColumnName: 'id' })
    sender: User;

    @OneToMany(() => EmotionMessage, (emotionMessage) => emotionMessage.message)
    emotions: EmotionMessage[];
}
