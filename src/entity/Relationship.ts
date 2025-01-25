import { Entity, Column, Index, Unique, ManyToOne, JoinColumn } from 'typeorm';
import { Base } from './Base';
import { User } from './User';

export enum RelationshipType {
    FRIEND = 'FRIEND',
    LOVE = 'LOVE',
    SIBLING = 'SIBLING',
    BEST_FRIEND = 'BEST_FRIEND',
}

@Entity({ name: 'relationships' })
@Unique(['user1', 'user2'])
export class Relationship extends Base {
    @Column({ type: 'uuid' })
    user1Id!: string;

    @Column({ type: 'uuid' })
    user2Id!: string;

    @Column({ type: 'enum', enum: RelationshipType, default: RelationshipType.FRIEND })
    relationshipType!: RelationshipType;

    @ManyToOne(() => User, (user) => user.relationshipAsUser1)
    @JoinColumn({ name: 'user1Id', referencedColumnName: 'id' })
    user1: User;

    @ManyToOne(() => User, (user) => user.relationshipAsUser2)
    @JoinColumn({ name: 'user2Id', referencedColumnName: 'id' })
    user2: User;
}
