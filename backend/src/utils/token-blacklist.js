// token-blacklist.js
const blacklist = new Map();

/**
 * Add token to blacklist with expiry time (timestamp)
 */
function add(token, expiryTimestamp) {
    blacklist.set(token, expiryTimestamp);
    // Remove token from blacklist after expiry automatically
    const delay = expiryTimestamp - Date.now();
    if (delay > 0) {
        setTimeout(() => blacklist.delete(token), delay);
    }
}

/**
 * Check if token is blacklisted and still valid
 */
function has(token) {
    if (!blacklist.has(token)) return false;
    if (blacklist.get(token) < Date.now()) {
        blacklist.delete(token);
        return false;
    }
    return true;
}

export default {
    add,
    has,
};