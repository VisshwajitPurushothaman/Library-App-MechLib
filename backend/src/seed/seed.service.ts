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

    // Seed Books
    const books = [
      { code: 'ME101', title: 'Engineering Mechanics', author: 'R.C. Hibbeler', category: 'Mechanics', total_copies: 5, cover_color: '#1E40AF' },
      { code: 'ME102', title: 'Thermodynamics: An Engineering Approach', author: 'Yunus Cengel', category: 'Thermodynamics', total_copies: 4, cover_color: '#B45309' },
      { code: 'ME103', title: 'Fluid Mechanics', author: 'Frank M. White', category: 'Fluids', total_copies: 3, cover_color: '#047857' },
      { code: 'ME104', title: 'Heat Transfer', author: 'J.P. Holman', category: 'Heat', total_copies: 3, cover_color: '#B91C1C' },
      { code: 'ME105', title: 'Strength of Materials', author: 'F.L. Singer', category: 'Mechanics', total_copies: 4, cover_color: '#6D28D9' },
      { code: 'ME106', title: 'Theory of Machines', author: 'R.S. Khurmi', category: 'Design', total_copies: 6, cover_color: '#0F766E' },
      { code: 'ME107', title: 'Machine Design', author: 'Shigley', category: 'Design', total_copies: 5, cover_color: '#9333EA' },
      { code: 'ME108', title: 'Manufacturing Processes', author: 'P.N. Rao', category: 'Manufacturing', total_copies: 4, cover_color: '#EA580C' },
      { code: 'ME109', title: 'Internal Combustion Engines', author: 'V. Ganesan', category: 'Engines', total_copies: 3, cover_color: '#0369A1' },
      { code: 'ME110', title: 'Refrigeration & Air Conditioning', author: 'C.P. Arora', category: 'HVAC', total_copies: 3, cover_color: '#0E7490' },
      { code: 'ME111', title: 'Metrology & Measurements', author: 'Bewoor & Kulkarni', category: 'Metrology', total_copies: 2, cover_color: '#7C2D12' },
      { code: 'ME112', title: 'CAD/CAM', author: 'M.P. Groover', category: 'Design', total_copies: 3, cover_color: '#4338CA' },
      { code: 'ME113', title: 'Finite Element Analysis', author: 'S.S. Rao', category: 'Analysis', total_copies: 4, cover_color: '#BE185D' },
      { code: 'ME114', title: 'Industrial Engineering', author: 'O.P. Khanna', category: 'Management', total_copies: 3, cover_color: '#166534' },
      { code: 'ME115', title: 'Robotics & Automation', author: 'Saeed Niku', category: 'Automation', total_copies: 2, cover_color: '#1D4ED8' },
      { code: 'ME116', title: 'Vibrations', author: 'S.S. Rao', category: 'Analysis', total_copies: 3, cover_color: '#A16207' },
      { code: 'ME117', title: 'Automobile Engineering', author: 'Kirpal Singh', category: 'Automotive', total_copies: 4, cover_color: '#B91C1C' },
      { code: 'ME118', title: 'Power Plant Engineering', author: 'P.K. Nag', category: 'Energy', total_copies: 3, cover_color: '#065F46' },
      { code: 'ME119', title: 'Mechatronics', author: 'W. Bolton', category: 'Automation', total_copies: 2, cover_color: '#7E22CE' },
      { code: 'ME120', title: 'Engineering Drawing', author: 'N.D. Bhatt', category: 'Drafting', total_copies: 6, cover_color: '#0F172A' },
    ];

    for (const b of books) {
      const existing = await this.booksService.findAll(b.code);
      if (existing.length === 0) {
        await this.booksService.create(b);
        console.log(`✅ Book ${b.code} seeded`);
      }
    }

    console.log('🌿 Seeding complete');
  }
}
