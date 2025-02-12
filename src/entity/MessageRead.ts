import { Entity, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { Base } from './Base';
import { Message } from './Message';

@Entity('message_reads')
@Unique(['messageId', 'userId'])
export class MessageRead extends Base {
    @Column({ type: 'uuid' })
    messageId!: string;

    @Column({ type: 'uuid' })
    userId!: string;

    @Column({ default: false })
    isRead: boolean;

    @ManyToOne(() => Message, (message) => message.reads)
    @JoinColumn({ name: 'messageId', referencedColumnName: 'id' })
    message: Message;
}
