import express, { Request, Response, Application } from "express"
import { User, IUser } from "../model/User"
import { Group, IGroup } from "../model/Group"
import { Expense, IExpense } from "../model/Expense"
import mongoose from "mongoose"
import sendEmailInvite from "../config/sendgridInvite"
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
      path: "expenses",
      populate: [
        { path: "createdBy" }, // Populate the 'createdBy' field
        { path: "allocatedToUsers" }, // Populate the 'allocatedToUsers' field
      ],
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
  const { userId } = req.user
  const { groupName, groupDescription, members } = req.body // members are emails

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

  console.log("Received group data:", { groupName, groupDescription, members })

  const memberIds = []
  const emailPromises = [] // Array to hold email sending promises
  const dummyUsers = [] // Array to keep track of dummy users

  // Get the current user
  const currentUser = await User.findById(userId)
  const curUserId = currentUser?._id

  // Ensure current user's email is not in the members array
  const filteredMembers = members.filter(
    (email) => email !== currentUser?.email
  )

  for (const email of filteredMembers) {
    let user = await User.findOne({ email })

    if (!user) {
      // Create a dummy user
      user = new User({
        email,
        isDummy: true,
        groups: [],
        friends: [],
        expenses: [],
      })

      await user.save()
      console.log(`Created dummy user for email: ${email}`)

      // Add to dummyUsers array
      dummyUsers.push({ user, email })
    } else {
      console.log(`Found existing user for email: ${email}`)
    }

    memberIds.push(user._id)
  }

  // Ensure current user is in the members list
  if (!memberIds.includes(curUserId)) {
    memberIds.push(curUserId)
  }

  // Create the new group document
  const newGroup = new Group({
    groupName,
    groupDescription,
    members: memberIds,
    leader: curUserId,
  })

  await newGroup.save()
  console.log("Group created successfully:", newGroup)

  // Add group to the users' groups
  const groupMembers = await newGroup.populate("members")
  console.log("Populated group members:", groupMembers.members)

  for (const member of groupMembers.members as IUser[]) {
    console.log("Updating member:", member.email)
    if (!member.groups.includes(newGroup._id)) {
      member.groups.push(newGroup._id)
      await member.save()
    }
  }

  // Send email invites to dummy users
  for (const { user, email } of dummyUsers) {
    // Generate an invite link
    const inviteLink =
      "https://flat-fair-app-git-main-vasco-singhs-projects.vercel.app/"

    // Send an email invite
    emailPromises.push(
      sendEmailInvite(email, inviteLink, groupName, newGroup._id.toString())
    )
  }

  // Wait for all email invites to be sent
  await Promise.all(emailPromises)

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

export const addMember = async (req: Request, res: Response) => {
  const { groupID } = req.params
  const { email } = req.body

  if (!groupID || !email) {
    return res.status(400).json({
      message: "Invalid data. Please provide group ID and member email.",
    })
  }

  try {
    const group = await Group.findById(groupID)
    if (!group) {
      return res.status(404).json({ message: "Group not found" })
    }

    const user = await User.findOne({ email })
    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found with provided email" })
    }

    await group.addMember(user) // Use the addMember method

    return res.status(200).json({
      message: "Member added successfully",
      group,
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({
      message: "An error occurred while adding the member",
    })
  }
}

export const deleteMember = async (req: Request, res: Response) => {
  const { groupID } = req.params
  const { userID } = req.body

  if (!groupID || !userID) {
    return res
      .status(400)
      .json({ message: "Group ID and User ID are required" })
  }

  try {
    // Find the group by ID
    const group = await Group.findById(groupID)
    if (!group) {
      return res.status(404).json({ message: "Group not found" })
    }

    // Use the `removeMember` method to remove the user
    await group.removeMember(userID)

    // Optionally, remove the group from the user's list of groups
    const user = await User.findById(userID)
    if (user) {
      user.groups = user.groups.filter((group) => group.toString() !== groupID)
      await user.save()
    }

    return res.status(200).json({ message: "Member removed successfully" })
  } catch (error) {
    console.error("Error removing member:", error)
    return res
      .status(500)
      .json({ message: "An error occurred while removing the member" })
  }
}

export const deleteGroup = async (req: Request, res: Response) => {
  const { groupID } = req.params

  if (!groupID) {
    return res.status(400).json({ message: "Group ID is required" })
  }

  try {
    // Find the group by ID
    const group = await Group.findById(groupID)
    if (!group) {
      return res.status(404).json({ message: "Group not found" })
    }

    // Delete the group
    await group.delete()

    return res.status(200).json({ message: "Group deleted successfully" })
  } catch (error) {
    console.error("Error deleting group:", error)
    return res
      .status(500)
      .json({ message: "An error occurred while deleting the group" })
  }
}

// default export
export default {
  getGroup,
  getGroups,
  createGroup,
  addMember,
  deleteMember,
  deleteGroup,
}
