import express, { Request, Response, Application } from "express"
import { User, IUser } from "../model/User"
import { Group, IGroup } from "../model/Group"
import { Expense, IExpense } from "../model/Expense"
import mongoose from "mongoose"

export async function createExpense(expense: any) {
  const { totalCost, item, groupID, date, memberBreakdown, createdBy } = expense

  // Validate request body
  if (!totalCost || !item || !groupID || !memberBreakdown) {
    return {
      status: 400,
      data: {
        message:
          "Invalid data. Please provide total cost, item, group ID, date, createdBy, and member breakdown.",
      },
    }
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
  const group = await Group.findById(groupID)
  if (!group) {
    return {
      status: 404,
      data: {
        message: "Group not found",
      },
    }
  }

  // Find the current user by createdBy ID
  const currentUser = await User.findOne({ auth0id: createdBy })

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
  })

  // Save the new expense
  await newExpense.save()

  // Add the expense to the group's expenses array
  group.expenses.push(newExpense._id)
  await group.save()

  // Add the expense to each user's expenses array
  const payingUser = await User.findById(newExpense.createdBy)
  for (const { memberID, amountDue } of memberBreakdown) {
    const user: any = await User.findById(memberID)
    if (user) {
      user.expenses.push(newExpense._id)
      // Check if the user is the creator of the expense, otherwise update the balances
      if (!user._id.equals(newExpense.createdBy)) {
        user.balances[String(payingUser?._id)] =
          (user.balances[String(newExpense.createdBy)] || 0) + amountDue
      }
      await user.save()
    }
  }

  return {
    status: 201,
    data: {
      message: "Expense created successfully",
      expense: newExpense,
    },
  }
}
