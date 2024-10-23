import express from "express"
import path from "path"
import connectDB from "./config/db"
import cors from "cors"
import * as routes from "./routes/index"

const app = express()

// Connect to the database
connectDB()
console.log("Connected to the database...")

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.static(path.join(__dirname, "public")))

// Use routes
app.use("/group", routes.group)
// Add other routes similarly

// Start server
const PORT = process.env.PORT || 8000
app.listen(PORT, () => console.log(`Server running on port ${PORT}...`))
