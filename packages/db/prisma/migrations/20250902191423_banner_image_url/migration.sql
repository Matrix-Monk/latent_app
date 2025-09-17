/*
  Warnings:

  - You are about to drop the column `banner` on the `Event` table. All the data in the column will be lost.
  - Added the required column `imageUrl` to the `Event` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Event" DROP COLUMN "banner",
ADD COLUMN     "imageUrl" TEXT NOT NULL;
