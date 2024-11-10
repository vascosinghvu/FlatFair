import express from "express"
import bodyParser from "body-parser"
import connectDB from "./config/db"
import { auth } from "express-openid-connect"

import * as routes from "./routes/index"

var cors = require("cors")

const app = express()
// CORS options
const corsOptions = {
  origin: "http://localhost:3000", // Allow only your React frontend
  credentials: true, // Allow credentials (cookies, etc.)
}
app.use(cors(corsOptions))

app.options(
  "*",
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
)

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

connectDB()
console.log("Connected to the database...")

// Auth0 configuration
const config = {
  authRequired: false,
  auth0Logout: true,
  secret: process.env.SESSION_SECRET || "your-secret",
  baseURL: "http://localhost:8000", // Redirect to React app on login
  clientID: process.env.AUTH0_CLIENT_ID || "your-client-id",
  issuerBaseURL: `https://${process.env.AUTH0_DOMAIN}` || "your-auth0-domain",
  clientSecret: process.env.AUTH0_CLIENT_SECRET || "your-client-secret",
  routes: {
    callback: "/callback",
    postLogoutRedirect: "http://localhost:3000", // Redirect to React app on logout
  },
}

// Auth0 middleware for handling authentication
app.use(auth(config))

app.use("/group", routes.group)
app.use("/expense", routes.expense)
app.use("/user", routes.user)

const PORT = process.env.PORT || 8000
app.listen(PORT, () => console.log(`Server running on port ${PORT}...`))
