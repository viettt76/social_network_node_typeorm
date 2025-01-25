import { Entity, Column, Unique, ManyToOne, JoinColumn } from 'typeorm';
import { Base } from './Base';
import { User } from './User';
import { Message } from './Message';

export enum EmotionType {
    LIKE = 'LIKE',
    LOVE = 'LOVE',
    LOVE_LOVE = 'LOVE_LOVE',
    HAHA = 'HAHA',
    WOW = 'WOW',
    SAD = 'SAD',
    ANGRY = 'ANGRY',
}

@Entity({ name: 'emotion_messages' })
@Unique(['messageId', 'userId'])
export class EmotionMessage extends Base {
    @Column({ type: 'uuid' })
    messageId!: string;

    @Column({ type: 'uuid' })
    userId!: string;

    @Column({ type: 'enum', enum: EmotionType })
    emotionType!: EmotionType;

    @ManyToOne(() => User, (user) => user.emotionMessages)
    @JoinColumn({ name: 'userId', referencedColumnName: 'id' })
    user: User;

    @ManyToOne(() => Message, (message) => message.emotions)
    @JoinColumn({ name: 'messageId', referencedColumnName: 'id' })
    message: Message;
}
