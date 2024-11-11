import express, { Request, Response, Application } from "express"
import { User, IUser } from "../model/User"
import { Group, IGroup } from "../model/Group"
import { Expense, IExpense } from "../model/Expense"
import mongoose from "mongoose"
import sendEmailInvite from "../config/sendgridInvite"
import bcrypt from "bcrypt" // For hashing passwords

const test = async (req: Request, res: Response) => {
  res.status(200).json({ message: "Test route" })
}

// Get the current user, with populated groups and expenses
const getUser = async (req: any, res: Response) => {
  // Get the current user
  const { id } = req.params
  const currentUser = await User.findOne({ auth0id: id })
    .populate({
      path: "groups", // First, populate the 'groups' field
      populate: {
        path: "members", // Then, populate the 'members' field inside 'groups'
      },
    })
    .populate({
      path: "expenses", // First, populate the 'expenses' field
      populate: {
        path: "group", // Then, populate the 'group' field inside 'expenses'
      },
    })

  return res.status(200).json({ currentUser })
}

const createUser = async (req: Request, res: Response) => {
  try {
    const { password, email, name } = req.body

    // Validate input fields
    if (!email || !password || !name) {
      return res.status(400).json({ message: "All fields are required" })
    }

    // Check if the user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res
        .status(200)
        .json({ message: "User already exists", userId: existingUser._id })
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create the new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword, // Save hashed password
      groups: [],
      friends: [],
      expenses: [],
    })

    await newUser.save()

    // Send user ID to the frontend
    return res.status(201).json({
      message: "User created successfully",
      userId: newUser._id, // Include the new user's ID
    })
  } catch (error) {
    console.error("Error creating user:", error)
    return res.status(500).json({ message: "Internal server error", error })
  }
}

// // Controller for getting user profile
// const getProfile = (req: any, res: Response) => {
//   console.log("Getting profile")
//   res.json(req.oidc.user) // Returns user information if logged in
// }

// Controller for initiating Auth0 login
const login = (req: Request, res: any) => {
  console.log("Initiating login")
  res.oidc.login() // Initiates Auth0 login
}

// Controller for inviting a new user to a group
const sendInvite = async (req: Request, res: Response) => {
  console.log("sendInvite called")
  const { email, inviteLink, groupName, groupId } = req.body

  // Validate request body
  if (!email || !inviteLink || !groupName || !groupId) {
    console.error("Invalid request body:", req.body)
    return res.status(400).json({
      message: "Invalid request body",
      email,
      inviteLink,
      groupName,
      groupId,
    })
  }

  await sendEmailInvite(email, inviteLink, groupName, groupId)

  try {
    await sendEmailInvite(email, inviteLink, groupName, groupId)
    res.status(200).json({ message: "Invite sent successfully" })
  } catch (error) {
    console.error("Error sending invite:", error)
    res.status(500).json({ message: "Failed to send invite" })
  }
}

// const getUser = async (req: any, res: Response) => {
//   const { auth0id } = req.oidc.user.sub
//   const user = await User.findOne({ auth0id })
//   res.status(200).json(user)
// }

// Export the controller functions
export default {
  getUser,
  createUser,
  // getProfile,
  login,
  sendInvite,
  test,
}
