import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { UsersService } from './src/users/users.service';

function toHex(s: string) {
  return Array.from(s).map(c => c.charCodeAt(0).toString(16).padStart(2, '0')).join(' ');
}

async function checkHex() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const usersService = app.get(UsersService);

  const users = await usersService.findAll();
  const sample = users.find(u => u.roll_number.includes('2116221101001'));
  
  if (sample) {
    console.log('User found:', sample.name);
    console.log('Roll Number: [' + sample.roll_number + ']');
    console.log('Hex:', toHex(sample.roll_number));
  } else {
    console.log('User NOT found');
  }

  await app.close();
}

checkHex().catch(console.error);
