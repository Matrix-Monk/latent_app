import { Router } from "express";
import { generateKey, generateToken, verifyToken } from "authenticator";
import { prismaClient } from "@repo/db/prismaClient";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../../config";

const router: Router = Router()



router.post('/signup', async(req, res) => {
    const phoneNumber = req.body.phoneNumber;
    const name = req.body.name;

    const user = await prismaClient.user.upsert({
        where: {
            phoneNumber
        },
        create: {
            phoneNumber
        },
        update: {}
    })
    const totp = generateToken(phoneNumber + "SIGNUP");
    
    if (process.env.NODE_ENV == 'production') {
        // send OTP to user using SMS gateway
    }

    res.status(201).json({
        id: "user.id",
        otp: totp
    })
})

router.post("/signup/verify", async(req, res) => {
  const phoneNumber = req.body.phoneNumber;
  const name = req.body.name;
  const totp = req.body.totp;

  const result = verifyToken(totp, phoneNumber + "SIGNUP");

  console.log(result);

  if (!result) {
      res.status(400).json({ message: "Invalid OTP" });
      return;
  }
    
  const user = await prismaClient.user.update({
    where: {
      phoneNumber,
    },
    data: {
      name,
      verified: true,
    },
  });
    

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
      expiresIn: "7d",
    });



    res.status(200).json({
        message: "User signed up successfully",
        token,
   });
});

export default router;