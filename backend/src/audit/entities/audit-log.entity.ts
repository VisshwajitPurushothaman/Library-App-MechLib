import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  action: string;

  @Column({ default: 'anonymous' })
  userId: string;

  @Column({ default: 'unknown' })
  ip: string;

  @Column({ type: 'simple-json', nullable: true })
  details: any;

  @Column({ default: true })
  success: boolean;

  @CreateDateColumn()
  timestamp: Date;
}
