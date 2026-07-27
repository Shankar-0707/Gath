const jwt = require('jsonwebtoken');
const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const hashToken = require('../utils/hashToken');
const {
  generateAccessToken,
  generateRefreshToken,
  sendRefreshTokenCookie
} = require('../utils/generateTokens');

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields (name, email, password) are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists.' });
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password
    });

    const accessToken = generateAccessToken(user);
    const refreshToken = await generateRefreshToken(user);

    sendRefreshTokenCookie(res, refreshToken);

    res.status(201).json({
      message: 'Registration successful',
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user & get tokens
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = await generateRefreshToken(user);

    sendRefreshTokenCookie(res, refreshToken);

    res.status(200).json({
      message: 'Login successful',
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh Access Token using HttpOnly Refresh Token cookie (Rotation enabled)
 * @access  Public (Cookie required)
 */
const refresh = async (req, res, next) => {
  try {
    const rawRefreshToken = req.cookies?.refreshToken;

    if (!rawRefreshToken) {
      return res.status(401).json({ message: 'Refresh Token missing' });
    }

    let decoded;
    try {
      decoded = jwt.verify(rawRefreshToken, process.env.REFRESH_TOKEN_SECRET);
    } catch (err) {
      return res.status(403).json({ message: 'Invalid or expired Refresh Token' });
    }

    const tokenHash = hashToken(rawRefreshToken);
    const storedToken = await RefreshToken.findOne({ tokenHash });

    if (!storedToken || storedToken.isRevoked) {
      // Possible reuse attack detected - clear cookie
      res.clearCookie('refreshToken');
      return res.status(403).json({ message: 'Refresh Token revoked or invalid' });
    }

    // Revoke old refresh token (Token Rotation)
    storedToken.isRevoked = true;
    await storedToken.save();

    const user = await User.findById(decoded.sub);
    if (!user) {
      return res.status(401).json({ message: 'User no longer exists' });
    }

    // Issue new pair of tokens
    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = await generateRefreshToken(user);

    sendRefreshTokenCookie(res, newRefreshToken);

    res.status(200).json({
      accessToken: newAccessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user & revoke refresh token
 * @access  Public / Private
 */
const logout = async (req, res, next) => {
  try {
    const rawRefreshToken = req.cookies?.refreshToken;

    if (rawRefreshToken) {
      const tokenHash = hashToken(rawRefreshToken);
      await RefreshToken.findOneAndUpdate({ tokenHash }, { isRevoked: true });
    }

    const isProduction = process.env.NODE_ENV === 'production';
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      path: '/'
    });

    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/auth/me
 * @desc    Get currently authenticated user info
 * @access  Private
 */
const me = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.sub);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      id: user._id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  refresh,
  logout,
  me
};
