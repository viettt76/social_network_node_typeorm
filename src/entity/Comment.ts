import { Entity, Column, ManyToOne, JoinColumn, OneToMany, Index } from 'typeorm';
import { Base } from './Base';
import { User } from './User';
import { CommentReaction } from './CommentReaction';
import { Post } from './Post';

@Entity({ name: 'comments' })
@Index(['postId'])
@Index(['postId', 'createdAt'])
export class Comment extends Base {
    @Column({ type: 'uuid' })
    postId!: string;

    @Column({ type: 'uuid' })
    commentatorId!: string;

    @Column({ type: 'uuid', nullable: true })
    parentCommentId?: string;

    @Column({ type: 'text', nullable: true })
    content?: string;

    @Column({ nullable: true })
    picture?: string;

    @ManyToOne(() => User, (user) => user.comments, {
        onDelete: 'CASCADE',
        orphanedRowAction: 'delete',
    })
    @JoinColumn({ name: 'commentatorId', referencedColumnName: 'id' })
    commentator!: User;

    @ManyToOne(() => Comment, (comment) => comment.replies, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'parentCommentId', referencedColumnName: 'id' })
    parentComment?: Comment;

    @OneToMany(() => Comment, (comment) => comment.parentComment, {
        cascade: ['soft-remove', 'remove', 'recover'],
    })
    replies: Comment[];

    @OneToMany(() => CommentReaction, (reactionComment) => reactionComment.comment, {
        cascade: ['soft-remove', 'remove', 'recover'],
    })
    reactions: CommentReaction[];

    @ManyToOne(() => Post, (Post) => Post.comments, {
        onDelete: 'CASCADE',
    })
    post: Post;
}
