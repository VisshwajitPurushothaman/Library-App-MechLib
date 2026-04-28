const { NestFactory } = require('@nestjs/core');
const { AppModule } = require('./src/app.module');
const { UsersService } = require('./src/users/users.service');

async function checkUser() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const usersService = app.get(UsersService);

  const identifier = '2116221101001'; // First student from Excel
  const user = await usersService.findOneByIdentifier(identifier);

  if (user) {
    console.log('User found:');
    console.log('Name:', user.name);
    console.log('Roll Number:', user.roll_number);
    console.log('Email:', user.email);
    console.log('Password Hash exists:', !!user.password_hash);
    console.log('Role:', user.role);
  } else {
    console.log('User NOT found for identifier:', identifier);
  }

  await app.close();
}

checkUser().catch(console.error);
