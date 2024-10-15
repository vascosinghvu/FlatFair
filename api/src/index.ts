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
// import { auth } from "express-openid-connect";


dbConnect()

const app: Application = express()


// CORS options
const corsOptions = {
  origin: 'http://localhost:3000', // Allow only your React frontend
  credentials: true, // Allow credentials (cookies, etc.)
};
app.use(cors(corsOptions))
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
  baseURL: 'http://localhost:8000', // Redirect to React app on login
  clientID: process.env.AUTH0_CLIENT_ID || 'your-client-id',
  issuerBaseURL: `https://${process.env.AUTH0_DOMAIN}` || 'your-auth0-domain',
  clientSecret: process.env.AUTH0_CLIENT_SECRET || 'your-client-secret',
  routes: {
      callback: '/callback',
      postLogoutRedirect: 'http://localhost:3000', // Redirect to React app on logout
  },
};

// Auth0 middleware for handling authentication
app.use(auth(config));

// Use the routes from allRoutes.ts
app.use(routes)

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`)
})
