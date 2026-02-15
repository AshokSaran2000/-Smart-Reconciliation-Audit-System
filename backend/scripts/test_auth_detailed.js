const base = 'http://localhost:5000';

async function testEndpoint(method, endpoint, body) {
  try {
    const response = await fetch(`${base}${endpoint}`, {
      method,
      headers: {'Content-Type': 'application/json'},
      body: body ? JSON.stringify(body) : undefined
    });
    const data = await response.json();
    return { status: response.status, ok: response.ok, data };
  } catch (err) {
    return { error: err.message };
  }
}

async function test() {
  console.log('=== AUTH ENDPOINT DIAGNOSTIC TEST ===\n');

  // Test 1: Simple register
  console.log('TEST 1: Register new user (newuser123@test.com)');
  const testEmail = 'newuser123@test.com';
  const regResult = await testEndpoint('POST', '/api/auth/register', {
    name: 'Test User',
    email: testEmail,
    password: 'TestPassword123',
    role: 'Analyst'
  });
  console.log('Response:', JSON.stringify(regResult, null, 2));
  console.log('');

  // Test 2: Try to register same email again (should fail)
  console.log('TEST 2: Register same email again (should fail)');
  const regResult2 = await testEndpoint('POST', '/api/auth/register', {
    name: 'Test User 2',
    email: testEmail,
    password: 'DifferentPassword',
    role: 'Viewer'
  });
  console.log('Response:', JSON.stringify(regResult2, null, 2));
  console.log('');

  // Test 3: Login with correct credentials
  console.log('TEST 3: Login with registered credentials');
  const loginResult = await testEndpoint('POST', '/api/auth/login', {
    email: testEmail,
    password: 'TestPassword123'
  });
  console.log('Response:', JSON.stringify(loginResult, null, 2));
  if (loginResult.data.token) {
    console.log('✓ Login successful, token:', loginResult.data.token.substring(0, 20) + '...');
  }
  console.log('');

  // Test 4: Login with wrong password
  console.log('TEST 4: Login with wrong password (should fail)');
  const loginResult2 = await testEndpoint('POST', '/api/auth/login', {
    email: testEmail,
    password: 'WrongPassword'
  });
  console.log('Response:', JSON.stringify(loginResult2, null, 2));
  console.log('');

  // Test 5: Login with new email (auto-create)
  console.log('TEST 5: Login with non-existent email (should auto-create)');
  const autoCreateEmail = 'auto@test.com';
  const loginResult3 = await testEndpoint('POST', '/api/auth/login', {
    email: autoCreateEmail,
    password: 'AnyPassword123'
  });
  console.log('Response:', JSON.stringify(loginResult3, null, 2));
  if (loginResult3.data.token) {
    console.log('✓ Auto-create successful, token:', loginResult3.data.token.substring(0, 20) + '...');
  }
  console.log('');

  // Test 6: Login again with auto-created user
  console.log('TEST 6: Login again with auto-created user');
  const loginResult4 = await testEndpoint('POST', '/api/auth/login', {
    email: autoCreateEmail,
    password: 'AnyPassword123'
  });
  console.log('Response:', JSON.stringify(loginResult4, null, 2));
  if (loginResult4.data.token) {
    console.log('✓ Login successful');
  }

  process.exit(0);
}

setTimeout(() => {
  console.log('\n✗ Test timed out');
  process.exit(1);
}, 8000);

test();
