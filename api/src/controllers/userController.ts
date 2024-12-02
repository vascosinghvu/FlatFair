import express, { Request, Response } from "express"
import { User, IUser } from "../model/User"
import { Group, IGroup } from "../model/Group"
import { Expense, IExpense } from "../model/Expense"
import mongoose from "mongoose"
import sendSendgridEmail from "../config/sendgridEmail"
import bcrypt from "bcrypt" // For hashing passwords
import jwt from "jsonwebtoken" // For generating JWT

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret"

// Test route
const test = async (req: Request, res: Response) => {
  res.status(200).json({ message: "Test route" })
}

// Get the current user, with populated groups and expenses
const getUser = async (req: Request, res: Response) => {
  console.log("GET USER INFO")
  console.log((req as any).user)
  const { userId } = (req as any).user

  const currentUser = await User.findById(userId)
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

const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" })
    }

    // Find the user by email
    const user = await User.findOne({ email })

    console.log(user)
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    // Compare the provided password with the stored hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" })
    }

    // Generate a JWT token with the user ID
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
      expiresIn: "1h", // Token validity
    })

    return res.status(200).json({
      message: "Login successful",
      userId: user._id,
      token,
    })
  } catch (error) {
    console.error("Login error:", error)
    return res.status(500).json({ message: "Internal server error", error })
  }
}

// Create a new user
const createUser = async (req: Request, res: Response) => {
  try {
    console.log("Creating user with data:", req.body)
    const { password, email, name } = req.body

    if (!email || !password || !name) {
      return res.status(400).json({ message: "All fields are required" })
    }

    // Check if the user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      if (existingUser.isDummy) {
        // Update the dummy user with real user data
        existingUser.name = name
        existingUser.password = await bcrypt.hash(password, 10)
        existingUser.isDummy = false

        console.log("Updating existing dummy user:", existingUser)

        await existingUser.save()

        return res.status(200).json({
          message: "User updated successfully",
          userId: existingUser._id,
        })
      } else {
        return res
          .status(200)
          .json({ message: "User already exists", userId: existingUser._id })
      }
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10)

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      groups: [],
      friends: [],
      expenses: [],
      isDummy: false, // Explicitly set isDummy to false
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

// Delete a user by email
const deleteUser = async (req: Request, res: Response) => {
  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({ message: "Email is required" })
    }

    const deletedUser = await User.findOneAndDelete({ email })

    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" })
    }

    return res.status(200).json({
      message: "User deleted successfully",
      userId: deletedUser._id,
    })
  } catch (error) {
    console.error("Error deleting user:", error)
    return res.status(500).json({ message: "Internal server error", error })
  }
}

const sendEmail = async (req: Request, res: Response) => {
  console.log("sendEmail called")
  const { email, subject, text, html } = req.body

  // Validate request body
  if (!email || !subject || !text || !html) {
    console.error("Invalid request body:", req.body)
    return res
      .status(400)
      .json({ message: "Invalid request body", email, subject, text, html })
  }

  try {
    await sendSendgridEmail(email, subject, text, html)
    res.status(200).json({ message: "Email sent successfully" })
  } catch (error) {
    console.error("Error sending email:", error)
    res.status(500).json({ message: "Failed to send email" })
  }
}

// Reset the password for a user
const resetPassword = async (req: Request, res: Response) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" })
  }

  try {
    const user = await User.findOne({ email })

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    user.password = hashedPassword
    await user.save()

    return res.status(200).json({ message: "Password reset successfully" })
  } catch (error) {
    console.error("Error resetting password:", error)
    return res.status(500).json({ message: "Failed to reset password" })
  }
}

export default {
  test,
  getUser,
  login,
  createUser,
  deleteUser,
  resetPassword,
  sendEmail,
}
