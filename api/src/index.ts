import express, { Request, Response, Application } from "express"
import './definitionFile'
import cors from "cors"
import dbConnect from "./config/dbConnect"

import { IGetUserAuthInfoRequest } from "./definitionFile.js"

// import { setupAuth, ensureAuthenticated } from './auth'; // Import your auth setup
import { NextFunction } from "express";
import { auth, requiresAuth, Session } from 'express-openid-connect'
import session from "express-session"

import routes from "./routes/allRoutes"
import groupRoutes from "./routes/groupPageRoutes"
import curUserRoutes from "./routes/curUserRoutes"
// import { auth } from "express-openid-connect";


dbConnect()

const app: Application = express()


// CORS options
const corsOptions = {
  origin: ['https://flat-fair-csac.vercel.app', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions))

app.options('*', cors({
  origin: ['https://flat-fair-csac.vercel.app', 'http://localhost:3000'],
  credentials: true,
}));

app.use(express.json()) // To parse JSON bodies
// const port = process.env.PORT || 8000
const port = 8000

// Setup express-session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret',
  resave: false,
  saveUninitialized: true,
  cookie: {
      secure: false, // Set true if using HTTPS
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 1 day
  }
}));

// Auth0 configuration
const config = {
  authRequired: false,
  auth0Logout: true,
  secret: process.env.SESSION_SECRET || 'your-secret',
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000',
  clientID: process.env.AUTH0_CLIENT_ID || 'your-client-id',
  issuerBaseURL: `https://${process.env.AUTH0_DOMAIN}` || 'your-auth0-domain',
  clientSecret: process.env.AUTH0_CLIENT_SECRET || 'your-client-secret',
  routes: {
      callback: '/callback',
      postLogoutRedirect: process.env.REACT_APP_API_URL || 'http://localhost:3000',
  },
};

// Auth0 middleware for handling authentication
app.use(auth(config));

// Add this before your routes
app.use((req, res, next) => {
    res.header('Content-Type', 'application/json');
    next();
});

// Use the routes from groupPage.ts, prefixed with /group
app.use('/group', groupRoutes)

// Use the routes from curUserInfo.ts, prefixed with /curUserInfo
app.use('/curUserInfo', curUserRoutes)

// Use the routes from allRoutes.ts
app.use(routes)

// Auth0 login route
app.get('/login', (req, res) => {
    console.log('Login route hit');
    try {
        const returnTo = encodeURIComponent(process.env.REACT_APP_API_URL || 'http://localhost:3000');
        const loginUrl = `https://${process.env.AUTH0_DOMAIN}/authorize?` +
            `response_type=code&` +
            `client_id=${process.env.AUTH0_CLIENT_ID || 'your-client-id'}&` +
            `redirect_uri=${encodeURIComponent(process.env.AUTH0_CALLBACK_URL || 'http://localhost:8000/callback')}&` +
            `scope=openid%20profile%20email&` +
            `returnTo=${returnTo}`;
        
        console.log('Redirecting to:', loginUrl);
        res.redirect(loginUrl);
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Authentication failed' });
    }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`)
})
