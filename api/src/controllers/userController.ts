import express, { Request, Response, Application } from "express"
import { User, IUser } from "../model/User"
import { Group, IGroup } from "../model/Group"
import { Expense, IExpense } from "../model/Expense"
import mongoose from "mongoose"

// Get all of the groups for the current user
const getGroups = async (req: any, res: Response) => {
    // Get the current user
    // console.log("CURRENT USER: ", req.oidc.user)
    const curUserAuth0Id = req.oidc.user.sub;
    const currentUser = await User.findOne({ auth0id: curUserAuth0Id }).populate("groups");

    // Find all groups where the current user is a member using populate on groups array

    console.log("Groups found:", currentUser?.groups);
    const groups = currentUser?.groups;

    return res.status(200).json({ groups });
}

// Get the current user, with populated groups and expenses
const getUser = async (req: any, res: Response) => {
    // Get the current user
    // console.log("CURRENT USER: ", req.oidc.user)
    const curUserAuth0Id = req.oidc.user.sub;
    const currentUser = await User.findOne({ auth0id: curUserAuth0Id })
        .populate({
            path: 'groups', // First, populate the 'groups' field
            populate: {
                path: 'members', // Then, populate the 'members' field inside 'groups'
            },
        })
        .populate({
            path: 'expenses', // First, populate the 'expenses' field
            populate: {
                path: 'group', // Then, populate the 'group' field inside 'expenses'
            },
        });

    return res.status(200).json({ currentUser });
}

// Export the controller functions
export default { getGroups, getUser }