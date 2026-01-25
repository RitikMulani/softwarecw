import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import db from '../config/database.js';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Generate access and refresh tokens
 */
function generateTokens(user) {
  const accessToken = jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.user_type,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
  );

  const refreshToken = jwt.sign(
    {
      userId: user.id,
      email: user.email,
    },
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );

  return { accessToken, refreshToken };
}

/**
 * Register a new user
 */
export async function register(req, res) {
  try {
    const { email, password, name, role = 'user' } = req.body;

    // Check if user exists
    const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);

    if (existing.length > 0) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = uuidv4();

    // Insert user
    await db.query(
      `INSERT INTO users (id, email, password, full_name, user_type, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
      [userId, email, hashedPassword, name, role === 'provider' ? 'patient' : role]
    );

    res.status(201).json({
      message: 'User registered successfully',
      userId,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Error registering user', error: error.message });
  }
}

/**
 * Login user
 */
export async function login(req, res) {
  try {
    const { email, password } = req.body;

    // Find user
    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);

    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const user = users[0];

    // Verify password
    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user);

    // Store refresh token (skip if table doesn't exist)
    try {
      const tokenId = uuidv4();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      await db.query(
        `INSERT INTO refresh_tokens (id, user_id, token, expires_at, created_at) 
         VALUES (?, ?, ?, ?, NOW())`,
        [tokenId, user.id, refreshToken, expiresAt]
      );
    } catch (err) {
      // Table might not exist, continue anyway
      console.log('Note: refresh_tokens table not found');
    }

    // Return tokens and user info
    res.json({
      message: 'Login successful',
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.full_name,
        role: user.user_type,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
}

/**
 * Refresh access token
 */
export async function refresh(req, res) {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token required' });
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    } catch (error) {
      return res.status(403).json({ message: 'Invalid refresh token' });
    }

    // Check if token exists and is not revoked
    const [tokens] = await db.query(
      `SELECT * FROM refresh_tokens 
       WHERE token = ? AND user_id = ? AND revoked = FALSE AND expires_at > NOW()`,
      [refreshToken, decoded.userId]
    );

    if (tokens.length === 0) {
      return res.status(403).json({ message: 'Invalid or expired refresh token' });
    }

    // Get user
    const [users] = await db.query('SELECT * FROM users WHERE id = ?', [decoded.userId]);

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(users[0]);

    // Revoke old refresh token
    await db.query('UPDATE refresh_tokens SET revoked = TRUE WHERE id = ?', [tokens[0].id]);

    // Store new refresh token
    const tokenId = uuidv4();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await db.query(
      `INSERT INTO refresh_tokens (id, user_id, token, expires_at, created_at) 
       VALUES (?, ?, ?, ?, NOW())`,
      [tokenId, decoded.userId, newRefreshToken, expiresAt]
    );

    res.json({
      accessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    console.error('Refresh error:', error);
    res.status(500).json({ message: 'Error refreshing token', error: error.message });
  }
}

/**
 * Get current user profile
 */
export async function me(req, res) {
  try {
    const [users] = await db.query(
      `SELECT id, email, name, role, biometric_profile, created_at 
       FROM users WHERE id = ?`,
      [req.user.userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = users[0];

    // If provider, get provider details
    if (user.role === 'provider') {
      const [providers] = await db.query(
        'SELECT * FROM providers WHERE user_id = ?',
        [user.id]
      );
      user.provider = providers[0] || null;
    }

    res.json({
      user: {
        ...user,
        biometric_profile: user.biometric_profile ? JSON.parse(user.biometric_profile) : null,
      },
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Error fetching profile', error: error.message });
  }
}

/**
 * Logout (revoke refresh token)
 */
export async function logout(req, res) {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      await db.query('UPDATE refresh_tokens SET revoked = TRUE WHERE token = ?', [refreshToken]);
    }

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Error logging out', error: error.message });
  }
}

/**
 * Update user profile
 */
export async function updateProfile(req, res) {
  try {
    const { name, biometric_profile } = req.body;
    const updates = [];
    const values = [];

    if (name) {
      updates.push('name = ?');
      values.push(name);
    }

    if (biometric_profile) {
      updates.push('biometric_profile = ?');
      values.push(JSON.stringify(biometric_profile));
    }

    if (updates.length === 0) {
      return res.status(400).json({ message: 'No updates provided' });
    }

    updates.push('updated_at = NOW()');
    values.push(req.user.userId);

    await db.query(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, values);

    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Error updating profile', error: error.message });
  }
}

/**
 * GDPR - Delete user account
 */
export async function deleteAccount(req, res) {
  try {
    const userId = req.user.userId;

    // Delete user (cascade will handle related records)
    await db.query('DELETE FROM users WHERE id = ?', [userId]);

    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ message: 'Error deleting account', error: error.message });
  }
}
