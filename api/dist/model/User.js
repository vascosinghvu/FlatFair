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
exports.User = void 0;
const mongoose_1 = require("mongoose");
// Mongoose User Schema
const userSchema = new mongoose_1.Schema({
    auth0id: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    groups: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'Group' }],
    friends: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'User' }]
});
// Instance method to add a friend
userSchema.methods.addFriend = function (friendId) {
    return __awaiter(this, void 0, void 0, function* () {
        this.friends.push(friendId); // Modify the friends array
        yield this.save(); // Save the updated user document
    });
};
// Mongoose Model
const User = (0, mongoose_1.model)('User', userSchema);
exports.User = User;
