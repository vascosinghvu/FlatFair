import sgMail from "@sendgrid/mail";
//import { Twilio } from "twilio";

// SendGrid Setup
const sendgridApiKey = process.env.SENDGRID_API_KEY;
if (!sendgridApiKey) {
  throw new Error("SendGrid API key not defined");
}
sgMail.setApiKey(sendgridApiKey);

// Email Function
const sendSendgridEmail = async (
  email: string,
  subject: string,
  text: string,
  html: string
) => {
  const msg = {
    to: email,
    from: "notifications@flatfair.me",
    subject: subject,
    text: text,
    html: html,
  };

  console.log("Sending email with data:", msg);

  try {
    await sgMail.send(msg);
    console.log("sgMail.send(msg) successful");
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

export default sendSendgridEmail;
