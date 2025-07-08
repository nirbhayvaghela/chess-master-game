import { db } from "../lib/db";
import { getMessagesFromRedis, populateRedisFromDB } from "../redis/Chat";
import { getGameDetails } from "../redis/ChessState";
import { asyncHandler } from "../utils/asynHandler";
import { StatusCodes } from "../utils/constants/http_status_codes";

const getMessagesForRoom = async (roomId: number): Promise<any[]> => {
  try {
    // Try Redis first
    const cachedMessages = await getMessagesFromRedis(roomId.toString());
    
    if (cachedMessages.length > 0) {
      console.log(`Retrieved ${cachedMessages.length} messages from Redis for room ${roomId}`);
      return cachedMessages;
    }

    // Fallback to database
    console.log(`Redis cache miss for room ${roomId}, fetching from database`);
    const dbMessages = await db.message.findMany({
      where: { roomId },
      orderBy: { createdAt: 'asc' },
      include: {
        sender: true,
      }
    });

    // Populate Redis cache for future requests
    if (dbMessages.length > 0) {
      await populateRedisFromDB(roomId, dbMessages);
    }

    return dbMessages;
  } catch (error) {
    console.error("Error fetching messages:", error);
    // Final fallback - return empty array
    return [];
  }
};

const createRoom = asyncHandler(async (req, res) => {
  const { name, code } = req.body;
  const user = req.user;
  const isCodeExits = await db.gameRoom.findUnique({
    where: {
      roomCode: code,
    },
  });
  if (isCodeExits) {
    res.status(StatusCodes.CONFLICT).json({
      status: StatusCodes.CONFLICT,
      message: "Code is already Exist, please try another room code.",
    });
  }

  const isPlayerInRoom = await db.user.findFirst({
    where: {
      id: user.id,
      inRoom: true,
    },
  });
  if (isPlayerInRoom) {
    return res.status(StatusCodes.CONFLICT).json({
      status: StatusCodes.CONFLICT,
      message: "You are in a Game room.",
    });
  }

  const gameRoom = await db.gameRoom.create({
    data: {
      roomName: name,
      roomCode: code,
      status: "waiting",
      player1Id: user.id,
      history: [],
    },
  });

  res.status(StatusCodes.CREATED).json({
    status: StatusCodes.CREATED,
    message: "Room created successfully.",
    data: {
      gameRoom,
    },
  });
});

const getRoomDetails = asyncHandler(async (req, res) => {
  const roomId = Number(req.query.roomId);
  if (!roomId) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      status: StatusCodes.BAD_REQUEST,
      message: "Room ID is required.",
    });
  }

  const room = await db.gameRoom.findUnique({
    where: {
      id: roomId,
    },
    include: {
      spectators: true,
      player1: true,
      player2: true,
      winner: true,
      loser: true,
    },
  });

  if (!room) {
    return res.status(StatusCodes.NOT_FOUND).json({
      status: StatusCodes.NOT_FOUND,
      message: "Room not found.",
    });
  }

  const { fen, history } = await getGameDetails(roomId.toString());

  // Get messages with Redis-first, DB-fallback strategy
  const messages = await getMessagesForRoom(roomId);

  res.status(StatusCodes.OK).json({
    status: StatusCodes.OK,
    message: "Room details fetched successfully.",
    data: {
      room: {
        ...room,
        fen,
        history,
        messages,
      },
    },
  });
});
export { createRoom, getRoomDetails };
