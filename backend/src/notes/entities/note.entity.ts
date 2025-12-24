import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { User } from '../../users/entities/user.entity';

export enum NoteColor {
  YELLOW = 'yellow',
  BLUE = 'blue',
  GREEN = 'green',
  PINK = 'pink',
}

@Entity('notes')
export class Note extends BaseEntity {
  @Column({ type: 'text' })
  content: string;

  @Column({
    type: 'varchar',
    length: 20,
    default: NoteColor.YELLOW,
  })
  color: NoteColor;

  @Column({ type: 'float', default: 0 })
  rotation: number;

  @Column({ type: 'uuid', nullable: true })
  userId: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'userId' })
  user?: User;
}


