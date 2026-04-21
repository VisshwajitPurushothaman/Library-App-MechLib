import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_INTERCEPTOR } from '@nestjs/core';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { BooksModule } from './books/books.module';
import { IssuesModule } from './issues/issues.module';
import { StatsModule } from './stats/stats.module';
import { AuditModule } from './audit/audit.module';
import { SeedModule } from './seed/seed.module';

import { AuditInterceptor } from './common/interceptors/audit.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const dbType = config.get<string>('DB_TYPE', 'sqlite');
        const isProduction = config.get<string>('NODE_ENV') === 'production';

        if (dbType === 'postgres') {
          return {
            type: 'postgres',
            host: config.get<string>('DB_HOST', 'localhost'),
            port: config.get<number>('DB_PORT', 5432),
            username: config.get<string>('DB_USER'),
            password: config.get<string>('DB_PASSWORD'),
            database: config.get<string>('DB_NAME'),
            autoLoadEntities: true,
            synchronize: !isProduction, // Never auto-sync in production!
            migrations: ['src/migrations/*.ts'],
            migrationsRun: isProduction, // Run migrations on startup in production
            logging: !isProduction,
          };
        } else {
          // SQLite
          return {
            type: 'sqlite',
            database: config.get<string>('DB_NAME', 'library.sqlite'),
            autoLoadEntities: true,
            synchronize: !isProduction,
            migrations: ['src/migrations/*.ts'],
            migrationsRun: false, // For SQLite dev, don't auto-run
            logging: !isProduction,
          };
        }
      },
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [
        {
          ttl: config.get<number>('THROTTLE_TTL', 900000),
          limit: config.get<number>('THROTTLE_LIMIT', 100),
        },
      ],
    }),
    AuthModule,
    UsersModule,
    BooksModule,
    IssuesModule,
    StatsModule,
    AuditModule,
    SeedModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditInterceptor,
    },
  ],
})
export class AppModule {}
