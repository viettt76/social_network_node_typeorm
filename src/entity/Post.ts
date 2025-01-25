import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Base } from './Base';
import { User } from './User';
import { Comment } from './Comment';
import { EmotionPost } from './EmotionPost';
import { PictureOfPost } from './PictureOfPost';

export enum PostVisibility {
    FRIEND = 'FRIEND',
    PUBLIC = 'PUBLIC',
    PRIVATE = 'PRIVATE',
}

@Entity({ name: 'posts' })
export class Post extends Base {
    @Column({ type: 'uuid' })
    posterId!: string;

    @Column({ type: 'enum', enum: PostVisibility, default: PostVisibility.FRIEND })
    visibilityType!: PostVisibility;

    @Column({ type: 'text', nullable: true })
    content?: string;

    @Column({ default: false })
    isApproved!: boolean;

    @Column({ default: false })
    isInvalid!: boolean;

    @ManyToOne(() => User, (user) => user.posts)
    @JoinColumn({ name: 'posterId', referencedColumnName: 'id' })
    poster: User;

    @OneToMany(() => Comment, (comment) => comment.post)
    comments: Comment[];

    @OneToMany(() => EmotionPost, (emotionPost) => emotionPost.post)
    emotions: EmotionPost[];

    @OneToMany(() => PictureOfPost, (pictureOfPost) => pictureOfPost.post)
    pictures: PictureOfPost[];
}
