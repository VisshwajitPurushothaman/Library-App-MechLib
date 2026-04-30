import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { UsersService } from './src/users/users.service';

async function listUsers() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const usersService = app.get(UsersService);

  const users = await usersService.findAll();
  console.log('Total users:', users.length);
  
  const admins = users.filter(u => u.role === 'admin');
  console.log('Admins:', admins.map(u => ({ name: u.name, email: u.email, roll: u.roll_number })));

  const firstFew = users.slice(0, 5);
  console.log('Sample Users:', firstFew.map(u => ({ name: u.name, email: u.email, roll: u.roll_number, role: u.role })));

  await app.close();
}

listUsers().catch(console.error);
