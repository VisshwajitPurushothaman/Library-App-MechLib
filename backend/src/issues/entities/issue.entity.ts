import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('issues')
export class Issue {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  user_id: string;

  @Column()
  user_name: string;

  @Column()
  roll_number: string;

  @Column()
  book_id: string;

  @Column()
  book_code: string;

  @Column()
  book_title: string;

  @Column()
  issue_date: string;

  @Column()
  due_date: string;

  @Column({ nullable: true })
  return_date: string;

  @Column({
    type: 'simple-enum',
    enum: ['issued', 'returned', 'overdue'],
    default: 'issued',
  })
  status: 'issued' | 'returned' | 'overdue';

  @Column({ type: 'simple-json', nullable: true })
  extension_request: {
    days: number;
    reason: string;
    requested_at: string;
    status: 'pending' | 'approved' | 'declined';
    resolved_at: string | null;
    admin_note: string;
  };

  @Column({ default: false })
  renewed: boolean;

  @Column({ nullable: true })
  renewed_at: string;

  @Column({ nullable: true })
  renewed_days: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
