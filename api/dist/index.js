"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dbConnect_1 = __importDefault(require("./config/dbConnect"));
const allRoutes_1 = __importDefault(require("./routes/allRoutes"));
(0, dbConnect_1.default)();
const app = (0, express_1.default)();

// CORS configuration
const corsOptions = {
    origin: [
        'https://flat-fair-app-git-main-vasco-singhs-projects.vercel.app',
        'http://localhost:3000'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Access-Control-Allow-Origin'],
    credentials: true
};

// Apply CORS middleware with options
app.use((0, cors_1.default)(corsOptions));

app.use(express_1.default.json()); // To parse JSON bodies
const port = process.env.PORT || 8000;

// Use the routes from allRoutes.ts
app.use(allRoutes_1.default);

// Basic health check route
app.get('/', (req, res) => {
    res.json({ status: 'API is running' });
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
