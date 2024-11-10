import express, { Request, Response, Application } from "express"
import { User, IUser } from "../model/User"
import { Group, IGroup } from "../model/Group"
import { Expense, IExpense } from "../model/Expense"
import mongoose from "mongoose"
// import { defaultIconPrefixCls } from "antd/es/config-provider"

export const getGroup = async (req: Request, res: Response) => {
  const { groupID } = req.params

  // Validate request body
  if (!groupID) {
    return res.status(400).json({
      message: "Invalid data. Please provide group ID.",
    })
  }

  // Find the group with the provided groupID
  const group = await Group.findById(groupID)
    .populate("members")
    .populate({
      path: "expenses", // First, populate the 'expenses' field
      populate: {
        path: "createdBy", // Then, populate the 'createdBy' field inside 'expenses'
      },
    })

  if (!group) {
    return res.status(404).json({
      message: "Group not found",
    })
  }

  return res.status(200).json({
    message: "Group found",
    group,
  })
}
