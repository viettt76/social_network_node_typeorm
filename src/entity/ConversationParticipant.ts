import { Entity, Column, ManyToOne, JoinColumn, OneToOne, Unique } from 'typeorm';
import { Base } from './Base';
import { Conversation } from './Conversation';
import { User } from './User';

export enum Role {
    MEMBER = 'MEMBER',
    ADMIN = 'ADMIN',
}

@Entity({ name: 'conversation_participants' })
@Unique(['userId', 'conversationId'])
export class ConversationParticipant extends Base {
    @Column({ type: 'uuid' })
    userId!: string;

    @Column({ type: 'uuid' })
    conversationId!: string;

    @Column({ nullable: true })
    nickname?: string;

    @Column({ type: 'enum', enum: Role, default: Role.MEMBER })
    role!: Role;

    @ManyToOne(() => Conversation, (conversation) => conversation.conversationParticipants)
    @JoinColumn({name: 'conversationId', referencedColumnName: 'id'})
    conversation: Conversation;

    @ManyToOne(() => User, (user) => user.conversationParticipant)
    @JoinColumn({name: 'userId', referencedColumnName: 'id'})
    user: User;
}
