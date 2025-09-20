import { Router } from "express";
import { prismaClient } from "@repo/db/prismaClient";
import { adminMiddleware } from "../../../middleware/admin";
import {
  createEventSchema,
  UpdateEventSchema,
  UpdateSeatSchema,
} from "@repo/common/types";
import { getEvent } from "../../../controllers/event";

const router: Router = Router();

router.post("/", adminMiddleware, async (req, res) => {
  const { data, success } = createEventSchema.safeParse(req.body);
  const adminId = req.userId;

  console.log(data, success, adminId);

  if (!success) {
    res.status(400).json({ message: "Invalid request data", error: data });
    return;
  }

  if (!adminId) {
    res.status(401).json({ message: "Unauthorized: adminId missing" });
    return;
  }

  try {
    const event = await prismaClient.event.create({
      data: {
        name: data.name,
        description: data.description,
        startTime: new Date(data.startTime),
        imageUrl: data.imageUrl,
        locationId: data.locationId,
        AdminId: adminId,
        seatTypes: {
          create: data.seats.map((seat) => ({
            name: seat.name,
            description: seat.description,
            price: seat.price,
            totalSeats: seat.totalSeats,
          })),
        },
      },
    });

    res.status(201).json({ id: event.id });
  } catch (error) {
    res.status(500).json({ message: "Error creating event", error });
  }
});

router.put("/metadata/:eventId", adminMiddleware, async (req, res) => {
  const eventId = req.params.eventId;
  const adminId = req.userId;

  const { data, success } = UpdateEventSchema.safeParse(req.body);

  if (!success) {
    res.status(400).json({ message: "Invalid request data", error: data });
    return;
  }

  if (!adminId) {
    res.status(401).json({ message: "Unauthorized: adminId missing" });
    return;
  }

  if (!eventId) {
    res.status(400).json({ message: "eventId is required" });
    return;
  }

  try {
    const event = await prismaClient.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      res.status(404).json({ message: "Event not found" });
      return;
    }
      
    if(event.AdminId !== adminId || event.startTime > new Date()) {
        res.status(403).json({ message: "Can't update event" });
        return;
    } 

    await prismaClient.event.update({
      where: { id: eventId },
      data: {
        name: data.name,
        description: data.description,
        startTime: data.startTime,
        imageUrl: data.imageUrl,
        locationId: data.locationId,
        AdminId: adminId,
        published: data.published,
        ended: data.ended,
      },
    });

    res.status(200).json({ id: event.id });
  } catch (error) {
    res.status(500).json({ message: "Error updating event", error });
  }
});

router.get("/", adminMiddleware, async (req, res) => {
  const events = await prismaClient.event.findMany({
    where: { AdminId: req.adminId },
  });

  res.status(200).json({ events });
});

router.get("/:eventId", adminMiddleware, async (req, res) => {
  const eventId = req.params.eventId;

  if (!eventId) {
    res.status(400).json({ message: "eventId is required" });
    return;
  }
  const event = await getEvent(eventId);

  if (!event) {
    res.status(400).json({ message: "event not found" });
    return;
  }

  res.status(200).json({ event });
});

router.put("seats/:eventId", adminMiddleware, async (req, res) => {
  const { data, success } = UpdateSeatSchema.safeParse(req.body);

  const adminId = req.userId;

  if (!adminId) {
    res.status(401).json({ message: "Unauthorized: adminId missing" });
    return;
  }

  const eventId = req.params.eventId;

  if (!eventId) {
    res.status(400).json({ message: "seatId is required" });
    return;
  }

  if (!success) {
    res.status(400).json({ message: "Invalid request data", error: data });
    return;
  }

  const event = await prismaClient.event.findUnique({
    where: {
      id: eventId,
      AdminId: adminId,
    },
  });

  if (!event || event.startTime > new Date() || event.AdminId !== adminId) {
    res.status(404).json({
      message: "Event not found or already started",
    });
    return;
  }
  try {
    const currentSeats = await prismaClient.seatType.findMany({
      where: {eventId}
    });

    const newSeats = data.seats.filter((x) => !x.id);
    const updatedSeats = data.seats.filter(
      (x) =>
        x.id &&
        currentSeats.find((y: { id: string | undefined }) => y.id === x.id)
    );
    const deletedSeats = currentSeats.filter(
      (x: { id: string | undefined }) => !data.seats.find((y) => y.id === x.id)
    );


    await prismaClient.$transaction([
      prismaClient.seatType.deleteMany({
        where: {
          id: {
            in: deletedSeats.map((x: { id: any }) => x.id),
          },
        },
      }),
      prismaClient.seatType.createMany({
        data: newSeats
          .filter(
            (x) =>
              x.name !== undefined &&
              x.description !== undefined &&
              x.price !== undefined &&
              x.totalSeats !== undefined
          )
          .map((x) => ({
            name: x.name!,
            description: x.description!,
            price: x.price!,
            totalSeats: x.totalSeats!,
            eventId,
          })),
      }),
      ...updatedSeats.map((x) =>
        prismaClient.seatType.update({
          where: {
            id: x.id,
          },
          data: {
            name: x.name,
            description: x.description,
            price: x.price,
            totalSeats: x.totalSeats,
          },
        })
      ),
    ]);

  } catch (error) {
    res.status(500).json({
      message: "Could not update seats",
    });
    return;
  }
  
  res.json({
    message: "Seats updated",
  });
});


export default router;
