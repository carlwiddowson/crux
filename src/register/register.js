// src/register/register.js
document.getElementById('register-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const company = document.getElementById('company').value;
  const buyerType = parseInt(document.getElementById('buyer-type').value);
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const firstName = document.getElementById('first-name').value;
  const lastName = document.getElementById('last-name').value;
  const position = document.getElementById('position').value;
  const phone = document.getElementById('phone').value;

  const registrationData = {
    organization: { name: company, buyer_type: buyerType, email },
    user: { email, password, first_name: firstName, last_name: lastName, position, phone, user_active: true },
    emailDomain: email.split('@')[1],
  };

  try {
    const response = await fetch('http://localhost:5001/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(registrationData),
    });

    if (!response.ok) throw new Error('Registration failed');
    alert('Registration successful! Please log in.');
    window.history.pushState({}, '', '/login');
    loadPage('login');
  } catch (error) {
    alert('Registration failed: ' + error.message);
  }
});