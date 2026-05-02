-- CreateEnum
CREATE TYPE "AuthProvider" AS ENUM ('email', 'google');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "provider" "AuthProvider" NOT NULL DEFAULT 'email';
