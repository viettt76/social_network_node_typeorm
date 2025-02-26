import { Entity, Column, Index, Unique } from 'typeorm';
import { Base } from './Base';

export enum MovieType {
    MOVIE = 'MOVIE',
    TV = 'TV',
}

@Entity({ name: 'favorite_movies' })
@Unique(['userId', 'movieId'])
export class FavoriteMovie extends Base {
    @Column({ type: 'uuid' })
    @Index()
    userId!: string;

    @Column()
    movieId!: string;

    @Column()
    name!: string;

    @Column()
    slug!: string;

    @Column()
    thumbUrl!: string;

    @Column({ type: 'enum', enum: MovieType })
    type!: MovieType;
}
