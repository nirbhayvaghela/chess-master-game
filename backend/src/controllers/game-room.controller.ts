import { db } from "../lib/db";
import { asyncHandler } from "../utils/asynHandler";
import { StatusCodes } from "../utils/constants/http_status_codes";

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
      messages: true,
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

  res.status(StatusCodes.OK).json({
    status: StatusCodes.OK,
    message: "Room details fetched successfully.",
    data: {
      room,
    },
  });
});

export { createRoom, getRoomDetails };

// const joinRoom = asyncHandler(async (req, res) => {
//   const { code } = req.body;
//   const user = req.user;
//   if (!code) {
//     return res.status(StatusCodes.BAD_REQUEST).json({
//       status: StatusCodes.BAD_REQUEST,
//       message: "Room code is required.",
//     });
//   }

//   // Check if user is already in a room
//   const isPlayerInRoom = await db.user.findFirst({
//     where: {
//       id: user.id,
//       inRoom: true,
//     },
//   });
//   console.log(isPlayerInRoom);
//   if (isPlayerInRoom) {
//     return res.status(StatusCodes.CONFLICT).json({
//       status: StatusCodes.CONFLICT,
//       message: "You are already in a game room. Please leave the room first.",
//     });
//   }

//   const room = await db.gameRoom.findUnique({
//     where: {
//       roomCode: code,
//     },
//   });
//   if (!room) {
//     return res.status(StatusCodes.NOT_FOUND).json({
//       status: StatusCodes.NOT_FOUND,
//       message: "Room not found.",
//     });
//   }

//   // Join logic: either as player2 (if empty), or as spectator
//   const isRoomFull = room.player2Id !== null;
//   let updatedRoom;
//   if (!isRoomFull) {
//     updatedRoom = await db.gameRoom.update({
//       where: { id: room.id },
//       data: {
//         player2Id: user.id,
//         status: "in_progress", // or whatever status you use
//       },
//     });
//   } else {
//     // Join as spectator
//     await db.user.update({
//       where: { id: user.id },
//       data: {
//         spectatingRoom: {
//           connect: { id: room.id },
//         },
//         inRoom: true,
//       },
//     });

//     // refetch updated room (optional)
//     updatedRoom = await db.gameRoom.findUnique({
//       where: { id: room.id },
//     });
//   }

//   // Always set inRoom = true
//   await db.user.update({
//     where: { id: user.id },
//     data: {
//       inRoom: true,
//     },
//   });

//   res.status(StatusCodes.OK).json({
//     status: StatusCodes.OK,
//     message: "Joined room successfully.",
//     data: {
//       room: updatedRoom,
//     },
//   });
// });

// const leaveRoom = asyncHandler(async (req, res) => {
//   const user = req.user;
//   const roomId = Number(req.query.roomId);

//   if (!roomId) {
//     return res.status(StatusCodes.BAD_REQUEST).json({
//       status: StatusCodes.BAD_REQUEST,
//       message: "Room ID is required.",
//     });
//   }

//   const room = await db.gameRoom.findUnique({
//     where: {
//       id: roomId,
//     },
//   });
//   if (!room) {
//     return res.status(StatusCodes.NOT_FOUND).json({
//       status: StatusCodes.NOT_FOUND,
//       message: "Room not found.",
//     });
//   }

//   await db.$transaction(async (tx) => {
//     if (room.player1Id === user.id) {
//       const updatedRoom = await tx.gameRoom.update({
//         where: { id: room.id },
//         data: {
//           player1Id: null,
//           status: "aborted", // or whatever status you use
//           winnerId: null,
//           loserId: null,
//         },
//       });
//       await tx.user.update({
//         where: {
//           id: user.id,
//         },
//         data: {
//           inRoom: false,
//         },
//       });

//       return res.status(StatusCodes.OK).json({
//         status: StatusCodes.OK,
//         message: "Left room successfully. Game aborted.",
//         data: { room: updatedRoom },
//       });
//     } else if (room.player1Id === user.id || room.player2Id === user.id) {
//       const winnerId =
//         room.player1Id === user.id ? room.player2Id : room.player1Id;
//       const looserId =
//         room.player1Id === user.id ? room.player1Id : room.player2Id;

//       await tx.user.updateMany({
//         where: {
//           id: {
//             in: [room.player1Id!, room.player2Id!],
//           },
//         },
//         data: {
//           inRoom: false,
//         },
//       });

//       const updatedRoom = await tx.gameRoom.update({
//         where: { id: room.id },
//         data: {
//           player1Id: null,
//           player2Id: null,
//           winnerId: winnerId,
//           loserId: looserId,
//           status: "completed",
//         },
//       });

//       await tx.user.updateMany({
//         where: {
//           spectatingRoomId: room.id,
//         },
//         data: {
//           spectatingRoomId: null,
//         },
//       });

//       res.status(StatusCodes.OK).json({
//         status: StatusCodes.OK,
//         message: "Left room successfully. Game completed.",
//         data: { room: updatedRoom },
//       });
//     } else {
//       if (user.spectatingRoomId !== room.id) {
//         throw new Error("You are not a participant of this room.");
//       }

//       await tx.user.update({
//         where: { id: user.id },
//         data: {
//           spectatingRoomId: null,
//           inRoom: false,
//         },
//       });

//       res.status(StatusCodes.OK).json({
//         status: StatusCodes.OK,
//         message: "Left room successfully.",
//         data: { room },
//       });
//     }
//   });

//   return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
//     status: StatusCodes.INTERNAL_SERVER_ERROR,
//     message: "An error occurred while leaving the room.",
//   });
// });

// const removeSpectator = asyncHandler(async (req, res) => {
//   const { spectatorId, roomId } = req.body;
//   const user = req.user;
//   //   if (!spectatorId) {
//   //     return res.status(StatusCodes.BAD_REQUEST).json({
//   //       status: StatusCodes.BAD_REQUEST,
//   //       message: "Spectator ID is required.",
//   //     });
//   //   }

//   //   if (!roomId) {
//   //     return res.status(StatusCodes.BAD_REQUEST).json({
//   //       status: StatusCodes.BAD_REQUEST,
//   //       message: "Room ID is required.",
//   //     });
//   //   }

//   const room = await db.gameRoom.findUnique({
//     where: {
//       id: roomId,
//     },
//   });
//   if (!room) {
//     return res.status(StatusCodes.NOT_FOUND).json({
//       status: StatusCodes.NOT_FOUND,
//       message: "Room not found.",
//     });
//   }

//   if (room.player1Id !== user.id && room.player2Id !== user.id) {
//     return res.status(StatusCodes.FORBIDDEN).json({
//       status: StatusCodes.FORBIDDEN,
//       message: "You are not authorized to remove spectators from this room.",
//     });
//   }

//   const spectator = await db.user.findUnique({
//     where: {
//       id: spectatorId,
//     },
//   });
//   if (!spectator) {
//     return res.status(StatusCodes.NOT_FOUND).json({
//       status: StatusCodes.NOT_FOUND,
//       message: "Spectator not found.",
//     });
//   }

//   await db.user.update({
//     where: { id: user.id },
//     data: {
//       spectatingRoomId: null,
//       inRoom: false,
//     },
//   });

//   res.status(StatusCodes.OK).json({
//     status: StatusCodes.OK,
//     message: "Spectator removed successfully.",
//     data: { room },
//   });
// });

