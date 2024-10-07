"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureAuthenticated = exports.setupAuth = void 0;
// auth.ts
const passport_1 = __importDefault(require("passport"));
const passport_auth0_1 = require("passport-auth0");
const express_session_1 = __importDefault(require("express-session"));
const dotenv_1 = __importDefault(require("dotenv"));
const User_1 = require("./model/User");
dotenv_1.default.config(); // Load environment variables
// Passport configuration
passport_1.default.use(new passport_auth0_1.Strategy({
    domain: process.env.AUTH0_DOMAIN || '',
    clientID: process.env.AUTH0_CLIENT_ID || '',
    clientSecret: process.env.AUTH0_CLIENT_SECRET || '',
    callbackURL: process.env.AUTH0_CALLBACK_URL || 'http://localhost:8000/callback'
}, (accessToken, refreshToken, extraParams, profile, done) => {
    return done(null, profile); // Save profile on successful login
}));
passport_1.default.serializeUser((user, done) => {
    done(null, user.auth0id);
});
passport_1.default.deserializeUser((auth0id, done) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Fetch the user from MongoDB using the stored 'id'
        const user = yield User_1.User.findOne({ auth0id });
        if (!user) {
            return done(new Error('User not found'));
        }
        // Pass the complete user object to the request
        done(null, user);
    }
    catch (err) {
        done(err, null);
    }
}));
// Export a function to setup Passport and session middleware
const setupAuth = (app) => {
    app.use((0, express_session_1.default)({
        secret: 'yourSecret',
        resave: false,
        saveUninitialized: true,
    }));
    app.use(passport_1.default.initialize());
    app.use(passport_1.default.session());
};
exports.setupAuth = setupAuth;
// Middleware to check if user is authenticated
const ensureAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
};
exports.ensureAuthenticated = ensureAuthenticated;
