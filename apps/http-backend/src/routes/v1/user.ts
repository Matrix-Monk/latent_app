import { Router } from "express";
import {
  generateKey,
  generateToken,
  verifyToken,
} from "authenticator";
import { prismaClient } from "@repo/db/prismaClient";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../../config";
import { sendMessage } from "../../utils/twilio";

const router: Router = Router()



router.post('/signup', async (req, res) => {
  const phoneNumber = req.body.phoneNumber;

  if (!phoneNumber) {
    res.status(400).json({ error: "phoneNumber is required" });
    return;
  }

  // generate or reuse otpSecret
  const otpSecret = generateKey();

  const user = await prismaClient.user.upsert({
    where: {
      phoneNumber: phoneNumber,
    },
    create: {
      phoneNumber: phoneNumber,
      otpSecret: otpSecret,
    },
    update: { otpSecret },
  });
    
  
  const totp = generateToken(user.otpSecret);


  if (process.env.NODE_ENV == 'production') {
      // send OTP to user using SMS gateway

    const to = `+91${phoneNumber}`;  // for india only right now
    
      try {
          await sendMessage(
            to,
            `Your OTP for signup into latent app is ${totp}`
          );
      } catch (error) {
          res.status(500).json({ message: "Error sending OTP" , error});
          return;
      }
  }

  res.status(201).json({
    id: user.id,
    otp: totp,
  });
})

router.post("/signup/verify", async (req, res) => {
  const { phoneNumber, name, totp } = req.body;

  console.log({ phoneNumber, name, totp });

  if (!phoneNumber || !totp) {
    return res
      .status(400)
      .json({ message: "phoneNumber and totp are required" });
  }

  const user = await prismaClient.user.findUnique({
    where: { phoneNumber },
  });

  if (!user || !user.otpSecret) {
    return res
      .status(400)
      .json({ message: "User not found or OTP secret missing" });
  }

  const result = verifyToken(user.otpSecret, totp);

  if (!result) {
    return res.status(400).json({ message: "Invalid OTP" });
  }

  const updatedUser = await prismaClient.user.update({
    where: { phoneNumber },
    data: { name, verified: true },
  });

  const token = jwt.sign({ userId: updatedUser.id }, JWT_SECRET, {
    expiresIn: "7d",
  });

  return res.status(200).json({
    message: "User signed up successfully",
    token,
  });
});


export default router;