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
const mail_1 = __importDefault(require("@sendgrid/mail"));
// SendGrid Setup
const sendgridApiKey = process.env.SENDGRID_API_KEY;
if (!sendgridApiKey) {
    throw new Error("SendGrid API key not defined");
}
mail_1.default.setApiKey(sendgridApiKey);
// Email Invite Function
const sendEmailInvite = (email, inviteLink, groupName, groupId) => __awaiter(void 0, void 0, void 0, function* () {
    const msg = {
        to: email,
        from: "brandonchandler1116@gmail.com",
        subject: `You're invited to join ${groupName}`,
        text: `Click the link to join ${groupName} in FlatFair: ${inviteLink}`,
        html: `<strong>Please join our group using the following link: <a href="${inviteLink}">${inviteLink}</a></strong>`,
    };
    console.log("Sending email invite with data:", msg);
    try {
        yield mail_1.default.send(msg);
        console.log("sgMail.send(msg) successful");
    }
    catch (error) {
        console.error("Error sending invite:", error);
        throw error;
    }
});
exports.default = sendEmailInvite;
