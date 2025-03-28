// backend/routes/api.js (snippet)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('[api.js] Login attempt for email:', email);

    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = userResult.rows[0];
    console.log('[api.js] User found:', user);

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    console.log('[api.js] Password match:', passwordMatch);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    console.log('[api.js] Generating token...');
    const token = jwt.sign(
      { user_id: user.user_id, email: user.email, organization_id: user.organization_id },
      JWT_SECRET,
      { expiresIn: '1h' }
    );
    console.log('[api.js] Token generated:', token);

    console.log('[api.js] Setting cookie...');
    res.cookie('authToken', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'Strict',
      maxAge: 3600000,
    });
    console.log('[api.js] Cookie set');

    res.json({ message: 'Login successful' });
  } catch (error) {
    console.error('[api.js] Login error:', error.message, error.stack);
    res.status(500).json({ error: 'Login failed: ' + error.message });
  }
});