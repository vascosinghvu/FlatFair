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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const User_1 = require("../model/User");
const Group_1 = require("../model/Group");
const Expense_1 = require("../model/Expense");
const mongoose_1 = __importDefault(require("mongoose"));
// import { defaultIconPrefixCls } from "antd/es/config-provider"
const getGroup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { groupID } = req.params;
    // Validate request body
    if (!groupID) {
        return res.status(400).json({
            message: "Invalid data. Please provide group ID.",
        });
    }
    // Find the group with the provided groupID
    const group = yield Group_1.Group.findById(groupID)
        .populate("members")
        .populate({
        path: 'expenses', // First, populate the 'expenses' field
        populate: {
            path: 'createdBy', // Then, populate the 'createdBy' field inside 'expenses'
        },
    });
    if (!group) {
        return res.status(404).json({
            message: "Group not found",
        });
    }
    return res.status(200).json({
        message: "Group found",
        group,
    });
});
// Create new expense for a group
const createExpense = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { totalCost, item, groupID, date, memberBreakdown } = req.body;
    // Validate request body
    if (!totalCost ||
        !item ||
        !groupID ||
        !memberBreakdown) {
        return res.status(400).json({
            message: "Invalid data. Please provide total cost, item, group ID, date, createdBy, and member breakdown.",
        });
    }
    // Log the received data for debugging
    console.log("Received expense data:", { totalCost, item, groupID, date, memberBreakdown });
    // Find the group with the provided groupID
    // const groupIDObj = new mongoose.Types.ObjectId(groupID);
    const group = yield Group_1.Group.findById(groupID);
    if (!group) {
        return res.status(404).json({
            message: "Group not found",
        });
    }
    const currentUser = yield User_1.User.findOne({ auth0id: req.oidc.user.sub });
    // Create the allocatedTo Map object
    const allocatedTo = new Map();
    for (const { memberID, amountDue } of memberBreakdown) {
        const memberIDObj = new mongoose_1.default.Types.ObjectId(memberID);
        allocatedTo.set(memberIDObj, amountDue);
    }
    console.log("ALLOCATED TO:", allocatedTo);
    // Create the new expense document
    const newExpense = new Expense_1.Expense({
        amount: totalCost,
        description: item,
        group: groupID,
        createdBy: currentUser === null || currentUser === void 0 ? void 0 : currentUser._id,
        date: Date.parse(date),
        allocatedTo: allocatedTo,
    });
    // Save the new expense
    yield newExpense.save();
    // Add the expense to the group's expenses array
    group.expenses.push(newExpense._id);
    yield group.save();
    // Add the expense to each user's expenses array
    const payingUser = yield User_1.User.findById(newExpense.createdBy);
    for (const { memberID, amountDue } of memberBreakdown) {
        const user = yield User_1.User.findById(memberID);
        if (user) {
            user.expenses.push(newExpense._id);
            //check if the user is the creator of the expense, otherwise update the balances
            if (user._id !== newExpense.createdBy) {
                user.balances[String(payingUser === null || payingUser === void 0 ? void 0 : payingUser._id)] = (user.balances[String(newExpense.createdBy)] || 0) + amountDue;
            }
            yield user.save();
        }
    }
    return res.status(201).json({
        message: "Expense created successfully",
        expense: newExpense,
    });
});
// Export the controller functions
exports.default = { getGroup, createExpense };
