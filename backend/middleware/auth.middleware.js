const jwt = require('jsonwebtoken');
require('dotenv').config();

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const { User } = require('../models/index');
    const user = await User.findByPk(decoded.user_id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if token was issued before the invalidation timestamp
    // (covers logout, password change, and any admin-forced invalidation)
    if (user.tokens_valid_after) {
      const tokenIssuedAt = new Date(decoded.iat * 1000);
      if (tokenIssuedAt < new Date(user.tokens_valid_after)) {
        return res.status(401).json({
          message: 'Token has been invalidated. Please login again.',
        });
      }
    }

    if (user.is_suspended) {
      return res.status(403).json({
        message: 'Your account has been suspended.',
        reason: user.suspended_reason || 'Please contact support.',
      });
    }

    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

module.exports = authMiddleware;