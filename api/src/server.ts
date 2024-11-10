import express from "express"
import bodyParser from "body-parser"
import connectDB from "./config/db"

import * as routes from "./routes/index"

var cors = require("cors")

const app = express()
app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

connectDB()
console.log("Connected to the database...")

app.use("/group", routes.group)
app.use("/expense", routes.expense)

const PORT = process.env.PORT || 8000
app.listen(PORT, () => console.log(`Server running on port ${PORT}...`))
