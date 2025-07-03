/*
  Warnings:

  - The values [completed] on the enum `GameStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the `RoomParticipation` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "GameStatus_new" AS ENUM ('waiting', 'in_progress', 'win', 'lose', 'draw', 'stalemate');
ALTER TABLE "GameRoom" ALTER COLUMN "status" TYPE "GameStatus_new" USING ("status"::text::"GameStatus_new");
ALTER TYPE "GameStatus" RENAME TO "GameStatus_old";
ALTER TYPE "GameStatus_new" RENAME TO "GameStatus";
DROP TYPE "GameStatus_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "RoomParticipation" DROP CONSTRAINT "RoomParticipation_roomId_fkey";

-- DropForeignKey
ALTER TABLE "RoomParticipation" DROP CONSTRAINT "RoomParticipation_userId_fkey";

-- AlterTable
ALTER TABLE "GameRoom" ADD COLUMN     "loserId" INTEGER,
ADD COLUMN     "player1Id" INTEGER,
ADD COLUMN     "player2Id" INTEGER,
ADD COLUMN     "winnerId" INTEGER,
ALTER COLUMN "roomName" DROP NOT NULL,
ALTER COLUMN "history" DROP DEFAULT;

-- DropTable
DROP TABLE "RoomParticipation";

-- DropEnum
DROP TYPE "GameResult";

-- DropEnum
DROP TYPE "RoomRole";

-- CreateTable
CREATE TABLE "_Spectating" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_Spectating_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_Spectating_B_index" ON "_Spectating"("B");

-- AddForeignKey
ALTER TABLE "GameRoom" ADD CONSTRAINT "GameRoom_player1Id_fkey" FOREIGN KEY ("player1Id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameRoom" ADD CONSTRAINT "GameRoom_player2Id_fkey" FOREIGN KEY ("player2Id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameRoom" ADD CONSTRAINT "GameRoom_winnerId_fkey" FOREIGN KEY ("winnerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameRoom" ADD CONSTRAINT "GameRoom_loserId_fkey" FOREIGN KEY ("loserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Spectating" ADD CONSTRAINT "_Spectating_A_fkey" FOREIGN KEY ("A") REFERENCES "GameRoom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Spectating" ADD CONSTRAINT "_Spectating_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
