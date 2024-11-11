"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureAuthenticated = exports.setupAuth = void 0;

const jwt = require('jsonwebtoken');

// Export a function to setup basic middleware
const setupAuth = (app) => {
    // No setup needed for basic JWT auth
};

// Middleware to check if user is authenticated
const ensureAuthenticated = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid token' });
    }
};

exports.setupAuth = setupAuth;
exports.ensureAuthenticated = ensureAuthenticated;
