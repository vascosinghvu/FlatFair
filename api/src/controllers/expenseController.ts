import express, { Request, Response, Application } from "express"
import { User, IUser } from "../model/User"
import { Group, IGroup } from "../model/Group"
import { Expense, IExpense } from "../model/Expense"
import mongoose from "mongoose"

// Create new expense for a group
const createExpense = async (req: any, res: Response) => {
  const { totalCost, item, groupID, date, memberBreakdown } = req.body

  // Validate request body
  if (!totalCost || !item || !groupID || !memberBreakdown) {
    return res.status(400).json({
      message:
        "Invalid data. Please provide total cost, item, group ID, date, createdBy, and member breakdown.",
    })
  }

  // Log the received data for debugging
  console.log("Received expense data:", {
    totalCost,
    item,
    groupID,
    date,
    memberBreakdown,
  })

  // Find the group with the provided groupID
  // const groupIDObj = new mongoose.Types.ObjectId(groupID);
  const group = await Group.findById(groupID)
  if (!group) {
    return res.status(404).json({
      message: "Group not found",
    })
  }

  console.log("USER OBJECT?:")
  console.log((req as any).user.userId)

  const currentUser = await User.findOne({ _id: (req as any).user.userId })

  // Create the allocatedTo Map object
  const allocatedTo = new Map()
  for (const { memberID, amountDue } of memberBreakdown) {
    const memberIDObj = new mongoose.Types.ObjectId(memberID)
    allocatedTo.set(memberIDObj, amountDue)
  }

  console.log("ALLOCATED TO:", allocatedTo)

  // Create the new expense document
  const newExpense = new Expense({
    amount: totalCost,
    description: item,
    group: groupID,
    createdBy: currentUser?._id,
    date: Date.parse(date),
    allocatedTo: allocatedTo,
    allocatedToUsers: Array.from(allocatedTo.keys()),
  })

  // Save the new expense
  await newExpense.save()

  // Add the expense to the group's expenses array
  group.expenses.push(newExpense._id)
  await group.save()

  // Add the expense to each user's expenses array
  const payingUser = await User.findById(newExpense.createdBy)
  for (const { memberID, amountDue } of memberBreakdown) {
    const user = await User.findById(memberID)
    if (user) {
      user.expenses.push(newExpense._id)
      //check if the user is the creator of the expense, otherwise update the balances
      if (user._id !== newExpense.createdBy) {
        user.balances[String(payingUser?._id!)] =
          (user.balances[String(newExpense.createdBy)] || 0) + amountDue
      }
      await user.save()
    }
  }

  return res.status(201).json({
    message: "Expense created successfully",
    expense: newExpense,
  })
}

// delete expense
const deleteExpense = async (req: Request, res: Response) => {
  const { expenseID } = req.params

  if (!expenseID) {
    return res.status(400).json({
      message: "Invalid data. Please provide expense ID.",
    })
  }

  try {
    const expense = await Expense.findByIdAndDelete(expenseID)
    if (!expense) {
      return res.status(404).json({ message: "Expense not found" })
    }

    return res.status(200).json({
      message: "Expense deleted successfully",
      expenseID: expense._id,
    })
  } catch (error) {
    console.error("Error deleting expense:", error)
    return res.status(500).json({ message: "Internal server error", error })
  }
}

// Export the controller functions
export { createExpense, deleteExpense }
