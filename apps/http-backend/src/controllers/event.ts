import { prismaClient } from "@repo/db/prismaClient";



export async function getEvent(eventId: string) {
    return await prismaClient.event.findUnique({
        where: { id: eventId }
    })
}