import express from "express"
import bodyParser from "body-parser"
import connectDB from "./config/db"
import * as routes from "./routes/index"
import cors from "cors"

const app = express()

// CORS configuration
app.use(cors({
  origin: "https://flat-fair-app-git-main-vasco-singhs-projects.vercel.app",
  credentials: true,
}))

// Middleware
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// Routes
app.use("/group", routes.group)
app.use("/expense", routes.expense)
app.use("/user", routes.user)

// Connect to database
connectDB()
  .then(() => console.log("Connected to MongoDB..."))
  .catch(err => console.error("MongoDB connection error:", err))

// Basic health check
app.get("/", (req, res) => {
  res.json({ status: "API is running" })
})

// For Vercel, we need to export the app
module.exports = app

// For local development
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 8000
  app.listen(PORT, () => console.log(`Server running on port ${PORT}...`))
} 
