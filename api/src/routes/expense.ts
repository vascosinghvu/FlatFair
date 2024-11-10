import express from "express"
import * as expenseController from "../controllers/expenseController"
import { requiresAuth } from "express-openid-connect"

const router = express.Router()
const axios = require("axios").default

router.post("/expense/add-expense", async (req, res) => {
  let response = await expenseController.createExpense(req, res)

  return res.status(response.status).json(response.data)
}),
  requiresAuth()

// router.route('/add-expense').post(requiresAuth(), groupPageController.createExpense)

export default router
