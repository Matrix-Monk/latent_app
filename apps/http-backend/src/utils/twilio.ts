import twilio from "twilio";
import dotenv from "dotenv";

dotenv.config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;


console.log("TWILIO_ACCOUNT_SID", accountSid);
console.log("TWILIO_AUTH_TOKEN", authToken);

const client = twilio(accountSid, authToken);


export async function sendMessage(to: string, body: string) {

 try {
   console.log("Sending message to.... ", to);

   const sms = await client.messages.create({
     body,
     to,
     from: "+19134049930",
   });

   console.log("Sent", to);
   console.log(sms);
 } catch (error) {
   console.error("Error sending message", error);
    throw new Error("Failed to send message");
 }
}