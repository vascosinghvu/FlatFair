import express, { Request, Response, Application } from "express"
import dotenv from "dotenv"
import cors from "cors"

// Load environment variables from .env file
dotenv.config()

const app: Application = express()
app.use(cors())
app.use(express.json()) // To parse JSON bodies
const port = process.env.PORT || 8000

// Test POST endpoint
app.post("/test", (req: Request, res: Response) => {
  console.log(req.body) // Log the request body to check what you are receiving

  const { key } = req.body // Extract "key" from the request body
  if (!key) {
    return res.status(400).json({ message: "No key provided" })
  }

  return res.status(200).json({
    message: "Data received successfully",
    receivedKey: key,
  })
})

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`)
})
