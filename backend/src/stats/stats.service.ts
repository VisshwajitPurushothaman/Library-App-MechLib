import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Book } from '../books/entities/book.entity';
import { Issue } from '../issues/entities/issue.entity';

@Injectable()
export class StatsService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Book)
    private booksRepository: Repository<Book>,
    @InjectRepository(Issue)
    private issuesRepository: Repository<Issue>,
  ) {}

  async getAdminStats() {
    const total_users = await this.usersRepository.count({ where: { role: 'user' } });
    const total_books = await this.booksRepository.count();
    
    const books = await this.booksRepository.find();
    const total_copies = books.reduce((sum, b) => sum + b.total_copies, 0);
    const available_copies = books.reduce((sum, b) => sum + b.available_copies, 0);
    
    const issued_books = await this.issuesRepository.count({ where: { status: 'issued' } });
    const returned_books = await this.issuesRepository.count({ where: { status: 'returned' } });
    const overdue_books = await this.issuesRepository.count({ where: { status: 'overdue' } });
    const pending_returns = issued_books + overdue_books;

    return {
      total_users,
      total_books,
      total_copies,
      available_copies,
      issued_books: pending_returns, // Frontend uses this key for currently out
      returned_books,
      pending_returns: issued_books,
      overdue_books,
    };
  }

  async getUserStats(user: any) {
    const borrowed = await this.issuesRepository.count({ 
      where: { user_id: user.id, status: 'issued' } 
    });
    const returned = await this.issuesRepository.count({ 
      where: { user_id: user.id, status: 'returned' } 
    });
    const overdue = await this.issuesRepository.count({ 
      where: { user_id: user.id, status: 'overdue' } 
    });
    
    const total_books = await this.booksRepository.count();
    const available_books = await this.booksRepository.count({ 
      where: { available_copies: MoreThan(0) as any } // Workaround for count with where
    });
    
    // In TypeORM for simple cases:
    const available_count = await this.booksRepository.createQueryBuilder('book')
      .where('book.available_copies > 0')
      .getCount();

    return {
      borrowed: borrowed + overdue,
      returned,
      overdue,
      total_books,
      available_books: available_count,
      unavailable_books: total_books - available_count,
    };
  }
}
