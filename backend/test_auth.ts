import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { AuthService } from './src/auth/auth.service';

async function testAuth() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const authService = app.get(AuthService);

  const testCases = [
    { id: 'admin@mechlib.edu', pass: 'Admin@123' },
    { id: 'ME2023001', pass: 'Student@123' },
    { id: '2116221101001', pass: 'Changeme@123' },
  ];

  for (const tc of testCases) {
    console.log(`\nTesting: ${tc.id} / ${tc.pass}`);
    const user = await authService.validateUser(tc.id, tc.pass);
    if (user) {
      console.log('✅ Success:', user.name);
    } else {
      console.log('❌ Failed');
    }
  }

  await app.close();
}

testAuth().catch(console.error);
