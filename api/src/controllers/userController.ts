import express, { Request, Response } from "express"
import { User, IUser } from "../model/User"
import { Group, IGroup } from "../model/Group"
import { Expense, IExpense } from "../model/Expense"
import mongoose from "mongoose"
import sendEmailInvite from "../config/sendgridInvite"
import bcrypt from "bcrypt" // For hashing passwords

// Test route
const test = async (req: Request, res: Response) => {
  res.status(200).json({ message: "Test route" })
}

// Get the current user, with populated groups and expenses
const getUser = async (req: Request, res: Response) => {
  const { id } = req.params

  // Find user by ID and populate related fields
  const currentUser = await User.findById(id)
    .populate({
      path: "groups",
      populate: {
        path: "members",
      },
    })
    .populate({
      path: "expenses",
      populate: {
        path: "group",
      },
    })

  if (!currentUser) {
    return res.status(404).json({ message: "User not found" })
  }

  return res.status(200).json({ currentUser })
}

// Create a new user
const createUser = async (req: Request, res: Response) => {
  try {
    const { password, email, name } = req.body

    if (!email || !password || !name) {
      return res.status(400).json({ message: "All fields are required" })
    }

    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res
        .status(200)
        .json({ message: "User already exists", userId: existingUser._id })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      groups: [],
      friends: [],
      expenses: [],
    })

    await newUser.save()

    return res.status(201).json({
      message: "User created successfully",
      userId: newUser._id,
    })
  } catch (error) {
    console.error("Error creating user:", error)
    return res.status(500).json({ message: "Internal server error", error })
  }
}

// Login logic placeholder (to be implemented with session or JWT)
const login = async (req: Request, res: Response) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" })
  }

  const user = await User.findOne({ email })
  if (!user) {
    return res.status(404).json({ message: "User not found" })
  }

  const isPasswordValid = await bcrypt.compare(password, user.password)
  if (!isPasswordValid) {
    return res.status(401).json({ message: "Invalid credentials" })
  }

  // Placeholder for session or JWT handling
  return res.status(200).json({ message: "Login successful", userId: user._id })
}

// Send an invite to a new user for a group
const sendInvite = async (req: Request, res: Response) => {
  const { email, inviteLink, groupName, groupId } = req.body

  if (!email || !inviteLink || !groupName || !groupId) {
    return res.status(400).json({ message: "Invalid request body" })
  }

  try {
    await sendEmailInvite(email, inviteLink, groupName, groupId)
    res.status(200).json({ message: "Invite sent successfully" })
  } catch (error) {
    console.error("Error sending invite:", error)
    res.status(500).json({ message: "Failed to send invite" })
  }
}

export default {
  getUser,
  createUser,
  login,
  sendInvite,
  test,
}
