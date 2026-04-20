import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Book } from './entities/book.entity';

@Injectable()
export class BooksService {
  constructor(
    @InjectRepository(Book)
    private booksRepository: Repository<Book>,
  ) {}

  async create(bookData: Partial<Book>) {
    const existing = await this.booksRepository.findOne({ where: { code: bookData.code?.toUpperCase() } });
    if (existing) {
      throw new ConflictException('Book code already exists');
    }
    const book = this.booksRepository.create({
      ...bookData,
      code: bookData.code?.toUpperCase(),
      available_copies: bookData.total_copies,
    });
    return this.booksRepository.save(book);
  }

  async findAll(q?: string) {
    if (q) {
      return this.booksRepository.find({
        where: [
          { title: Like(`%${q}%`) },
          { author: Like(`%${q}%`) },
          { code: Like(`%${q}%`) },
          { category: Like(`%${q}%`) },
        ],
        order: { title: 'ASC' },
      });
    }
    return this.booksRepository.find({ order: { title: 'ASC' } });
  }

  async findOneByCode(code: string) {
    const book = await this.booksRepository.findOne({ where: { code: code.toUpperCase() } });
    if (!book) throw new NotFoundException('Book not found');
    return book;
  }

  async findOneById(id: string) {
    const book = await this.booksRepository.findOne({ where: { id } });
    if (!book) throw new NotFoundException('Book not found');
    return book;
  }

  async update(id: string, updateData: Partial<Book>) {
    const book = await this.findOneById(id);
    const issuedCount = book.total_copies - book.available_copies;
    
    if (updateData.total_copies !== undefined) {
      const newAvailable = Math.max(0, updateData.total_copies - issuedCount);
      updateData.available_copies = newAvailable;
    }

    if (updateData.code) {
      updateData.code = updateData.code.toUpperCase();
    }

    await this.booksRepository.update(id, updateData);
    return this.findOneById(id);
  }

  async remove(id: string) {
    const result = await this.booksRepository.delete(id);
    return { deleted: result.affected };
  }
}
