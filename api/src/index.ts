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

app.post("/create-group", (req: Request, res: Response) => {
  const { groupName, groupDescription, members } = req.body

  // Validate request body
  if (
    !groupName ||
    !groupDescription ||
    !Array.isArray(members) ||
    members.length === 0
  ) {
    return res.status(400).json({
      message:
        "Invalid data. Please provide group name, description, and at least one member.",
    })
  }

  // Log the received data for debugging
  console.log("Received group data:", { groupName, groupDescription, members })

  // Perform necessary operations to create the group, e.g., saving to a database
  // For now, we'll just send a success response

  return res.status(200).json({
    message: "Group created successfully",
    group: {
      groupName,
      groupDescription,
      members,
    },
  })
})

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`)
})
