const express = require('express');
const router = express.Router();
const User = require('../../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

router.post('/register', async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    if (!email || !password || !name) {
      return res.status(400).json({ message: 'Name, email, and password required' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'User exists' });
    }

    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ 
      name, 
      email, 
      password: hash, 
      role: role || 'Viewer' 
    });
    
    console.log(`[AUTH] User registered: ${email} (${role || 'Viewer'})`);
    res.json({ id: user._id });
  } catch (err) {
    console.error('[AUTH] Register error:', err.message);
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }

    let user = await User.findOne({ email });
    
    // If user doesn't exist, create with default role "Viewer"
    if (!user) {
      try {
        const hash = await bcrypt.hash(password, 10);
        user = await User.create({ 
          name: email.split('@')[0], 
          email, 
          password: hash, 
          role: 'Viewer' 
        });
        console.log(`[AUTH] New user created: ${email}`);
      } catch (createErr) {
        console.error(`[AUTH] Error creating user: ${createErr.message}`);
        return res.status(500).json({ message: 'Registration failed: ' + createErr.message });
      }
    } else {
      // If user exists, verify password
      const ok = await bcrypt.compare(password, user.password);
      if (!ok) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }
    }
    
    const token = jwt.sign({ id: user._id, role: user.role, name: user.name }, process.env.JWT_SECRET, { expiresIn: '8h' });
    res.json({ token });
  } catch (err) {
    console.error('[AUTH] Login error:', err.message);
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
});

router.get('/', (req, res) => {
  res.json({ message: 'Auth API ready' });
});

module.exports = router;
