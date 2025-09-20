import { Router } from "express";
import { prismaClient } from "@repo/db/prismaClient";
import { userMiddleware } from "../../../middleware/user";

const router: Router = Router();


router.get('/', userMiddleware, async (req, res) => {
    const bookings = await prismaClient.booking.findMany({
        where: {
            userId: req.userId
        }
    })

    res.status(200).json({ bookings })
})

export default router;