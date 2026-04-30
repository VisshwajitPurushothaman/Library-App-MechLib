import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, LessThan, IsNull } from 'typeorm';
import { Issue } from './entities/issue.entity';
import { UsersService } from '../users/users.service';
import { BooksService } from '../books/books.service';
import { IssueInDto, ExtensionRequestDto, ExtensionDecisionDto } from './dto/issue.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class IssuesService {
  constructor(
    @InjectRepository(Issue)
    private issuesRepository: Repository<Issue>,
    private usersService: UsersService,
    private booksService: BooksService,
  ) {}

  async issueBooks(data: IssueInDto) {
    const user = await this.usersService.findOneByIdentifier(data.roll_number);
    if (!user) throw new NotFoundException('The student/faculty record for this roll number does not exist.');

    const existingIssues = await this.issuesRepository.find({
      where: { roll_number: data.roll_number, status: 'issued' },
    });
    const existingBookCodes = existingIssues.map(issue => issue.book_code);
    
    const duplicates = data.book_codes.filter(code => existingBookCodes.includes(code));
    if (duplicates.length > 0) {
      console.log("Duplicate check hit");
      throw new BadRequestException(`The following books are already issued to this user and haven't been returned: ${duplicates.join(', ')}`);
    }

    const created = [];
    for (const code of data.book_codes) {
      const book = await this.booksService.findOneByCode(code);
      if (book.available_copies < 1) {
        throw new BadRequestException(`The book "${book.title}" (${code}) is currently out of stock (all copies issued).`);
      }

      const issue = this.issuesRepository.create({
        id: uuidv4(),
        user_id: user.id,
        user_name: user.name,
        roll_number: user.roll_number,
        book_id: book.id,
        book_code: book.code,
        book_title: book.title,
        issue_date: data.issue_date,
        due_date: data.due_date,
        status: 'issued',
      });

      await this.issuesRepository.save(issue);
      await this.booksService.update(book.id, { total_copies: book.total_copies }); // Triggers availability refresh logic in service if needed, but let's be explicit
      
      // Update book availability explicitly
      book.available_copies -= 1;
      await this.booksService.update(book.id, { available_copies: book.available_copies });

      created.push(issue);
    }

    return { success: true, created };
  }

  async findAll(user: any, status?: string, roll_number?: string) {
    const query = this.issuesRepository.createQueryBuilder('issue');

    if (user.role !== 'admin') {
      query.andWhere('issue.user_id = :userId', { userId: user.id });
    }

    if (status) {
      query.andWhere('issue.status = :status', { status });
    }

    if (roll_number && user.role === 'admin') {
      query.andWhere('issue.roll_number = :roll', { roll: roll_number.toUpperCase() });
    }

    query.orderBy('issue.created_at', 'DESC');
    const issues = await query.getMany();

    // Refresh overdue status
    const today = new Date().toISOString().split('T')[0];
    for (const issue of issues) {
      if (!issue.return_date && issue.due_date < today && issue.status !== 'overdue') {
        issue.status = 'overdue';
        await this.issuesRepository.update(issue.id, { status: 'overdue' });
      }
    }

    return issues;
  }

  async returnBook(issueId: string) {
    const issue = await this.issuesRepository.findOne({ where: { id: issueId } });
    if (!issue) throw new NotFoundException('The issue record for this transaction could not be located.');
    if (issue.return_date) throw new BadRequestException('This book has already been marked as returned.');

    const now = new Date().toISOString();
    await this.issuesRepository.update(issueId, {
      return_date: now,
      status: 'returned',
    });

    const book = await this.booksService.findOneById(issue.book_id);
    await this.booksService.update(book.id, { available_copies: book.available_copies + 1 });

    return { success: true, return_date: now };
  }

  async requestExtension(issueId: string, user: any, data: ExtensionRequestDto) {
    const issue = await this.issuesRepository.findOne({ where: { id: issueId } });
    if (!issue) throw new NotFoundException('The issue record for this transaction could not be located.');
    if (user.role !== 'admin' && issue.user_id !== user.id) {
      throw new BadRequestException('Access denied. This book was issued to a different account.');
    }
    if (issue.return_date) throw new BadRequestException('This book has already been returned, so an extension cannot be requested.');
    if (issue.renewed) throw new BadRequestException('This book has already been renewed once. Maximum 1 renewal allowed per issue.');

    const today = new Date().toISOString().split('T')[0];
    const daysRemaining = (new Date(issue.due_date).getTime() - new Date(today).getTime()) / (1000 * 3600 * 24);
    
    if (daysRemaining < 2) {
      throw new BadRequestException(`Must request extension at least 2 days before due (only ${Math.floor(daysRemaining)} days left)`);
    }

    const request = {
      days: data.days,
      reason: data.reason,
      requested_at: new Date().toISOString(),
      status: 'pending' as const,
      resolved_at: null,
      admin_note: '',
    };

    await this.issuesRepository.update(issueId, { extension_request: request });
    return { success: true, request };
  }

  async decideExtension(issueId: string, data: ExtensionDecisionDto) {
    const issue = await this.issuesRepository.findOne({ where: { id: issueId } });
    if (!issue || !issue.extension_request || issue.extension_request.status !== 'pending') {
      throw new BadRequestException('No pending request found');
    }

    const resolvedAt = new Date().toISOString();
    const update: any = {
      'extension_request.status': data.decision === 'approve' ? 'approved' : 'declined',
      'extension_request.resolved_at': resolvedAt,
      'extension_request.admin_note': data.admin_note,
    };

    if (data.decision === 'approve') {
      const newDueDate = new Date(issue.due_date);
      newDueDate.setDate(newDueDate.getDate() + (issue.extension_request.days || 0));
      
      update.due_date = newDueDate.toISOString().split('T')[0];
      update.renewed = true;
      update.renewed_at = resolvedAt;
      update.renewed_days = issue.extension_request.days;
      
      const today = new Date().toISOString().split('T')[0];
      update.status = update.due_date < today ? 'overdue' : 'issued';
    }

    // Since TypeORM's .update() doesn't handle nested objects in simple-json easily via string keys, we'll assign and save
    const currentRequest = { ...issue.extension_request };
    currentRequest.status = data.decision === 'approve' ? 'approved' : 'declined';
    currentRequest.resolved_at = resolvedAt;
    currentRequest.admin_note = data.admin_note;
    
    issue.extension_request = currentRequest;
    if (data.decision === 'approve') {
       const newDueDate = new Date(issue.due_date);
       newDueDate.setDate(newDueDate.getDate() + (currentRequest.days || 0));
       issue.due_date = newDueDate.toISOString().split('T')[0];
       issue.renewed = true;
       issue.renewed_at = resolvedAt;
       issue.renewed_days = currentRequest.days;
       const today = new Date().toISOString().split('T')[0];
       issue.status = issue.due_date < today ? 'overdue' : 'issued';
    }

    await this.issuesRepository.save(issue);
    return { success: true, decision: data.decision };
  }

  async getIssuesByBookId(bookId: string) {
    const issues = await this.issuesRepository.find({
      where: { book_id: bookId, return_date: IsNull() },
      order: { created_at: 'DESC' },
    });
    return issues;
  }
}
