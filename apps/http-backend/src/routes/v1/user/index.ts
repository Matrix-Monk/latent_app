import { Router } from "express";
import { generateKey, generateToken, verifyToken } from "authenticator";
import { prismaClient } from "@repo/db/prismaClient";
import jwt from "jsonwebtoken";
import { JWT_PASSWORD } from "../../../config";
import { sendMessage } from "../../../utils/twilio";

const router: Router = Router();

router.post("/signup", async (req, res) => {
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

  let totp;
  if (process.env.NODE_ENV === "production") {
    totp = generateToken(user.otpSecret);
  } else {
    totp = "000000"; // fixed OTP for dev/test
  }

  if (process.env.NODE_ENV === "production") {
    // send OTP to user using SMS gateway

    const to = `+91${phoneNumber}`; // for india only right now

    try {
      await sendMessage(to, `Your OTP for signup into latent app is ${totp}`);
    } catch (error) {
      res.status(500).json({ message: "Error sending OTP", error });
      return;
    }
  }

  res.status(201).json({
    id: user.id,
    otp: totp,
  });
});

router.post("/signup/verify", async (req, res) => {
  const { phoneNumber, name, totp } = req.body;


  if (!phoneNumber || !totp) {
    res.status(400).json({ message: "phoneNumber and totp are required" });
    return;
  }

  const user = await prismaClient.user.findUnique({
    where: { phoneNumber },
  });

  if (!user || !user.otpSecret) {
    res.status(400).json({ message: "User not found or OTP secret missing" });
    return;
  }

   let result;
   if (process.env.NODE_ENV === "production") {
     result = verifyToken(user.otpSecret, totp);
   } else {
     result = totp === "000000"; // always allow fixed OTP
   }

  if (!result) {
    res.status(400).json({ message: "Invalid OTP" });
    return;
  }

  const updatedUser = await prismaClient.user.update({
    where: { phoneNumber },
    data: { name, verified: true },
  });

  const token = jwt.sign({ userId: updatedUser.id }, JWT_PASSWORD, {
    expiresIn: "7d",
  });

  res.status(200).json({
    message: "User signed up successfully",
    token,
  });
});

router.post("/signin", async (req, res) => {
  const phoneNumber = req.body.phoneNumber;

  if (!phoneNumber) {
    res.status(400).json({ error: "phoneNumber is required" });
    return;
  }

  const user = await prismaClient.user.findUnique({
    where: {
      phoneNumber: phoneNumber,
    },
  });

  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  // generate or reuse otpSecret
  const otpSecret = generateKey();

  await prismaClient.user.update({
    where: {
      phoneNumber: phoneNumber,
    },
    data: { otpSecret },
  });

   let totp;
   if (process.env.NODE_ENV === "production") {
     totp = generateToken(user.otpSecret);
   } else {
     totp = "000000"; // fixed OTP for dev/test
   }

  if (process.env.NODE_ENV == "production") {
    // send OTP to user using SMS gateway

    const to = `+91${phoneNumber}`; // for india only right now

    try {
      await sendMessage(to, `Your OTP for signin into latent app is ${totp}`);
    } catch (error) {
      res.status(500).json({ message: "Error sending OTP", error });
      return;
    }
  }

  res.status(200).json({
    message: "OTP sent successfully",
    otp: totp,
  });
});

router.post("/signin/verify", async (req, res) => {
  const { phoneNumber, totp } = req.body;


  if (!phoneNumber || !totp) {
    return res
      .status(400)
      .json({ message: "phoneNumber and totp are required" });
  }

  const user = await prismaClient.user.findUnique({
    where: { phoneNumber },
  });

  if (!user || !user.otpSecret) {
    res.status(400).json({ message: "User not found or OTP secret missing" });
    return;
  }

  let result;
  if (process.env.NODE_ENV === "production") {
    result = verifyToken(user.otpSecret, totp);
  } else {
    result = totp === "000000"; // always allow fixed OTP
  }

  if (!result) {
    res.status(400).json({ message: "Invalid OTP" });
    return;
  }

  const updatedUser = await prismaClient.user.update({
    where: { phoneNumber },
    data: { verified: true },
  });


  const token = jwt.sign({ userId: updatedUser.id }, JWT_PASSWORD, {
    expiresIn: "7d",
  });

  res.status(200).json({
    message: "User signed in successfully",
    token,
  });
});
export default router;
