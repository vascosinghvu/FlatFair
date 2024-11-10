// Description: This file contains the functions that will be called when the API receives a request to the specified endpoints.

import express, { Request, Response } from "express"
import { User, IUser } from "../model/User"
import { Group, IGroup } from "../model/Group"
import sendEmailInvite from '../config/sendgridInvite';

// Testing function to test endpoints
const test = async (req: Request, res: Response) => {
    console.log(req.body) // Log the request body to check what you are receiving
    
    // const { key } = req.body // Extract "key" from the request body
    // if (!key) {
    //     return res.status(400).json({ message: "No key provided" })
    // }
    
    return res.status(200).json({
        message: "Data received successfully",
        // receivedKey: key,
    })
}

// Function to create a group
const createGroup = async (req: any, res: Response) => {
    console.log("Creating group")
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
        const users = await User.find({ email: { $in: members } });
        console.log("Users found:", users);

        // If no valid users, return 404
        if (users.length === 0) {
            return res.status(404).json({
            message: "No valid users found with the provided emails"
            });
        }

        // Extract the ObjectIds of the found users
        const memberIds = users.map((user) => user._id);

        // Get the current user
        console.log("CURRENT USER: ", req.oidc.user)
        const curUserAuth0Id = req.oidc.user.sub;
        const currentUser = await User.findOne({ auth0id: curUserAuth0Id });
        const curUserId = currentUser?._id;

    // Create the new group document
    const newGroup = new Group({
        groupName,
        groupDescription,
        members: [curUserId, memberIds],  // Add the ObjectIds of the found users
        leader: curUserId,  // Assuming the first user is the leader
    });

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

        await newGroup.save();
        console.log('Group created successfully:', newGroup);

        // Add group to the user's groups using populate
        console.log("Pre-populate", newGroup)
        const groupMembers = await newGroup.populate("members");
        console.log("Post-populate", groupMembers)
        for (const member of groupMembers.members as IUser[]) {
            console.log("Member", member)
            member.groups.push(newGroup._id);
            member.save();
        }

        return res.status(200).json({
          message: "Group created successfully",
          group: {
            groupName,
            groupDescription,
            members,
          },
          groupId: newGroup._id,
        });
    }

    // Controller for creating user if necessary
    const createUser = async (req: any, res: Response) => {
        console.log("Checking login status")
        console.log(req.oidc.isAuthenticated() ? "Logged in" : "Logged out")

        //check if authenticated user has User in the database
        console.log(req.oidc.isAuthenticated())
        if (req.oidc.isAuthenticated()) {
            console.log("Authenticated")
            const user = await User.findOne({ auth0id: req.oidc.user.sub });
            console.log(user)
            console.log(!user)
            if (!user) {
                const newUser = new User({
                    auth0id: req.oidc.user.sub,
                    name: req.oidc.user.nickname,
                    email: req.oidc.user.email,
                    groups: [],
                    friends: [],
                    expenses: [],
                });
                newUser.save();
            }

        }
        res.redirect(process.env.REACT_APP_API_URL || 'http://localhost:3000');
    };

    // Controller for getting user profile
    const getProfile = (req: any, res: Response) => {
        console.log("Getting profile")
        res.json(req.oidc.user);  // Returns user information if logged in
    };

    // Controller for initiating Auth0 login
    const login = (req: Request, res: any) => {
        console.log("Initiating login")
        res.oidc.login();  // Initiates Auth0 login
    };

    // Controller for sending invites
    const sendInvite = async (req: Request, res: Response) => {
      console.log("sendInvite called");
      const { email, inviteLink, groupName, groupId } = req.body;

      // Validate request body
      if (!email || !inviteLink || !groupName || !groupId) {
        console.error("Invalid request body:", req.body);
        return res.status(400).json({ message: "Invalid request body", email, inviteLink, groupName, groupId });
      }

      await sendEmailInvite(email, inviteLink, groupName, groupId);

      try {
        await sendEmailInvite(email, inviteLink, groupName, groupId);
        res.status(200).json({ message: "Invite sent successfully" });
      } catch (error) {
        console.error("Error sending invite:", error);
        res.status(500).json({ message: "Failed to send invite" });
      }
    };

    const getUser = async (req: any, res: Response) => {
        try {
            if (!req.oidc.isAuthenticated()) {
                return res.status(401).json({ 
                    error: 'Not authenticated',
                    isAuthenticated: false 
                });
            }

            const auth0id = req.oidc.user.sub;
            const user = await User.findOne({ auth0id });
            
            if (!user) {
                return res.status(404).json({ 
                    error: 'User not found',
                    isAuthenticated: true 
                });
            }

            res.status(200).json({
                isAuthenticated: true,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    groups: user.groups
                }
            });
        } catch (error) {
            console.error('Error in getUser:', error);
            res.status(500).json({ 
                error: 'Internal server error',
                isAuthenticated: false 
            });
        }
    };

export default {
  test,
  createGroup,
  createUser,
  getProfile,
  login,
  sendInvite,
  getUser,
};