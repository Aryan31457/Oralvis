import jwt from 'jsonwebtoken';
import config from '../config/server-config.js';
import tokenBlacklist from '../utils/token-blacklist.js';

export function isAuthenticated(req, res, next) {
    try {
        const authHeader = req.headers['authorization'];
        console.log(authHeader);
        if (!authHeader) {
            return res.status(401).json({ message: 'Authorization header missing' });
        }

        const token = authHeader.split(' ')[1]; // Bearer <token>
        console.log(token);
        if (!token) {
            return res.status(401).json({ message: 'Token missing' });
        }

        // Check if token is blacklisted
        if (tokenBlacklist.has(token)) {
            return res.status(401).json({ message: 'Token is invalid (logged out)' });
        }

        // Verify token
        const decoded = jwt.verify(token, config.JWT_SECRET_KEY);
        console.log(decoded);
        // Attach user info to request object
        req.user = decoded;
        console.log(req.user);
        next();

    } catch (error) {
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
}