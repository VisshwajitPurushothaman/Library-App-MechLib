import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Book } from './src/books/entities/book.entity';
import { Repository } from 'typeorm';

async function updateColors() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const booksRepo = app.get<Repository<Book>>(getRepositoryToken(Book));
  
  // Update all books to a consistent Navy Blue color
  await booksRepo.update({}, { cover_color: '#0F172A' });
  
  console.log('Successfully updated all books to a uniform color.');
  await app.close();
}

updateColors().catch(err => {
  console.error("Error updating colors:", err);
  process.exit(1);
});
