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

app.use("/group", routes.group)
app.use("/expense", routes.expense)
app.use("/user", routes.user)

const PORT = process.env.PORT || 8000
app.listen(PORT, () => console.log(`Server running on port ${PORT}...`))
