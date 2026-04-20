import { Module } from '@nestjs/common';
import { SeedService } from './seed.service';
import { UsersModule } from '../users/users.module';
import { BooksModule } from '../books/books.module';

@Module({
  imports: [UsersModule, BooksModule],
  providers: [SeedService],
})
export class SeedModule {}
