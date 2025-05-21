/*
  Warnings:

  - You are about to drop the column `slug` on the `problems` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "problems_slug_key";

-- AlterTable
ALTER TABLE "problems" DROP COLUMN "slug";
