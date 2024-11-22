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

  const statusMap = new Map()
  for (const { memberID, amountDue } of memberBreakdown) {
    const memberIDObj = new mongoose.Types.ObjectId(memberID)
    statusMap.set(memberIDObj, "Pending")
  }
  statusMap.set(currentUser?._id, "Settled")

  // Create the new expense document
  const newExpense = new Expense({
    amount: totalCost,
    description: item,
    group: groupID,
    createdBy: currentUser?._id,
    date: Date.parse(date),
    allocatedTo: allocatedTo,
    allocatedToUsers: Array.from(allocatedTo.keys()),
    statusMap: statusMap,
  })

  // Save the new expense
  await newExpense.save()

  // Add the expense to the group's expenses array
  group.expenses.push(newExpense._id)
  await group.save()

  // Add the expense to each user's expenses array
  const payingUser = await User.findById(newExpense.createdBy)
  console.log("PAYING USER:", payingUser)
  for (const { memberID, amountDue } of memberBreakdown) {
    console.log("MEMBER ID:", memberID)
    console.log("AMOUNT DUE:", amountDue)
    const user = await User.findById(memberID)
    console.log("Loop user:", user)
    if (user) {
      console.log("User balances before:", user.balances)
      user.expenses.push(newExpense._id)
      //check if the user is the creator of the expense, otherwise update the balances
      console.log("User ID:", user._id)
      console.log("Expense ID:", newExpense._id)
      console.log("Created by:", newExpense.createdBy)
      if (String(user._id) !== String(newExpense.createdBy)) {
        
        console.log("Updating balances")
        if (!user.balances.get(String(payingUser?._id!))) {
          console.log("Creating new balance array")
          user.balances.set(String(payingUser?._id!), [])
          payingUser!.balances.set(String(user._id), [])
          console.log("User balances after:", user.balances)
        }
        user.balances.get(String(payingUser?._id!))!.push(newExpense._id)
        payingUser!.balances.get(String(user._id))!.push(newExpense._id)
      }
      console.log("User balances after:", user.balances)
      await user.save()
      await payingUser!.save()
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

    // Remove the expense from the group's expenses array
    const group = await Group.findById(expense.group)
    if (!group) {
      return res.status(404).json({ message: "Group not found" })
    }
    group.expenses = group.expenses.filter(
      (expenseId) => String(expenseId) !== expenseID
    )
    await group.save()

    // Remove the expense from each user's expenses array
    // Remove the expense from everyone's balances related to createdBy user
    const createdByUserId = expense.createdBy;
    await User.updateMany(
      { [`balances.${createdByUserId}`]: expenseID }, // Match balances pointing to createdBy
      { $pull: { [`balances.${createdByUserId}`]: expenseID } } // Remove the expense ID
    );

    // Iterate through allocatedToUserIds and remove the expense from the createdBy user's balances
    const balancePromises = expense.allocatedToUsers.map(async (friendId) => {
      return User.updateOne(
        { _id: createdByUserId }, // Match the createdBy user
        { $pull: { [`balances.${friendId}`]: expenseID } } // Remove the expense ID for the friend
      );
    });
    
    // Iterate through allocatedToUserIds and remove the expense from the createdBy user's balances
    const expensePromises = expense.allocatedToUsers.map(async (userId) => {
      return User.updateOne(
        { _id: userId }, // Match the createdBy user
        { $pull: { expenses: expenseID } } // Remove the expense ID for the friend
      );
    });

    // Execute all updates concurrently
    await Promise.all([...expensePromises, ...balancePromises]);
    console.log(`Successfully removed expense ${expenseID} from balances.`);
    

    return res.status(200).json({
      message: "Expense deleted successfully",
      expenseID: expense._id,
    })
  } catch (error) {
    console.error("Error deleting expense:", error)
    return res.status(500).json({ message: "Internal server error", error })
  }
}

const getExpensesBtwUsers = async (req: any, res: Response) => {
  const { userId2 } = req.params

  // Validate request body
  if (!userId2) {
    return res.status(400).json({
      message: "Invalid data. Please provide both user IDs.",
    })
  }

  // Find the user with the provided user ID
  const userId = (req as any).user.userId
  const currentUser = await User.findOne({ _id: userId })
  const user2 = await User.findById(userId2)

  if (!currentUser || !user2) {
    return res.status(404).json({
      message: "User not found",
    })
  }

  const expenseIds = Array.from(currentUser.balances.get(userId2) || [])

  // Get the expenses between the two users
  const expenses = await Expense.find({
      _id: { $in: expenseIds },
      $or: [
        { [`statusMap.${userId}`]: "Pending" }, // Check if status[userId] is "Pending"
        { [`statusMap.${userId2}`]: "Pending" } // Check if status[userId2] is "Pending"
      ]
    })
    .populate("createdBy")
    .populate("allocatedToUsers")

  // Calculate the total amount owed between the two users
  let totalAmountOwed = 0
  expenses.forEach((expense: IExpense) => {
    if (String((expense.createdBy as IUser)._id) === String(currentUser._id)) {
      totalAmountOwed -= expense.allocatedTo.get(userId2) || 0
    } else {
      totalAmountOwed += expense.allocatedTo.get(userId) || 0
    }
  })

  return res.status(200).json({
    message: "Expenses found",
    expenses,
    totalAmountOwed,
  })
}

const settleExpenses = async (req: any, res: Response) => {
  const { userId2 } = req.params

  // Validate request body
  if (!userId2) {
    return res.status(400).json({
      message: "Invalid data. Please provide both user IDs.",
    })
  }

  // Find the user with the provided user ID
  const userId = (req as any).user.userId
  const currentUser = await User.findOne({ _id: userId })
  const user2 = await User.findById(userId2)

  if (!currentUser || !user2) {
    return res.status(404).json({
      message: "User not found",
    })
  }

  const expenseIds = Array.from(currentUser.balances.get(userId2) || [])

  // Get the expenses between the two users
  const expenses = await Expense.find({
      _id: { $in: expenseIds },
      $or: [
        { [`statusMap.${userId}`]: "Pending" }, // Check if status[userId] is "Pending"
        { [`statusMap.${userId2}`]: "Pending" } // Check if status[userId2] is "Pending"
      ]
    })
    .populate("createdBy")
    .populate("allocatedToUsers")

  // Settle the expenses
  expenses.forEach(async (expense: IExpense) => {
    if (String((expense.createdBy as IUser)._id) === String(currentUser._id)) {
      expense.statusMap.set(userId2, "Settled")
    } else {
      expense.statusMap.set(userId, "Settled")
    }
    // Check if there are any pending statuses left
    let allSettled = true
    for (const [key, value] of expense.statusMap) {
      if (value === "Pending") {
        allSettled = false
        break
      }
    }
    // If all statuses are settled, set the expense status to "Settled"
    if (allSettled) {
      expense.status = "Settled"
    }
    await expense.save()
  })

  return res.status(200).json({
    message: "Expenses settled successfully",
    expenses,
    totalAmountOwed: 0,
  })
}

// Export the controller functions
export { createExpense, deleteExpense, getExpensesBtwUsers, settleExpenses }
