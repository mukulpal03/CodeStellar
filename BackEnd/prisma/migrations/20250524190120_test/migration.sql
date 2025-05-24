/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `problems` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "problems" ADD COLUMN     "slug" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "problems_slug_key" ON "problems"("slug");
