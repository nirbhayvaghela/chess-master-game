// import { db } from "../lib/db";
// import redisClient from "./index";

// export const addMoveToRedisGameHistory = async (roomId: string, move: string) => {
//   try {
//     if (!roomId || !move) {
//       throw new Error("Invalid roomId or move");
//     }

//     // Push move to the Redis list
//     await redisClient.rPush(`room:${roomId}:history`, move);
//   } catch (error) {
//     console.error("Error adding to game history:", error);
//     throw new Error("Failed to add move to game history");
//   }
// };

// export const getRedisGameHistory = async (roomId: string): Promise<string[]> => {
//   try {
//     if (!roomId) {
//       throw new Error("Invalid roomId");
//     }

//     const moveHistory = await redisClient.lRange(
//       `room:${roomId}:history`,
//       0,
//       -1
//     );
//     return moveHistory;
//   } catch (error) {
//     console.error("Error getting game history:", error);
//     throw new Error("Failed to fetch move history");
//   }
// };

// export const getGameHistory = async (roomId: string) => {
//     try {
//         const history = await getRedisGameHistory(roomId);

//         if(history) {
//             return history.map(move => JSON.parse(move));
//         } else {
//             console.log(`No history found for room ${roomId}`);
//         }

//         const dbGameHistory = await db.gameRoom.findUnique({
//             where: { id: Number(roomId) },
//             select: { history: true }
//         });
//         return dbGameHistory?.history || [];
//     } catch (error) {
//         console.error("Error fetching game history:", error);
//         throw new Error("Failed to fetch game history");
//     }
// }