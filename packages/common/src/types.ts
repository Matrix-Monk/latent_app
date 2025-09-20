import { z } from "zod";


export const createEventSchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().min(10).max(500),
  startTime: z.string(),
  imageUrl: z.string(),
  locationId: z.string().min(5).max(200),
  seats: z.array(
    z.object({
      name: z.string(),
      description: z.string(),
      price: z.number(),
      totalSeats: z.number(),
    })
  ),
});

export const UpdateEventSchema = z.object({
  name: z.string().min(3).max(100).optional(),
  description: z.string().min(10).max(500).optional(),
  startTime: z.string().optional(),
  imageUrl: z.string().optional(),
  locationId: z.string().min(5).max(200).optional(),
  published: z.boolean().optional(),
  ended: z.boolean().optional(),
});

export const createLocationSchema = z.object({
    name: z.string().min(3).max(100),
    description: z.string().min(10).max(500),
    imageUrl: z.string(),
});

export const UpdateSeatSchema = z.object({
  seats: z.array(
    z.object({
      id: z.string().optional(), 
      name: z.string().min(3).max(100).optional(),
      description: z.string().min(10).max(500).optional(),
      price: z.number().optional(),
      totalSeats: z.number().optional(),
    })
  ),
});



// export const createSeatsSchema = z.object({
//     name: z.string().min(3).max(100),
//     description: z.string().min(10).max(500),
//     price: z.number(),
//     totalSeats: z.number(),
// })