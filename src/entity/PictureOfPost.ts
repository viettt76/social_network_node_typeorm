import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Base } from './Base';
import { Post } from './Post';

@Entity({ name: 'picture_of_posts' })
export class PictureOfPost extends Base {
    @Column({ type: 'uuid' })
    postId!: string;

    @Column()
    pictureUrl!: string;

    @ManyToOne(() => Post, (post) => post.pictures)
    @JoinColumn({ name: 'postId', referencedColumnName: 'id' })
    post: Post;
}
