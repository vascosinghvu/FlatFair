import { Schema, model, Document } from 'mongoose';
import { Group, IGroup } from './Group';
import { Expense, IExpense } from './Expense';

// Define the IUser interface
interface IUser extends Document {
    auth0id: string;
    name: string;
    email: string;
    groups: (Schema.Types.ObjectId | IGroup)[];
    friends: (Schema.Types.ObjectId | IUser)[];
    balances: { [friend: string]: number };
    expenses: (Schema.Types.ObjectId | IExpense)[];
    addFriend: (friendId: string) => Promise<void>;
}

// Mongoose User Schema
const userSchema: Schema<IUser> = new Schema({
    auth0id: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    balances: { type: Map<String, Number>, default: {} },
    groups: [{ type: Schema.Types.ObjectId, ref: 'Group' }],
    friends: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    expenses: [{ type: Schema.Types.ObjectId, ref: 'Expense' }]
});

// Instance method to add a friend
userSchema.methods.addFriend = async function (friendId: Schema.Types.ObjectId): Promise<void> {
    this.friends.push(friendId);   // Modify the friends array
    await this.save();             // Save the updated user document
};

// Mongoose Model
const User = model<IUser>('User', userSchema);

//export User model and IUser interface
export { User };
export type { IUser };