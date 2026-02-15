const base = 'http://localhost:5000';

async function test() {
  try {
    // Test 1: Login (should auto-create user)
    console.log('Test 1: Login with any email/password (auto-create user)...');
    const login1 = await fetch(`${base}/api/auth/login`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({email: 'testuser@example.com', password: 'TestPass123'})
    });
    const result1 = await login1.json();
    if (result1.token) console.log('✓ Login succeeded, token received');
    else console.log('✗ Login failed:', result1);

    // Test 2: Register explicitly
    console.log('\nTest 2: Register with name, email, password, role...');
    const register = await fetch(`${base}/api/auth/register`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        name: 'John Analyst',
        email: 'analyst@example.com',
        password: 'AnalystPass123',
        role: 'Analyst'
      })
    });
    const regResult = await register.json();
    if (regResult.id) console.log('✓ Register succeeded, user ID:', regResult.id);
    else console.log('✗ Register failed:', regResult);

    // Test 3: Login with newly registered user
    console.log('\nTest 3: Login with newly registered user...');
    const login2 = await fetch(`${base}/api/auth/login`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({email: 'analyst@example.com', password: 'AnalystPass123'})
    });
    const result2 = await login2.json();
    if (result2.token) console.log('✓ Login succeeded with registered user');
    else console.log('✗ Login failed:', result2);
    
  } catch (err) {
    console.error('Error:', err.message);
  }
  process.exit(0);
}

setTimeout(() => {
  console.log('Test timed out, exiting...');
  process.exit(1);
}, 5000);

test();
