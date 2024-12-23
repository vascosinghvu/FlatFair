import { Schema, model, Document } from "mongoose"
import { Group, IGroup } from "./Group"
import { Expense, IExpense } from "./Expense"

// Define the IUser interface
interface IUser extends Document {
  name: string
  email: string
  groups: (Schema.Types.ObjectId | IGroup)[]
  friends: (Schema.Types.ObjectId | IUser)[]
  balances: Map<string, (Schema.Types.ObjectId | IExpense)[]> // Map of friend ID to expenses they share
  expenses: (Schema.Types.ObjectId | IExpense)[]
  addFriend: (friendId: string) => Promise<void>
  password: string
  isDummy: boolean
}

// Mongoose User Schema
// Updated Mongoose User Schema
const userSchema: Schema<IUser> = new Schema({
  name: { type: String, required: true }, // Changed to not required for dummy users
  email: { type: String, required: true, unique: true },
  balances: {
    type: Map,
    of: [{ type: Schema.Types.ObjectId, ref: "Expense" }],
    default: () => new Map(),
  },
  groups: [{ type: Schema.Types.ObjectId, ref: "Group" }],
  friends: [{ type: Schema.Types.ObjectId, ref: "User" }],
  expenses: [{ type: Schema.Types.ObjectId, ref: "Expense" }],
  password: { type: String, required: false }, // Changed to not required for dummy users
  isDummy: { type: Boolean, default: true }, // New field to indicate a dummy user
})

// Instance method to add a friend
userSchema.methods.addFriend = async function (
  friendId: Schema.Types.ObjectId
): Promise<void> {
  this.friends.push(friendId) // Modify the friends array
  await this.save() // Save the updated user document
}

// Mongoose Model
const User = model<IUser>("User", userSchema)

//export User model and IUser interface
export { User }
export type { IUser }
