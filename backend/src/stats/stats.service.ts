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
    
    const allIssues = await this.issuesRepository.find();
    
    let issued_books = 0;
    let returned_books = 0;
    let overdue_books = 0;
    
    const bookCounts: Record<string, number> = {};
    
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const trendsMap: Record<string, { issued: number, returned: number }> = {};
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      trendsMap[months[d.getMonth()]] = { issued: 0, returned: 0 };
    }

    for (const issue of allIssues) {
      if (issue.status === 'issued') issued_books++;
      if (issue.status === 'returned') returned_books++;
      if (issue.status === 'overdue') overdue_books++;
      
      const title = issue.book_title || issue.book_code;
      const shortTitle = title.length > 15 ? title.substring(0, 15) + '...' : title;
      bookCounts[shortTitle] = (bookCounts[shortTitle] || 0) + 1;
      
      if (issue.issue_date) {
        const m = months[new Date(issue.issue_date).getMonth()];
        if (trendsMap[m]) trendsMap[m].issued++;
      }
      if (issue.return_date) {
        const m = months[new Date(issue.return_date).getMonth()];
        if (trendsMap[m]) trendsMap[m].returned++;
      }
    }
    
    const popular_books = Object.entries(bookCounts)
      .map(([name, borrows]) => ({ name, borrows }))
      .sort((a, b) => b.borrows - a.borrows)
      .slice(0, 6);
      
    const trends = Object.keys(trendsMap).map(m => ({
      m, issued: trendsMap[m].issued, returned: trendsMap[m].returned
    }));

    return {
      total_users, total_books, total_copies, available_copies,
      issued_books: issued_books + overdue_books, // pending returns
      returned_books, pending_returns: issued_books, overdue_books,
      popular_books, trends
    };
  }

  async getReportStats() {
    const allIssues = await this.issuesRepository.find();
    const allBooks = await this.booksRepository.find();
    const allUsers = await this.usersRepository.count({ where: { role: 'user' } });
    
    let totalDays = 0, returnedCount = 0;
    const dayCounts = [0, 0, 0, 0, 0, 0, 0];
    const usersWithActive = new Set();
    const catCounts: Record<string, number> = {};
    const bookCatMap: Record<string, string> = {};
    
    for (const b of allBooks) bookCatMap[b.id] = b.category || 'Others';
    
    const weeklyTrend = [];
    const msInWeek = 7 * 24 * 3600 * 1000;
    for (let i = 7; i >= 0; i--) {
      weeklyTrend.push({ m: `W${8-i}`, count: 0, startMs: Date.now() - (i+1)*msInWeek, endMs: Date.now() - i*msInWeek });
    }
    
    const bookCounts: Record<string, number> = {};

    for (const issue of allIssues) {
      if (issue.return_date && issue.issue_date) {
        const diff = (new Date(issue.return_date).getTime() - new Date(issue.issue_date).getTime()) / (1000 * 3600 * 24);
        if (diff >= 0) { totalDays += diff; returnedCount++; }
      }
      if (issue.issue_date) {
        const ms = new Date(issue.issue_date).getTime();
        dayCounts[new Date(ms).getDay()]++;
        for (const w of weeklyTrend) {
          if (ms >= w.startMs && ms < w.endMs) { w.count++; break; }
        }
      }
      if (issue.status !== 'returned') usersWithActive.add(issue.user_id);
      
      const cat = bookCatMap[issue.book_id] || 'Others';
      catCounts[cat] = (catCounts[cat] || 0) + 1;
      
      const title = issue.book_title || issue.book_code;
      const short = title.length > 12 ? title.substring(0, 12) + '..' : title;
      bookCounts[short] = (bookCounts[short] || 0) + 1;
    }
    
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const maxDay = dayCounts.indexOf(Math.max(...dayCounts));
    const activePct = allUsers > 0 ? Math.round((usersWithActive.size / allUsers) * 100) : 0;
    
    const category_share = Object.entries(catCounts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
    const top_books = Object.entries(bookCounts).map(([n, c]) => ({ n, c })).sort((a, b) => b.c - a.c).slice(0, 7);

    return {
      avg_borrow_time: returnedCount > 0 ? `${(totalDays / returnedCount).toFixed(1)} days` : '0 days',
      peak_day: dayCounts[maxDay] > 0 ? daysOfWeek[maxDay] : 'None',
      active_readers: `${activePct}%`,
      top_category: category_share.length > 0 ? category_share[0].name : 'None',
      category_share,
      weekly_trend: weeklyTrend.map(w => ({ m: w.m, count: w.count })),
      top_books
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
