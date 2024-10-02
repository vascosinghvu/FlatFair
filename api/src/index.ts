import express, { Request, Response, Application } from "express"
import cors from "cors"
import dbConnect from "./config/dbConnect"
import mongoose from "mongoose"

import { Group, IGroup } from "./model/Group"
import { User, IUser } from "./model/User"
import { Expense } from "./model/Expense"
import { populate } from "dotenv"
import { type } from "os"

dbConnect()

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

app.post("/create-group", async (req: Request, res: Response) =>  {
  const { groupName, groupDescription, members } = req.body //members are emails

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


  // Use $in to find all users whose email is in the members array
  const users = await User.find({ email: { $in: members } });
  console.log("Users found:", users);

  // If no valid users, return 404
  if (users.length === 0) {
    return res.status(404).json({
      message: "No valid users found with the provided emails"
    });
  }

  // Extract the ObjectIds of the found users
  const memberIds = users.map((user) => user._id);

  // Create the new group document
  const newGroup = new Group({
    groupName,
    groupDescription,
    members: memberIds,  // Add the ObjectIds of the found users
    leader: memberIds[0],  // Assuming the first user is the leader
  });

  await newGroup.save();
  console.log('Group created successfully:', newGroup);

  // Add group to the user's groups using populate
  console.log("Pre-populate", newGroup)
  const groupMembers = await newGroup.populate("members");
  console.log("Post-populate", groupMembers)
  for (const member of groupMembers.members as IUser[]) {
    console.log("Member", member)
    console.log("Member groups", member.groups)
    member.groups.push(newGroup._id);
    member.save();
  }

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
