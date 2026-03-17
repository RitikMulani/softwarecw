import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import db from '../config/database.js';

dotenv.config();

/**
 * Middleware to verify JWT access token
 */
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  const jwtSecret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

  jwt.verify(token, jwtSecret, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

/**
 * Middleware to check user roles (RBAC)
 */
export const authorizeRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Access denied. Required role: ${roles.join(' or ')}`,
      });
    }

    next();
  };
};

/**
 * Middleware to validate refresh token
 */
export const validateRefreshToken = async (req, res, next) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ message: 'Refresh token required' });
  }

  try {
    // Verify token signature
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    // Check if token exists in database and is not revoked
    const [tokens] = await db.query(
      'SELECT * FROM refresh_tokens WHERE token = ? AND user_id = ? AND revoked = FALSE AND expires_at > NOW()',
      [refreshToken, decoded.userId]
    );

    if (tokens.length === 0) {
      return res.status(403).json({ message: 'Invalid or revoked refresh token' });
    }

    req.user = decoded;
    req.refreshToken = tokens[0];
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid refresh token' });
  }
};

/**
 * Optional authentication - doesn't fail if no token
 */
export const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return next();
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (!err) {
      req.user = user;
    }
    next();
  });
};

