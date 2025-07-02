import { db } from "../lib/db";
import { asyncHandler } from "../utils/asynHandler";
import { StatusCodes } from "../utils/constants/http_status_codes";

const createRoom = asyncHandler(async (req, res) => {
    const { name, code } = req.body;
    const isCodeExits = await db.gameRoom.findUnique({
        where: {
            roomCode: code
        }
    });
    if (isCodeExits) {
        res.status(StatusCodes.CONFLICT).json({
            status: StatusCodes.CONFLICT,
            message: "Code is already Exist, please try another room code."
        })
    }

    const room = await db.$transaction(async (tx) => {
        const gameRoom = await tx.gameRoom.create({
            data: {
                roomName: name,
                roomCode: code,
                status: "waiting",
                history: [],
            },
        });
        await tx.roomParticipation.create({
            data: {
                role: "PLAYER",
                roomId: gameRoom.id,
                userId: req.user.id,
            },
        });
        return gameRoom;
    });

    res.status(StatusCodes.CREATED).json({
        status: StatusCodes.CREATED,
        message: "Room created successfully.",
        data: {
            room
        }
    });
});

const joinRoom = asyncHandler(async (req, res) => {
    const { code } = req.body;
    if(!code) {
        return res.status(StatusCodes.BAD_REQUEST).json({
            status: StatusCodes.BAD_REQUEST,
            message: "Room code is required."
        });
    }

    const room = await db.gameRoom.findUnique({
        where: {
            roomCode: code
        }
    });
    if(!room) {
        return res.status(StatusCodes.NOT_FOUND).json({
            status: StatusCodes.NOT_FOUND,
            message: "Room not found."
        });
    }
    const isUserAlreadyInRoom = await db.roomParticipation.findFirst({
        where: {
            roomId: room.id,
            userId: req.user.id
        }
    });
    if (isUserAlreadyInRoom) {
        return res.status(StatusCodes.CONFLICT).json({
            status: StatusCodes.CONFLICT,
            message: "You are already in this room."
        });
    }

    await db.roomParticipation.create({
        data: {
            role: "PLAYER",
            roomId: room.id,
            userId: req.user.id,
        },
    });

    res.status(StatusCodes.OK).json({
        status: StatusCodes.OK,
        message: "Joined room successfully.",
        data: {
            room
        }
    });
});

const getRoomDetails = asyncHandler(async (req, res) => {
    const roomId = Number(req.query.roomId);
    if (!roomId) {
        return res.status(StatusCodes.BAD_REQUEST).json({
            status: StatusCodes.BAD_REQUEST,
            message: "Room ID is required."
        });
    }

    const room = await db.gameRoom.findUnique({
        where: {
            id: roomId
        },
        include: {
            participants: {
                include: {
                    user: true
                }
            }
        }
    });
    if (!room) {
        return res.status(StatusCodes.NOT_FOUND).json({
            status: StatusCodes.NOT_FOUND,
            message: "Room not found."
        });
    }

    res.status(StatusCodes.OK).json({
        status: StatusCodes.OK,
        message: "Room details fetched successfully.",
        data: {
            room
        }
    });
});

export { createRoom, joinRoom, getRoomDetails };