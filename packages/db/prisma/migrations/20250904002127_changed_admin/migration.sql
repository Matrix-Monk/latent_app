/*
  Warnings:

  - Added the required column `adminType` to the `Admin` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."AdminType" AS ENUM ('SUPERADMIN', 'CREATOR');

-- AlterTable
ALTER TABLE "public"."Admin" ADD COLUMN     "adminType" "public"."AdminType" NOT NULL,
ALTER COLUMN "otpSecret" DROP NOT NULL;
