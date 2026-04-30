import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { UsersService } from './src/users/users.service';

async function checkDuplicates() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const usersService = app.get(UsersService);

  const users = await usersService.findAll();
  const rolls = new Map<string, number>();
  const emails = new Map<string, number>();

  users.forEach(u => {
    const r = u.roll_number;
    const e = u.email;
    rolls.set(r, (rolls.get(r) || 0) + 1);
    emails.set(e, (emails.get(e) || 0) + 1);
  });

  console.log('Total users:', users.length);
  
  const dupRolls = Array.from(rolls.entries()).filter(([r, count]) => count > 1);
  const dupEmails = Array.from(emails.entries()).filter(([e, count]) => count > 1);

  console.log('Duplicate Rolls:', dupRolls);
  console.log('Duplicate Emails:', dupEmails);

  await app.close();
}

checkDuplicates().catch(console.error);
