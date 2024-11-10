"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dbConnect_1 = __importDefault(require("./config/dbConnect"));
const auth_1 = require("./auth"); // Import your auth setup
const passport_1 = __importDefault(require("passport"));
const allRoutes_1 = __importDefault(require("./routes/allRoutes"));
(0, dbConnect_1.default)();
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json()); // To parse JSON bodies
// const port = process.env.PORT || 8000
const port = 8000;
// Use auth setup
(0, auth_1.setupAuth)(app);
// Use the routes from allRoutes.ts
app.use(allRoutes_1.default);
// Route to start authentication
app.get('/login', (req, res, next) => {
    passport_1.default.authenticate('auth0', {
        scope: 'openid email profile'
    })(req, res, next);
});
// Auth0 callback URL after authentication
app.get('/callback', passport_1.default.authenticate('auth0', {
    failureRedirect: '/'
}), (req, res) => {
    res.redirect('/dashboard');
});
// Route to log out
app.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            return res.status(500).json({ message: 'Error logging out' });
        }
        res.redirect(`https://${process.env.AUTH0_DOMAIN}/v2/logout?returnTo=${process.env.REACT_APP_API_URL || 'http://localhost:3000'}`);
    });
});
// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
