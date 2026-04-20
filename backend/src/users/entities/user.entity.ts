import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Exclude } from 'class-transformer';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  roll_number: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  @Exclude() // Secondary safety net
  password_hash: string;

  @Column({
    type: 'simple-enum',
    enum: ['admin', 'user'],
    default: 'user',
  })
  role: 'admin' | 'user';

  @Column({ default: 'Mechanical Engineering' })
  department: string;

  @Column({ default: 0 })
  @Exclude() // Secondary safety net
  failed_login_attempts: number;

  @Column({ nullable: true })
  @Exclude() // Secondary safety net
  locked_until: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
