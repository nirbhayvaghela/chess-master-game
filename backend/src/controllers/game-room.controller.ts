import { db } from "../lib/db";
import { asyncHandler } from "../utils/asynHandler";
import { StatusCodes } from "../utils/constants/http_status_codes";

const createRoom = asyncHandler(async (req, res) => {
    const { name, code } = req.body;
    const user = req.user;
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

    const isPlayerInRoom = await db.user.findFirst({
        where: {
            id: user.id,
            inRoom: true
        }
    });
    if (isPlayerInRoom) {
        return res.status(StatusCodes.CONFLICT).json({
            status: StatusCodes.CONFLICT,
            message: "You are in a Game room."
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
    // await tx.roomParticipation.create({
    //     data: {
    //         role: "PLAYER",
    //         roomId: gameRoom.id,
    //         userId: req.user.id,
    //     },
    // });

    res.status(StatusCodes.CREATED).json({
        status: StatusCodes.CREATED,
        message: "Room created successfully.",
        data: {
            gameRoom
        }
    });
});

const joinRoom = asyncHandler(async (req, res) => {
    const { code } = req.body;
    const user = req.user;
    if (!code) {
        return res.status(StatusCodes.BAD_REQUEST).json({
            status: StatusCodes.BAD_REQUEST,
            message: "Room code is required."
        });
    }

    // Check if user is already in a room
    const isPlayerInRoom = await db.user.findFirst({
        where: {
            id: user.id,
            inRoom: true
        }
    });
    if (isPlayerInRoom) {
        return res.status(StatusCodes.CONFLICT).json({
            status: StatusCodes.CONFLICT,
            message: "You are already in a game room. Please leave the room first."
        });
    }

    const room = await db.gameRoom.findUnique({
        where: {
            roomCode: code
        }
    });
    if (!room) {
        return res.status(StatusCodes.NOT_FOUND).json({
            status: StatusCodes.NOT_FOUND,
            message: "Room not found."
        });
    }

    // Join logic: either as player2 (if empty), or as spectator
    const isRoomFull = room.player2Id !== null;
    let updatedRoom;
    if (!isRoomFull) {
        updatedRoom = await db.gameRoom.update({
            where: { id: room.id },
            data: {
                player2Id: user.id,
                status: "in_progress", // or whatever status you use
            },
        });
    } else {
        // Join as spectator
        await db.user.update({
            where: { id: user.id },
            data: {
                spectatingRoom: {
                    connect: { id: room.id },
                },
                inRoom: true,
            },
        });

        // refetch updated room (optional)
        updatedRoom = await db.gameRoom.findUnique({
            where: { id: room.id },
        });
    }

    // Always set inRoom = true
    await db.user.update({
        where: { id: user.id },
        data: {
            inRoom: true,
        },
    });

    res.status(StatusCodes.OK).json({
        status: StatusCodes.OK,
        message: "Joined room successfully.",
        data: {
            room: updatedRoom,
        },
    });
});


const leaveRoom = asyncHandler(async (req, res) => {
    // room id,
    // !is player sepctaor--> 
    // is player --> result-win
    // game room stauts -- completed
    const user = req.user;
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
        }
    });
    if (!room) {
        return res.status(StatusCodes.NOT_FOUND).json({
            status: StatusCodes.NOT_FOUND,
            message: "Room not found."
        });
    }

    let updatedRoom;
    if(room.player1Id === user.id) {
        // If player1 leaves, set player2 as player1 and update status
         updatedRoom = await db.gameRoom.update({
            where: { id: room.id },
            data: {
                player1Id: null,
                player2Id: null,
                winnerId: room.player2Id,
                loserId: room.player1Id,
                status: "completed", // or whatever status you use
            },
        });

        // Update user inRoom status
        await db.user.update({
            where: { id: user.id },
            data: {
                inRoom: false,
            },
        });

        return res.status(StatusCodes.OK).json({
            status: StatusCodes.OK,
            message: "Left room successfully. Player 2 is now Player 1.",
            data: {
                room: updatedRoom,
            },
        });
    } else if(room.player2Id === user.id) {

    }

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

export { createRoom, joinRoom, getRoomDetails, leaveRoom };