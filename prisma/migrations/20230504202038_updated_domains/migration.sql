/*
  Warnings:

  - The values [DESIGN,MARKETING] on the enum `Domains_name` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `Domains` MODIFY `name` ENUM('UIUX_DESIGN', 'DEVELOPMENT', 'GRAPHIC_DESIGN', 'WEBMARKETING', 'CYBERSECURITY', 'DATA', 'AUDIOVISUAL') NOT NULL;
