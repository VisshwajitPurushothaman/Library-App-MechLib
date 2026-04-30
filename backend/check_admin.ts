import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { UsersService } from './src/users/users.service';
import * as bcrypt from 'bcrypt';

async function checkAdmin() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const usersService = app.get(UsersService);

  const identifier = 'admin@mechlib.edu';
  console.log(`\nChecking: ${identifier}`);
  const user = await usersService.findOneByIdentifier(identifier);
  if (user) {
    console.log('User found:', user.name);
    console.log('Role:', user.role);
    const isMatch = await bcrypt.compare('Admin@123', user.password_hash);
    console.log('Matches "Admin@123":', isMatch);
  } else {
    console.log('User NOT found');
  }

  await app.close();
}

checkAdmin().catch(console.error);
