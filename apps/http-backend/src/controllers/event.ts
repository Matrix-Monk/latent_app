import { prismaClient } from "@repo/db/prismaClient";



export async function getEvent(eventId: string, adminid? : string) {
    
    if (adminid) {
        return await prismaClient.event.findUnique({
            where: { id: eventId, AdminId: adminid },
            include: {
                seatTypes: true,
            }
        })
    }
    
    return await prismaClient.event.findUnique({
      where: { id: eventId },
      include: {
        seatTypes: true,
      },
    });
}