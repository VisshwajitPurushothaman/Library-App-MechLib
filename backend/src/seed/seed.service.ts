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
    await this.seed();
  }

  async seed() {
    console.log('🌱 Seeding database...');

    // Seed Admin
    const adminEmail = this.configService.get('ADMIN_EMAIL');
    const existingAdmin = await this.usersService.findOneByIdentifier(adminEmail);
    if (!existingAdmin) {
      await this.usersService.create({
        roll_number: this.configService.get('ADMIN_ROLL'),
        name: 'Library Admin',
        email: adminEmail,
        password_hash: this.configService.get('ADMIN_PASSWORD'), // Service handles hashing
        role: 'admin',
      });
      console.log('✅ Admin user seeded');
    }

    // Seed Demo User
    const demoEmail = this.configService.get('DEMO_USER_EMAIL');
    const existingDemo = await this.usersService.findOneByIdentifier(demoEmail);
    if (!existingDemo) {
      await this.usersService.create({
        roll_number: this.configService.get('DEMO_USER_ROLL'),
        name: 'Arjun Sharma',
        email: demoEmail,
        password_hash: this.configService.get('DEMO_USER_PASSWORD'),
        role: 'user',
      });
      console.log('✅ Demo user seeded');
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
