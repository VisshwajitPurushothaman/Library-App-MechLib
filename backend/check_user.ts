import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { UsersService } from './src/users/users.service';
import * as bcrypt from 'bcrypt';

async function checkUser() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const usersService = app.get(UsersService);

  const ids = ['2116221101001', 'ME2023001']; 
  
  for (const identifier of ids) {
    console.log(`\nChecking: ${identifier}`);
    const user = await usersService.findOneByIdentifier(identifier);
    if (user) {
      console.log('User found:', user.name);
      const isChangeme = await bcrypt.compare('Changeme@123', user.password_hash);
      const isStudent123 = await bcrypt.compare('Student@123', user.password_hash);
      console.log('Matches "Changeme@123":', isChangeme);
      console.log('Matches "Student@123":', isStudent123);
    } else {
      console.log('User NOT found');
    }
  }

  await app.close();
}

checkUser().catch(console.error);
