/*
  Warnings:

  - The `hints` column on the `problems` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[slug]` on the table `problems` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `problems` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "problems" ADD COLUMN     "slug" TEXT NOT NULL,
DROP COLUMN "hints",
ADD COLUMN     "hints" JSONB;

-- CreateIndex
CREATE UNIQUE INDEX "problems_slug_key" ON "problems"("slug");
