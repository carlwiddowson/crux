document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
  
    // Placeholder: In a real app, you'd authenticate with the backend
    console.log('Login attempt:', { email, password });
  
    // Redirect to dashboard (for now, assuming login is successful)
    window.location.href = '/dashboard.html';
  });