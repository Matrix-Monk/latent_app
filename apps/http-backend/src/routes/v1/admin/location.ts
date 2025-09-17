import { Router } from "express";
import { prismaClient } from "@repo/db/prismaClient";
import { adminMiddleware } from "../../../middleware/admin";
import { superAdminMiddleware } from "../../../middleware/superAdmin";
import { createLocationSchema } from "@repo/common/types";

const router: Router = Router();

router.post("/", superAdminMiddleware, async (req, res) => {
  const { data, success } = createLocationSchema.safeParse(req.body);

  if (!success) {
    res.status(400).json({ message: "Invalid request data", error: data });
    return;
  }

  try {
    const location = await prismaClient.location.create({
      data: {
        name: data.name,
        description: data.description,
        imageUrl: data.imageUrl,
      },
    });

    res.status(201).json({ id: location.id });
  } catch (error) {
    res.status(500).json({ message: "Error creating location", error });
  }
});


router.get("/locations", async (req, res) => {
    try {
        
        const locations = await prismaClient.location.findMany();
        res.status(200).json({ locations });
    } catch (error) {
        res.status(500).json({ message: "Error fetching locations", error })
    }
})


export default router;