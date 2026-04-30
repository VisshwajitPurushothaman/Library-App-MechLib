const http = require('http');

async function login() {
  const data = JSON.stringify({ identifier: 'admin@mechlib.edu', password: 'Admin@123', role: 'admin' });
  return new Promise((resolve) => {
    const options = { hostname: 'localhost', port: 8000, path: '/api/auth/login', method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': data.length } };
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (d) => body += d);
      res.on('end', () => resolve(JSON.parse(body).data.token));
    });
    req.write(data); req.end();
  });
}

async function issueBook(token, roll, code) {
  const data = JSON.stringify({ roll_number: roll, book_codes: [code], issue_date: '2026-05-01', due_date: '2026-05-15' });
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost', port: 8000, path: '/api/issues', method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': data.length, 'Authorization': `Bearer ${token}` }
    };
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (d) => body += d);
      res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(body) }));
    });
    req.write(data); req.end();
  });
}

async function run() {
  const token = await login();
  console.log('--- Issuing book first time ---');
  const res1 = await issueBook(token, 'ME2023001', '58'); // Assuming 58 exists
  console.log(`Status: ${res1.status}`);

  console.log('\n--- Issuing same book again (Duplicate check) ---');
  const res2 = await issueBook(token, 'ME2023001', '58');
  console.log(`Status: ${res2.status}`);
  console.log(`Message: ${res2.body.message}`);
}

run();
