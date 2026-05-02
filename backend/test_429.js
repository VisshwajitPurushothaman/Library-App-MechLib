async function test() {
  try {
    console.log(`Sending request with invalid user...`);
    const res = await fetch('http://localhost:8000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:3000'
      },
      body: JSON.stringify({
        identifier: 'visshwajil.pr.2025.mech@rajalakshmi.edu.in',
        password: 'wrong',
        role: 'user'
      })
    });
    console.log(`Status: ${res.status}`);
    console.log(`CORS Headers present: ${res.headers.has('access-control-allow-origin')}`);
  } catch (err) {
    console.log(`Fetch Error: ${err.message}`);
  }
}

test();
