import express from "express"

const router = express.Router()
const axios = require("axios").default

import groupPageController from "../controllers/groupController"
import { requiresAuth } from "express-openid-connect"

router.post("/expense/add-expense", async (req, res) => {
  let expense = req.body

  let response = await groupPageController.createExpense(expense)

  return res.status(response.status).json(response.data)
}),
  requiresAuth()

// router.route('/add-expense').post(requiresAuth(), groupPageController.createExpense)

router.post("/create-group", async (req, res) => {
  const { groupName, groupMembers } = req.body

  console.log("Received group data:", req.body)

  //   Validate request body
  if (!groupName || !groupMembers) {
    return res.status(400).json({
      message: "Invalid data. Please provide group name and group members.",
    })
  }

  // Log the received data for debugging
  console.log("Received group data:", {
    groupName,
    groupMembers,
  })

  // Create a new group
  const response = await axios.post("http://localhost:3001/api/group", {
    groupName,
    groupMembers,
  })

  return res.status(response.status).json(response.data)
})

export default router
