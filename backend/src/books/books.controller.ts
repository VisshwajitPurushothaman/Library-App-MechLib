import { Controller, Get, Post, Body, Param, Put, Delete, Query, UseGuards } from '@nestjs/common';
import { BooksService } from './books.service';
import { CreateBookDto, UpdateBookDto } from './dto/book.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('api/books')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Post()
  @Roles('admin')
  async create(@Body() createBookDto: CreateBookDto) {
    return { success: true, data: await this.booksService.create(createBookDto) };
  }

  @Get()
  async findAll(@Query('q') q?: string) {
    return { success: true, data: await this.booksService.findAll(q) };
  }

  @Get('issues/:bookCode')
  async getBookIssues(@Param('bookCode') bookCode: string) {
    const book = await this.booksService.findOneByCode(bookCode);
    const issues = await this.booksService.getIssuesByBookId(book.id);
    return { success: true, data: { book, issues } };
  }

  @Get(':code')
  async findOne(@Param('code') code: string) {
    return { success: true, data: await this.booksService.findOneByCode(code) };
  }

  @Put(':id')
  @Roles('admin')
  async update(@Param('id') id: string, @Body() updateBookDto: UpdateBookDto) {
    return { success: true, data: await this.booksService.update(id, updateBookDto) };
  }

  @Delete(':id')
  @Roles('admin')
  async remove(@Param('id') id: string) {
    return { success: true, data: await this.booksService.remove(id) };
  }
}
