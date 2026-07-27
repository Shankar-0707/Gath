const jwt = require('jsonwebtoken');
const RefreshToken = require('../models/RefreshToken');
const hashToken = require('./hashToken');

/**
 * Generates Short-Lived Access Token (15m)
 */
const generateAccessToken = (user) => {
  return jwt.sign(
    {
      sub: user._id,
      email: user.email,
      name: user.name
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || '15m' }
  );
};

/**
 * Generates Long-Lived Refresh Token (7d), stores SHA-256 hash in DB
 */
const generateRefreshToken = async (user) => {
  const refreshToken = jwt.sign(
    { sub: user._id },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY || '7d' }
  );

  const hashed = hashToken(refreshToken);
  
  // Calculate expiration date (7 days)
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  // Store hashed refresh token in database
  await RefreshToken.create({
    tokenHash: hashed,
    user: user._id,
    expiresAt
  });

  return refreshToken;
};

/**
 * Sends Refresh Token as HttpOnly cookie
 */
const sendRefreshTokenCookie = (res, token) => {
  const isProduction = process.env.NODE_ENV === 'production';

  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: isProduction, // HTTPS required in prod
    sameSite: isProduction ? 'none' : 'lax', // 'none' for cross-site prod, 'lax' for local dev
    path: '/', // Ensure cookie is sent on all API routes
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days in ms
  });
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  sendRefreshTokenCookie
};
