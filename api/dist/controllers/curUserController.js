"use strict";
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
// Get all of the groups for the current user
const getGroups = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Get the current user
    // console.log("CURRENT USER: ", req.oidc.user)
    const curUserAuth0Id = req.oidc.user.sub;
    const currentUser = yield User_1.User.findOne({ auth0id: curUserAuth0Id }).populate("groups");
    // Find all groups where the current user is a member using populate on groups array
    console.log("Groups found:", currentUser === null || currentUser === void 0 ? void 0 : currentUser.groups);
    const groups = currentUser === null || currentUser === void 0 ? void 0 : currentUser.groups;
    return res.status(200).json({ groups });
});
// Get the current user, with populated groups and expenses
const getUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Get the current user
    // console.log("CURRENT USER: ", req.oidc.user)
    const curUserAuth0Id = req.oidc.user.sub;
    const currentUser = yield User_1.User.findOne({ auth0id: curUserAuth0Id })
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
});
// Export the controller functions
exports.default = { getGroups, getUser };
