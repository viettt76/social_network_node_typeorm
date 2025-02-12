import { Entity, Column, Index, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Base } from './Base';
import { User } from './User';
import { MessageReaction } from './MessageReaction';
import { MessageRead } from './MessageRead';

export enum MessageType {
    TEXT = 'TEXT',
    IMAGE = 'IMAGE',
    FILE = 'FILE',
    VIDEO = 'VIDEO',
}

@Entity({ name: 'messages' })
export class Message extends Base {
    @Column({ type: 'uuid' })
    senderId!: string;

    @Column({ type: 'uuid' })
    @Index()
    conversationId!: string;

    @Column({ type: 'text', nullable: true })
    content?: string;

    @Column({
        type: 'enum',
        enum: MessageType,
        default: MessageType.TEXT,
    })
    messageType: MessageType;

    @OneToMany(() => MessageRead, (messageRead) => messageRead.message)
    reads: MessageRead[];

    @ManyToOne(() => User, (user) => user.message)
    @JoinColumn({ name: 'senderId', referencedColumnName: 'id' })
    sender: User;

    @OneToMany(() => MessageReaction, (messageReaction) => messageReaction.message)
    reactions: MessageReaction[];
}
