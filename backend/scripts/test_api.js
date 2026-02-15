const base = process.env.BASE_URL || 'http://localhost:5000';

async function run(){
  try{
    console.log('Logging in as admin...');
    const loginRes = await fetch(`${base}/api/auth/login`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@example.com', password: 'Admin123!' })
    });
    if(!loginRes.ok) throw new Error('Login failed: ' + loginRes.status);
    const login = await loginRes.json();
    const token = login.token;
    console.log('Token received:', token ? 'yes' : 'no');

    const headers = { 'Authorization': `Bearer ${token}` };

    console.log('\nFetching /api/dashboard/summary');
    const summaryRes = await fetch(`${base}/api/dashboard/summary`, { headers });
    const summary = summaryRes.ok ? await summaryRes.json() : { error: summaryRes.status };
    console.log(JSON.stringify(summary, null, 2));

    console.log('\nFetching /api/dashboard/recent');
    const recentRes = await fetch(`${base}/api/dashboard/recent?limit=5`, { headers });
    const recent = recentRes.ok ? await recentRes.json() : { error: recentRes.status };
    console.log(JSON.stringify(recent, null, 2));
  }catch(e){
    console.error('Error during API test:', e.message);
    process.exit(1);
  }
}

run();
