import { Router } from "express";
import { generateKey, generateToken, verifyToken } from "authenticator";
import { prismaClient } from "@repo/db/prismaClient";
import jwt from "jsonwebtoken";
import { SUPERADMIN_JWT_PASSWORD } from "../../../config";
import { sendMessage } from "../../../utils/twilio";

const router: Router = Router();

router.post("/signin", async (req, res) => {
  const phoneNumber = req.body.phoneNumber;

  if (!phoneNumber) {
    res.status(400).json({ error: "phoneNumber is required" });
    return;
  }

  const admin = await prismaClient.admin.findUnique({
    where: {
      phoneNumber: phoneNumber,
    },
  });

  if (!admin) {
    res.status(404).json({ error: "Admin not found" });
    return;
  }

  // generate or reuse otpSecret
  const otpSecret = generateKey();

  await prismaClient.admin.update({
    where: {
      phoneNumber: phoneNumber,
    },
    data: { otpSecret },
  });

  let totp;
  if (process.env.NODE_ENV === "production") {
    totp = generateToken(admin.otpSecret!);
  } else {
    totp = "000000"; // fixed OTP for dev/test
  }

  if (process.env.NODE_ENV == "production") {
    // send OTP to admin using SMS gateway

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

  console.log({ phoneNumber, totp });

  if (!phoneNumber || !totp) {
    return res
      .status(400)
      .json({ message: "phoneNumber and totp are required" });
  }

  const admin = await prismaClient.admin.findUnique({
    where: { phoneNumber },
  });

  if (!admin || !admin.otpSecret) {
    res.status(400).json({ message: "Admin not found or OTP secret missing" });
    return;
  }

  let result;
  if (process.env.NODE_ENV === "production") {
    result = verifyToken(admin.otpSecret, totp);
  } else {
    result = totp === "000000"; // always allow fixed OTP
  }

  if (!result) {
    res.status(400).json({ message: "Invalid OTP" });
    return;
  }

  const updatedAdmin = await prismaClient.admin.update({
    where: { phoneNumber },
    data: { verified: true },
  });

  const token = jwt.sign(
    { adminId: updatedAdmin.id },
    SUPERADMIN_JWT_PASSWORD,
    {
      expiresIn: "7d",
    }
  );

  res.status(200).json({
    message: "Admin signed in successfully",
    token,
  });
});
export default router;
