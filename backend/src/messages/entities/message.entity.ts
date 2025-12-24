import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Conversation } from './conversation.entity';

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  conversationId: string;

  @ManyToOne(() => Conversation, (conversation) => conversation.messages, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'conversationId' })
  conversation: Conversation;

  @Column({ type: 'uuid' })
  senderId: string;

  @Column({ type: 'varchar', length: 255 })
  senderName: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  senderAvatar: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'boolean', default: false })
  read: boolean;

  @Column({ type: 'varchar', array: true, default: [] })
  attachments: string[];

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}


