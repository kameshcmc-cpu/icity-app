const express = require('express');
const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const { db } = require('../database');

const router = express.Router();
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Verify Google credential and return app JWT
router.post('/google', async (req, res) => {
  const { credential } = req.body;
  if (!credential) return res.status(400).json({ error: 'Missing credential' });

  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    // Upsert user
    const existing = db.prepare('SELECT * FROM users WHERE google_id = ?').get(googleId);
    let user;
    if (existing) {
      db.prepare('UPDATE users SET name = ?, avatar = ? WHERE google_id = ?')
        .run(name, picture, googleId);
      user = { ...existing, name, avatar: picture };
    } else {
      const result = db.prepare(
        'INSERT INTO users (google_id, email, name, avatar, role) VALUES (?, ?, ?, ?, ?)'
      ).run(googleId, email, name, picture, 'staff');
      user = { id: result.lastInsertRowid, google_id: googleId, email, name, avatar: picture, role: 'staff' };
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, avatar: user.avatar, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ token, user: { id: user.id, email: user.email, name: user.name, avatar: user.avatar, role: user.role } });
  } catch (err) {
    console.error('Google auth error:', err.message);
    res.status(401).json({ error: 'Google authentication failed' });
  }
});

// Get current user from token
router.get('/me', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const token = authHeader.split(' ')[1];
    const user = jwt.verify(token, process.env.JWT_SECRET);
    res.json({ user });
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
});

module.exports = router;
