import { Router } from "express";
import { prismaClient } from "@repo/db/prismaClient";
import {createEventSchema} from '@repo/common/types'
import { getEvent } from "../../../controllers/event";
import { userMiddleware } from "../../../middleware/user";

const router: Router = Router() 


router.get("/events", userMiddleware, async (req, res) => {
    const event = await prismaClient.event.findMany({
        where: {
            published: true,
            ended: false
      }
    });
    
    res.status(200).json({ event });
});


// router.get("/events", userMiddleware, async (req, res) => {
//     const locationId = req.query.locationId as string | undefined;

//     try {
//         let events;
//         if (locationId) {
//             events = await prismaClient.event.findMany({
//                 where: { locationId }
//             });
//         } else {
//             events = await prismaClient.event.findMany();
//         }
        
//         res.status(200).json({ events });
//     } catch (error) {
//         res.status(500).json({ message: "Error fetching events", error })
//     }       

// });