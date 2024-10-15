"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.Group = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const User_1 = require("./User"); // Import User interface
// Mongoose Group Schema
const groupSchema = new mongoose_1.Schema({
    // groupID: { type: String, default: uuid.v4 },
    groupName: { type: String, required: true },
    groupDescription: { type: String },
    members: [{ type: mongoose_1.Schema.Types.ObjectId, ref: User_1.User.modelName }], // List of User references
    expenses: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'Expense' }], // List of Expense references
    leader: { type: mongoose_1.Schema.Types.ObjectId, ref: User_1.User.modelName, required: true } // Leader of the group
});
// Method to add a member to the group
groupSchema.methods.addMember = function (user) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!this.members.includes(user._id)) {
            this.members.push(user._id); // Add user to the members array
            yield this.save(); // Persist changes
        }
    });
};
// Method to remove a member from the group by userID
groupSchema.methods.removeMember = function (userID) {
    return __awaiter(this, void 0, void 0, function* () {
        this.members = this.members.filter((member) => member._id !== userID);
        yield this.save(); // Persist changes
    });
};
// Method to notify members of a new expense
// NEEDS TO NOTIFY MEMBERS
groupSchema.methods.notifyNewExpense = function (expense) {
    return __awaiter(this, void 0, void 0, function* () {
        this.expenses.push(expense._id); // Add the new expense to the expenses array
        yield this.save(); // Persist changes
        // Here you would trigger any notification system if needed
    });
};
// // Method to view the total group balance
// groupSchema.methods.viewGroupBalance = async function (): Promise<number> {
//     let totalBalance = 0;
//     for (const expense of this.expenses) {
//         totalBalance += expense.amount;  // Assuming 'amount' is a field in IExpense
//     }
//     return totalBalance;
// };
// // Method to view settled and unsettled expenses
// groupSchema.methods.viewSettledAndUnsettledExpenses = async function (): Promise<{ settled: IExpense[], unsettled: IExpense[] }> {
//     const settled: IExpense[] = [];
//     const unsettled: IExpense[] = [];
//     for (const expense of this.expenses) {
//         if (expense.isSettled) {  // Assuming 'isSettled' is a field in IExpense
//             settled.push(expense);
//         } else {
//             unsettled.push(expense);
//         }
//     }
//     return { settled, unsettled };
// };
// Mongoose Group Model
const Group = mongoose_1.default.model('Group', groupSchema);
exports.Group = Group;
