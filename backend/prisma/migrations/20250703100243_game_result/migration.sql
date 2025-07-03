/*
  Warnings:

  - The values [win,lose] on the enum `GameStatus` will be removed. If these variants are still used in the database, this will fail.
  - Made the column `roomName` on table `GameRoom` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "GameResult" AS ENUM ('win', 'lose', 'draw', 'stalemate');

-- AlterEnum
BEGIN;
CREATE TYPE "GameStatus_new" AS ENUM ('waiting', 'in_progress', 'completed', 'draw', 'stalemate');
ALTER TABLE "GameRoom" ALTER COLUMN "status" TYPE "GameStatus_new" USING ("status"::text::"GameStatus_new");
ALTER TYPE "GameStatus" RENAME TO "GameStatus_old";
ALTER TYPE "GameStatus_new" RENAME TO "GameStatus";
DROP TYPE "GameStatus_old";
COMMIT;

-- AlterTable
ALTER TABLE "GameRoom" ALTER COLUMN "roomName" SET NOT NULL,
ALTER COLUMN "history" SET DEFAULT '[]';

-- AlterTable
ALTER TABLE "RoomParticipation" ADD COLUMN     "result" "GameResult";
