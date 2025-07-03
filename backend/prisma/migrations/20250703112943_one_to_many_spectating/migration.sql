/*
  Warnings:

  - You are about to drop the `_Spectating` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_Spectating" DROP CONSTRAINT "_Spectating_A_fkey";

-- DropForeignKey
ALTER TABLE "_Spectating" DROP CONSTRAINT "_Spectating_B_fkey";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "spectatingRoomId" INTEGER;

-- DropTable
DROP TABLE "_Spectating";

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_spectatingRoomId_fkey" FOREIGN KEY ("spectatingRoomId") REFERENCES "GameRoom"("id") ON DELETE SET NULL ON UPDATE CASCADE;
