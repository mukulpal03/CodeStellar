/*
  Warnings:

  - The `status` column on the `submissions` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `memory` column on the `submissions` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `time` column on the `submissions` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `memory` column on the `test_case_results` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `time` column on the `test_case_results` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `probelms_solved` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[slug]` on the table `problems` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "SubmissionStatus" AS ENUM ('PENDING', 'ACCEPTED', 'WRONG_ANSWER');

-- DropForeignKey
ALTER TABLE "probelms_solved" DROP CONSTRAINT "probelms_solved_problemId_fkey";

-- DropForeignKey
ALTER TABLE "probelms_solved" DROP CONSTRAINT "probelms_solved_userId_fkey";

-- AlterTable
ALTER TABLE "problems" ADD COLUMN     "slug" TEXT;

-- AlterTable
ALTER TABLE "submissions" DROP COLUMN "status",
ADD COLUMN     "status" "SubmissionStatus" NOT NULL DEFAULT 'PENDING',
DROP COLUMN "memory",
ADD COLUMN     "memory" INTEGER,
DROP COLUMN "time",
ADD COLUMN     "time" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "test_case_results" DROP COLUMN "memory",
ADD COLUMN     "memory" INTEGER,
DROP COLUMN "time",
ADD COLUMN     "time" DOUBLE PRECISION;

-- DropTable
DROP TABLE "probelms_solved";

-- CreateTable
CREATE TABLE "problems_solved" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "problemId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "problems_solved_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "problems_solved_userId_problemId_key" ON "problems_solved"("userId", "problemId");

-- CreateIndex
CREATE UNIQUE INDEX "problems_slug_key" ON "problems"("slug");

-- AddForeignKey
ALTER TABLE "problems_solved" ADD CONSTRAINT "problems_solved_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "problems_solved" ADD CONSTRAINT "problems_solved_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "problems"("id") ON DELETE CASCADE ON UPDATE CASCADE;
