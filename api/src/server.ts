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

app.use("/group", routes.group)
app.use("/expense", routes.expense)

app.listen(process.env.PORT || 8000, () => console.log("Server running..."))
