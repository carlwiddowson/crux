document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
  
    try {
      console.log('Attempting login with:', { email });
      const response = await fetch('http://localhost:5001/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to login');
      }
  
      const result = await response.json();
      console.log('Login successful:', result);
  
      // Store user data in localStorage (or sessionStorage) for use in the dashboard
      localStorage.setItem('user', JSON.stringify(result.user));
  
      // Redirect to the Vite-served dashboard
      window.location.href = 'http://localhost:5173/'; // Updated from /dashboard/
    } catch (error) {
      console.error('Error during login:', error);
      alert('Error during login: ' + error.message);
    }
  });