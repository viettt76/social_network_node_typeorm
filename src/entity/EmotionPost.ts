import { Entity, Column, Unique, ManyToOne, JoinColumn } from 'typeorm';
import { Base } from './Base';
import { User } from './User';
import { Post } from './Post';

export enum EmotionType {
    LIKE = 'LIKE',
    LOVE = 'LOVE',
    LOVE_LOVE = 'LOVE_LOVE',
    HAHA = 'HAHA',
    WOW = 'WOW',
    SAD = 'SAD',
    ANGRY = 'ANGRY',
}

@Entity('emotion_posts')
@Unique(['postId', 'userId'])
export class EmotionPost extends Base {
    @Column({ type: 'uuid' })
    postId!: string;

    @Column({ type: 'uuid' })
    userId!: string;

    @Column({ type: 'enum', enum: EmotionType })
    emotionType!: EmotionType;

    @ManyToOne(() => User, (user) => user.emotionPosts)
    @JoinColumn({ name: 'userId', referencedColumnName: 'id' })
    user: User;

    @ManyToOne(() => Post, (post) => post.emotions)
    @JoinColumn({ name: 'post', referencedColumnName: 'id' })
    post: Post;
}
