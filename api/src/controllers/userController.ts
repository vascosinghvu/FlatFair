import express, { Request, Response, Application } from "express"
import { User, IUser } from "../model/User"
import { Group, IGroup } from "../model/Group"
import { Expense, IExpense } from "../model/Expense"
import mongoose from "mongoose"

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
const createUser = async (req: any, res: Response) => {
  console.log("Checking login status")
  console.log(req.oidc.isAuthenticated() ? "Logged in" : "Logged out")

  //check if authenticated user has User in the database
  console.log(req.oidc.isAuthenticated())
  if (req.oidc.isAuthenticated()) {
    console.log("Authenticated")
    const user = await User.findOne({ auth0id: req.oidc.user.sub })
    console.log(user)
    console.log(!user)
    if (!user) {
      const newUser = new User({
        auth0id: req.oidc.user.sub,
        name: req.oidc.user.nickname,
        email: req.oidc.user.email,
        groups: [],
        friends: [],
        expenses: [],
      })
      newUser.save()
    }
  }
  res.redirect("http://localhost:3000")
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
}
