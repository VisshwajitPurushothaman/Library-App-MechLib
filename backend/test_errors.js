const http = require('http');

async function testError(identifier, password, role) {
  const data = JSON.stringify({ identifier, password, role });
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 8000,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (d) => body += d);
      res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(body) }));
    });
    req.write(data);
    req.end();
  });
}

async function run() {
  console.log('--- Testing Wrong Identifier ---');
  const res1 = await testError('nonexistent@user.com', 'pass', 'user');
  console.log(`Status: ${res1.status}`);
  console.log(`Message: ${res1.body.message}`);

  console.log('\n--- Testing Wrong Password ---');
  const res2 = await testError('admin@mechlib.edu', 'WrongPass@123', 'admin');
  console.log(`Status: ${res2.status}`);
  console.log(`Message: ${res2.body.message}`);

  console.log('\n--- Testing Role Mismatch ---');
  const res3 = await testError('admin@mechlib.edu', 'Admin@123', 'user');
  console.log(`Status: ${res3.status}`);
  console.log(`Message: ${res3.body.message}`);
}

run();
