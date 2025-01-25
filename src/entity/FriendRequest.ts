import { Entity, Column, Unique, ManyToOne, JoinColumn } from 'typeorm';
import { Base } from './Base';
import { User } from './User';

@Entity({ name: 'friend_requests' })
@Unique(['senderId', 'receiverId'])
export class FriendRequest extends Base {
    @Column({ type: 'uuid' })
    senderId!: string;

    @Column({ type: 'uuid' })
    receiverId!: string;

    @ManyToOne(() => User, (user) => user.friendRequestAsSender)
    @JoinColumn({ name: 'senderId', referencedColumnName: 'id' })
    sender: User;

    @ManyToOne(() => User, (user) => user.friendRequestAsReceiver)
    @JoinColumn({ name: 'receiverId', referencedColumnName: 'id' })
    receiver: User;
}
