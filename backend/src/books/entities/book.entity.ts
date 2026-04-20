import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('books')
export class Book {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  code: string;

  @Column()
  title: string;

  @Column()
  author: string;

  @Column()
  category: string;

  @Column({ default: 1 })
  total_copies: number;

  @Column({ default: 1 })
  available_copies: number;

  @Column({ type: 'text', default: '' })
  description: string;

  @Column({ default: '#0F172A' })
  cover_color: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
