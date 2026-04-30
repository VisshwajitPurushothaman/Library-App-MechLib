import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { UsersService } from './src/users/users.service';

async function checkExact() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const usersService = app.get(UsersService);

  const users = await usersService.findAll();
  const sample = users.find(u => u.roll_number === '2116221101001');
  
  if (sample) {
    console.log('User found:', sample.name);
    console.log('Roll Number: [' + sample.roll_number + '] Length:', sample.roll_number.length);
    console.log('Email: [' + sample.email + '] Length:', sample.email.length);
    console.log('Role: [' + sample.role + ']');
  } else {
    console.log('User NOT found');
  }

  const admin = users.find(u => u.role === 'admin');
  if (admin) {
    console.log('\nAdmin found:', admin.name);
    console.log('Roll Number: [' + admin.roll_number + '] Length:', admin.roll_number.length);
    console.log('Email: [' + admin.email + '] Length:', admin.email.length);
    console.log('Role: [' + admin.role + ']');
  }

  await app.close();
}

checkExact().catch(console.error);
