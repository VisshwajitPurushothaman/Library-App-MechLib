import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StatsService } from './stats.service';
import { StatsController } from './stats.controller';
import { UsersModule } from '../users/users.module';
import { BooksModule } from '../books/books.module';
import { IssuesModule } from '../issues/issues.module';
import { User } from '../users/entities/user.entity';
import { Book } from '../books/entities/book.entity';
import { Issue } from '../issues/entities/issue.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Book, Issue]),
    UsersModule,
    BooksModule,
    IssuesModule,
  ],
  controllers: [StatsController],
  providers: [StatsService],
})
export class StatsModule {}
