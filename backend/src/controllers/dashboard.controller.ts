import { asyncHandler } from "../utils/asynHandler";
import { db } from "../lib/db";
import { GameStatus } from "@prisma/client";
import { StatusCodes } from "../utils/constants/http_status_codes";

const getDashboardDetails = asyncHandler(async (req, res) => {
  const user = req.user;

  const gamesPlayed = await db.gameRoom.count({
    where: {
      OR: [{ player1Id: user.id }, { player2Id: user.id }],
      status: GameStatus.completed,
    },
  });

  const gamesWon = await db.gameRoom.count({
    where: {
      OR: [{ player1Id: user.id }, { player2Id: user.id }],
      status: GameStatus.completed,
      winnerId: user.id,
    },
  });

  const gamesLoose = await db.gameRoom.count({
    where: {
      OR: [{ player1Id: user.id }, { player2Id: user.id }],
      status: GameStatus.completed,
      loserId: user.id,
    },
  });

  const lastMatch = await db.gameRoom.findFirst({
    where: {
      OR: [{ player1Id: user.id }, { player2Id: user.id }],
      status: GameStatus.completed,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      player1: { select: { email: true, id: true, username: true } },
      player2: { select: { email: true, id: true, username: true } },
    },
  });

  let lastMatchWith = "N/A";
  let lastMatchResults = "N/A";
  let playedAt = null;

  if (lastMatch) {
    lastMatchWith =
      lastMatch.player1Id === user.id
        ? lastMatch.player2?.username || "N/A"
        : lastMatch.player1?.username || "N/A";

    lastMatchResults =
      lastMatch.winnerId === user.id
        ? "Won"
        : lastMatch.loserId === user.id
        ? "Lost"
        : "Draw";

    playedAt = lastMatch.createdAt;
  }

  res.status(StatusCodes.OK).json({
    statusCode: StatusCodes.OK,
    success: true,
    message: "Dashboard details fetched successfully.",
    data: {
      gamesPlayed,
      gamesWon,
      gamesLoose,
      lastMatchWithDetails: {
        username: lastMatchWith,
        result: lastMatchResults,
        playedAt,
      },
    },
  });
});

export { getDashboardDetails };
