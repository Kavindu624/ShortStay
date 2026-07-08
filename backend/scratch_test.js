async function test() {
  try {
    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@shortstay.com', password: 'password123' })
    });
    const loginData = await loginRes.json();
    console.log('Login Response:', loginData);

    if (!loginData.token) return;

    const res = await fetch('http://localhost:5000/api/profile/8', {
      headers: { Authorization: `Bearer ${loginData.token}` }
    });
    const data = await res.json();
    console.log('Profile:', data);
  } catch (err) {
    console.error('Error:', err);
  }
}
test();
