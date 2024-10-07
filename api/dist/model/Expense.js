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
exports.Expense = void 0;
const mongoose_1 = __importStar(require("mongoose"));
// Mongoose Expense Schema
const expenseSchema = new mongoose_1.Schema({
    // expenseID: { type: String, required: true },
    amount: { type: Number, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    group: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Group', required: true }, // Reference to Group
    status: { type: String, required: true }, // e.g., 'pending', 'settled'
    receipt: { type: Buffer }, // File storage for the receipt (you can handle file uploads in your app)
    date: { type: Date, default: Date.now },
    createdBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to User
    allocatedTo: {
        type: Map,
        of: Number, // A map of User ObjectId and allocation amount
        required: true
    }
});
// Method to add a receipt to the expense
expenseSchema.methods.addReceipt = function (receipt) {
    return __awaiter(this, void 0, void 0, function* () {
        this.receipt = receipt;
        yield this.save();
    });
};
// Method to edit the amount and description of the expense
expenseSchema.methods.editExpense = function (newAmount, newDescription) {
    return __awaiter(this, void 0, void 0, function* () {
        this.amount = newAmount;
        this.description = newDescription;
        yield this.save();
    });
};
// Method to delete the expense
expenseSchema.methods.deleteExpense = function () {
    return __awaiter(this, void 0, void 0, function* () {
        yield this.remove(); // Removes the document from the database
    });
};
// Method to allocate portions of the expense to users
expenseSchema.methods.allocateExpense = function (portions) {
    return __awaiter(this, void 0, void 0, function* () {
        this.allocatedTo = portions; // Overwrite the existing allocations
        yield this.save();
    });
};
// Mongoose Expense Model
const Expense = mongoose_1.default.model('Expense', expenseSchema);
exports.Expense = Expense;
