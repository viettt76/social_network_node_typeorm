import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Base } from './Base';
import { Post } from './Post';

@Entity({ name: 'image_of_posts' })
export class ImageOfPost extends Base {
    @Column({ type: 'uuid' })
    postId!: string;

    @Column()
    imageUrl!: string;

    @ManyToOne(() => Post, (post) => post.images)
    @JoinColumn({ name: 'postId', referencedColumnName: 'id' })
    post: Post;
}
