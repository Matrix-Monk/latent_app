import { prismaClient } from "@repo/db/prismaClient";
import jwt from "jsonwebtoken";
import { ADMIN_JWT_PASSWORD, SUPERADMIN_JWT_PASSWORD } from "../../config";

export async function createAdmin({
  phoneNumber,
  name,
  type,
}: {
  phoneNumber: string;
  name: string;
  type: "CREATOR" | "SUPERADMIN";
}): Promise<String> {
  const admin = await prismaClient.admin.create({
    data: {
      phoneNumber,
      name,
      verified: true, // directly mark as verified
      adminType: type,
    },
  });

  const token = jwt.sign(
    { adminId: admin.id },
    type === "CREATOR" ? ADMIN_JWT_PASSWORD : SUPERADMIN_JWT_PASSWORD,
    {
      expiresIn: "7d",
    }
  );

  return token;
}
