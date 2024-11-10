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

// Get all of the groups for the current user
export const getGroups = async (req: any, res: Response) => {
  // Get the current user
  // console.log("CURRENT USER: ", req.oidc.user)
  const { id } = req.params // Extract user ID from URL
  const currentUser = await User.findOne({ auth0id: id }).populate("groups")

  // Find all groups where the current user is a member using populate on groups array

  console.log("Groups found:", currentUser?.groups)
  const groups = currentUser?.groups

  return res.status(200).json({ groups })
}

// Function to create a group
export const createGroup = async (req: any, res: Response) => {
  console.log("Creating group")
  const { id } = req.params // Extract user ID from URL
  const { groupName, groupDescription, members } = req.body //members are emails

  // Validate request body
  if (
    !groupName ||
    !groupDescription ||
    !Array.isArray(members) ||
    members.length === 0
  ) {
    return res.status(400).json({
      message:
        "Invalid data. Please provide group name, description, and at least one member.",
    })
  }

  // Log the received data for debugging
  console.log("Received group data:", { groupName, groupDescription, members })

  // Use $in to find all users whose email is in the members array
  const users = await User.find({ email: { $in: members } })
  console.log("Users found:", users)

  // If no valid users, return 404
  if (users.length === 0) {
    return res.status(404).json({
      message: "No valid users found with the provided emails",
    })
  }

  // Extract the ObjectIds of the found users
  const memberIds = users.map((user) => user._id)

  // Get the current user
  const currentUser = await User.findOne({ auth0id: id })
  const curUserId = currentUser?._id

  // Create the new group document
  const newGroup = new Group({
    groupName,
    groupDescription,
    members: [curUserId, memberIds], // Add the ObjectIds of the found users
    leader: curUserId, // Assuming the first user is the leader
  })

  console.log("New Group: ", newGroup)
  // // Create the new group document
  // console.log("MemberIds", memberIds)
  // const newGroup = new Group({
  //     groupName,
  //     groupDescription,
  //     members: [memberIds],  // Add the ObjectIds of the found users
  //     expenses: [],
  //     leader: memberIds[0],  // Assuming the first user is the leader
  // });

  await newGroup.save()
  console.log("Group created successfully:", newGroup)

  // Add group to the user's groups using populate
  console.log("Pre-populate", newGroup)
  const groupMembers = await newGroup.populate("members")
  console.log("Post-populate", groupMembers)
  for (const member of groupMembers.members as IUser[]) {
    console.log("Member", member)
    member.groups.push(newGroup._id)
    member.save()
  }

  return res.status(200).json({
    message: "Group created successfully",
    group: {
      groupName,
      groupDescription,
      members,
    },
    groupId: newGroup._id,
  })
}

// default export
export default {
  getGroup,
  getGroups,
  createGroup,
}
