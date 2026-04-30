import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { UsersService } from './src/users/users.service';

async function checkHash() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const usersService = app.get(UsersService);

  const identifier = '2116221101001';
  const user = await usersService.findOneByIdentifier(identifier);
  
  if (user) {
    console.log('User:', user.name);
    console.log('Hash:', user.password_hash);
  } else {
    console.log('User not found');
  }

  const admin = await usersService.findOneByIdentifier('admin@mechlib.edu');
  if (admin) {
    console.log('Admin:', admin.name);
    console.log('Hash:', admin.password_hash);
  }

  await app.close();
}

checkHash().catch(console.error);
