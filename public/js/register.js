document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault();
  
    // Collect form data
    const company = document.getElementById('company').value;
    const buyerType = parseInt(document.getElementById('buyer-type').value);
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const firstName = document.getElementById('first-name').value;
    const lastName = document.getElementById('last-name').value;
    const position = document.getElementById('position').value;
    const phone = document.getElementById('phone').value;
  
    // Validate password strength
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      alert('Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.');
      return;
    }
  
    // Extract email domain
    const emailDomain = email.split('@')[1];
    if (!emailDomain) {
      alert('Please enter a valid email address.');
      return;
    }
  
    // Prepare registration data
    const registrationData = {
      organization: {
        name: company,
        buyer_type: buyerType,
        email: email,
      },
      user: {
        email: email,
        password: password,
        first_name: firstName,
        last_name: lastName,
        position: position,
        phone: phone,
        user_active: true,
      },
      emailDomain: emailDomain,
    };
  
    try {
      // Send registration data to the backend
      console.log('Sending registration data:', registrationData);
      const response = await fetch('http://localhost:5001/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registrationData),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to register');
      }
  
      const result = await response.json();
      console.log('Registration successful:', result);
      alert('Registration successful! Please log in.');
      window.location.href = 'index.html';
    } catch (error) {
      console.error('Error during registration:', error);
      alert('Error during registration: ' + error.message);
    }
  });
  
  // Add "Show Password" functionality
  document.getElementById('show-password').addEventListener('change', (e) => {
    const passwordInput = document.getElementById('password');
    if (e.target.checked) {
      passwordInput.type = 'text';
    } else {
      passwordInput.type = 'password';
    }
  });