import express from "express"
import * as expenseController from "../controllers/expenseController"
import { requiresAuth } from "express-openid-connect"
import { verifyToken } from "../config/authMiddleware"

const router = express.Router()
const axios = require("axios").default

// router.post("/expense/add-expense", async (req, res) => {
//   let response = await expenseController.createExpense(req, res)

//   return res.status(response.status).json(response.data)
// }),
//   requiresAuth()

router.route("/add-expense").post(verifyToken, expenseController.createExpense)

router.delete(
  "/delete-expense/:expenseID",
  verifyToken,
  expenseController.deleteExpense
)

router
  .route("/get-expenses-between-users/:userId2")
  .get(verifyToken, expenseController.getExpensesBtwUsers)

export default router
