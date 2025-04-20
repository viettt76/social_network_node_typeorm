import { Entity, Column, Index } from 'typeorm';
import { Base } from './Base';

@Entity({ name: 'bookmark_posts' })
export class BookmarkPost extends Base {
    @Column({ type: 'uuid' })
    postId!: string;

    @Column({ type: 'uuid' })
    @Index()
    userId!: string;
}
