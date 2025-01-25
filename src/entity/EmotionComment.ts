import { Entity, Column, Unique, ManyToOne, JoinColumn } from 'typeorm';
import { Base } from './Base';
import { User } from './User';
import { Comment } from './Comment';

export enum EmotionType {
    LIKE = 'LIKE',
    LOVE = 'LOVE',
    LOVE_LOVE = 'LOVE_LOVE',
    HAHA = 'HAHA',
    WOW = 'WOW',
    SAD = 'SAD',
    ANGRY = 'ANGRY',
}

@Entity('emotion_comments')
@Unique(['commentId', 'userId'])
export class EmotionComment extends Base {
    @Column({ type: 'uuid' })
    commentId!: string;

    @Column({ type: 'uuid' })
    userId!: string;

    @Column({ type: 'enum', enum: EmotionType })
    emotionType!: EmotionType;

    @ManyToOne(() => User, (user) => user.emotionComments)
    @JoinColumn({ name: 'userId', referencedColumnName: 'id' })
    user: User;

    @ManyToOne(() => Comment, (comment) => comment.emotions)
    @JoinColumn({ name: 'commentId', referencedColumnName: 'id' })
    comment: Comment;
}
