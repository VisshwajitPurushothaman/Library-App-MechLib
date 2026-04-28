import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { BooksService } from '../books/books.service';

@Injectable()
export class SeedService implements OnModuleInit {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
    private booksService: BooksService,
  ) {}

  async onModuleInit() {
    console.log('ENABLE_SEED:', process.env.ENABLE_SEED); // Requirement #5

    if (process.env.ENABLE_SEED !== 'true') {
      console.log('Seeding skipped');
      return;
    }

    try {
      await this.seed();
    } catch (error) {
      console.error('Seed failed:', error.message);
    }
  }

  async seed() {
    console.log('🌱 Starting database seeding process...');

    const adminEmail = this.configService.get('ADMIN_EMAIL');
    const adminRoll = this.configService.get('ADMIN_ROLL');
    const adminPass = this.configService.get('ADMIN_PASSWORD');

    const demoEmail = this.configService.get('DEMO_USER_EMAIL');
    const demoRoll = this.configService.get('DEMO_USER_ROLL');
    const demoPass = this.configService.get('DEMO_USER_PASSWORD');

    const usersToSeed = [
      {
        email: adminEmail,
        roll_number: adminRoll,
        name: 'Library Admin',
        password: adminPass,
        role: 'admin' as const,
      },
      {
        email: demoEmail,
        roll_number: demoRoll,
        name: 'Arjun Sharma',
        password: demoPass,
        role: 'user' as const,
      },
    ];

    // Requirement #3: FIX SEED LOOP VALIDATION
    for (const entry of usersToSeed) {
      if (!entry || (!entry.email && !entry.roll_number)) {
        console.warn('Skipping invalid seed entry:', entry);
        continue;
      }

      const identifier = entry.email || entry.roll_number;

      if (!identifier) {
        continue;
      }

      const existing = await this.usersService.findOneByIdentifier(identifier);
      if (!existing) {
        await this.usersService.create(entry);
        console.log(`✅ User seeded: ${identifier}`);
      } else {
        console.log(`ℹ️ User already exists: ${identifier}`);
      }
    }

    // Real books are seeded via import_books.ts from the Excel file
    console.log('🌿 Seeding complete');
  }
}
