import sgMail from "@sendgrid/mail";
import { Twilio } from "twilio";

// SendGrid Setup
const sendgridApiKey = process.env.SENDGRID_API_KEY;
if (!sendgridApiKey) {
  throw new Error("SendGrid API key not defined");
}
sgMail.setApiKey(sendgridApiKey);

// Email Invite Function
const sendEmailInvite = async (
    email: string,
    inviteLink: string,
    groupName: string, 
    groupId: string) => {
  const msg = {
    to: email,
    from: "brandonchandler1116@gmail.com",
    subject: `You're invited to join ${groupName}`,
    text: `Click the link to join ${groupName} in FlatFair: ${inviteLink}`,
    html: `<strong>Please join our group using the following link: <a href="${inviteLink}">${inviteLink}</a></strong>`,
  };

  console.log("Sending email invite with data:", msg);
  
  try {
    await sgMail.send(msg);
    console.log("sgMail.send(msg) successful");
  } catch (error) {
    console.error("Error sending invite:", error);
    throw error;
  }
};

export default sendEmailInvite;
