"use strict";
// Description: This file contains the functions that will be called when the API receives a request to the specified endpoints.
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const User_1 = require("../model/User");
const Group_1 = require("../model/Group");
// Testing function to test endpoints
const test = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(req.body); // Log the request body to check what you are receiving
    const { key } = req.body; // Extract "key" from the request body
    if (!key) {
        return res.status(400).json({ message: "No key provided" });
    }
    return res.status(200).json({
        message: "Data received successfully",
        receivedKey: key,
    });
});
// Function to create a group
const createGroup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { groupName, groupDescription, members } = req.body; //members are emails
    // Validate request body
    if (!groupName ||
        !groupDescription ||
        !Array.isArray(members) ||
        members.length === 0) {
        return res.status(400).json({
            message: "Invalid data. Please provide group name, description, and at least one member.",
        });
    }
    // Log the received data for debugging
    console.log("Received group data:", { groupName, groupDescription, members });
    // Use $in to find all users whose email is in the members array
    const users = yield User_1.User.find({ email: { $in: members } });
    console.log("Users found:", users);
    // If no valid users, return 404
    if (users.length === 0) {
        return res.status(404).json({
            message: "No valid users found with the provided emails"
        });
    }
    // Extract the ObjectIds of the found users
    const memberIds = users.map((user) => user._id);
    // Create the new group document
    const newGroup = new Group_1.Group({
        groupName,
        groupDescription,
        members: memberIds, // Add the ObjectIds of the found users
        leader: memberIds[0], // Assuming the first user is the leader
    });
    yield newGroup.save();
    console.log('Group created successfully:', newGroup);
    // Add group to the user's groups using populate
    console.log("Pre-populate", newGroup);
    const groupMembers = yield newGroup.populate("members");
    console.log("Post-populate", groupMembers);
    for (const member of groupMembers.members) {
        console.log("Member", member);
        console.log("Member groups", member.groups);
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
    });
});
exports.default = { test, createGroup };
