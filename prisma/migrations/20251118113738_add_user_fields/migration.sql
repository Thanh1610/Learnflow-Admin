/*
  Warnings:

  - Added the required column `password` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('1', '2');

-- AlterTable
ALTER TABLE "User" 
ADD COLUMN     "address" TEXT,
ADD COLUMN     "avatar" TEXT,
ADD COLUMN     "gender" "Gender",
ADD COLUMN     "password" TEXT NOT NULL,
ADD COLUMN     "phone" TEXT;
