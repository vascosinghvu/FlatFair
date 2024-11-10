import express, { Request, Response, Application } from "express"
import { User, IUser } from "../model/User"
import { Group, IGroup } from "../model/Group"
import { Expense, IExpense } from "../model/Expense"
import mongoose from "mongoose"
import sendEmailInvite from "../config/sendgridInvite"

const test = async (req: Request, res: Response) => {
  res.status(200).json({ message: "Test route" })
}

// Get the current user, with populated groups and expenses
const getUser = async (req: any, res: Response) => {
  // Get the current user
  // console.log("CURRENT USER: ", req.oidc.user)
  const curUserAuth0Id = req.oidc.user.sub
  const currentUser = await User.findOne({ auth0id: curUserAuth0Id })
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

// Controller for creating user if necessary
const createUser = async (req: Request, res: Response) => {
  console.log("here")
  try {
    const { id, email, name } = req.body // Expect email and name in the request body

    // Check if the user already exists in the database
    const existingUser = await User.findOne({ auth0id: id })
    if (existingUser) {
      return res
        .status(200)
        .json({ message: "User already exists", user: existingUser })
    }

    // Create a new user if not found
    const newUser = new User({
      auth0id: id,
      name: name || "Anonymous", // Default name if none provided
      email: email,
      groups: [],
      friends: [],
      expenses: [],
    })

    await newUser.save()

    return res
      .status(201)
      .json({ message: "User created successfully", user: newUser })
  } catch (error) {
    console.error("Error creating user:", error)
    return res.status(500).json({ message: "Internal server error", error })
  }
}

// Controller for getting user profile
const getProfile = (req: any, res: Response) => {
  console.log("Getting profile")
  res.json(req.oidc.user) // Returns user information if logged in
}

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
  getProfile,
  login,
  sendInvite,
  test,
}
