/*
  Warnings:

  - Made the column `skills` on table `Users` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `Users` MODIFY `skills` JSON NOT NULL;
