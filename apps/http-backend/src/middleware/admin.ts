import { RequestHandler } from "express";
import { ADMIN_JWT_PASSWORD, SUPERADMIN_JWT_PASSWORD } from "../config";
import { middleware } from ".";

export const adminMiddleware: RequestHandler = middleware(
  ADMIN_JWT_PASSWORD,
  SUPERADMIN_JWT_PASSWORD
);
