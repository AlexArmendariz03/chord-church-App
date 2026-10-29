-- CreateEnum
CREATE TYPE "ThemePreference" AS ENUM ('light', 'dark', 'system');

-- AlterTable
ALTER TABLE "User" ADD COLUMN "theme" "ThemePreference" NOT NULL DEFAULT 'system';
