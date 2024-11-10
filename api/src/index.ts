import express, { Request, Response, NextFunction } from "express"
import './definitionFile'
import cors from "cors"
import dbConnect from "./config/dbConnect"
import { auth, requiresAuth } from 'express-openid-connect'
import session from "express-session"
import routes from "./routes/allRoutes"
import groupRoutes from "./routes/groupPageRoutes"
import curUserRoutes from "./routes/curUserRoutes"

// Define custom interface for request with oidc
interface AuthRequest extends Request {
    oidc?: {
        isAuthenticated(): boolean;
        user?: any;
    };
}

dbConnect()

const app = express()

// CORS options
const corsOptions = {
    origin: ['https://flat-fair-csac.vercel.app', 'http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions))

app.options('*', cors(corsOptions));

app.use(express.json())
const port = 8000

// Setup express-session middleware
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
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

app.use(auth(config));

// Content-Type middleware
app.use((_req: Request, res: Response, next: NextFunction) => {
    res.header('Content-Type', 'application/json');
    next();
});

// Routes
app.use('/group', groupRoutes)
app.use('/curUserInfo', curUserRoutes)
app.use(routes)

// Auth0 login route
app.get('/login', (_req: Request, res: Response) => {
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

// Error handling middleware
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error(err);
    res.status(500).json({
        error: 'Internal Server Error',
        message: err.message
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`)
})
