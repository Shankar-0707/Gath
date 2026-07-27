const crypto = require('crypto');

/**
 * Creates a SHA-256 hash of a raw token string for secure DB storage.
 * @param {string} token
 * @returns {string} hex hash
 */
const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

module.exports = hashToken;
