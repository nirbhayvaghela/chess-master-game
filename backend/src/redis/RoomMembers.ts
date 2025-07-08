import redisClient from "./index";

export const addRoomMemberToRedis = async (
  roomId: number,
  userId: number,
  role: "player" | "spectator"
) => {
  try {
    // Add member to Redis set
    await redisClient.sAdd(
      `room:${roomId}:members`,
      JSON.stringify({ userId, role })
    );

    // Set expiration for the room members set
    await redisClient.expire(`room:${roomId}:members`, 2 * 60 * 60); // 2 hours

    console.log(`User ${userId} added to room ${roomId} as ${role}`);
  } catch (error) {
    console.error("Error adding room member to Redis:", error);
  }
};

export const leaveMemberFromRedis = async (
  roomId: number,
  userId: number
) => {
  try {
    // Remove member from Redis set
    await redisClient.sRem(
      `room:${roomId}:members`,
      JSON.stringify({ userId })
    );

    console.log(`User ${userId} removed from room ${roomId}`);
  } catch (error) {
    console.error("Error removing room member from Redis:", error);
  }
}

export const getRoomMembersFromRedis = async (roomId: number) => {
  try {
    // Get all members from Redis set
    const members = await redisClient.sMembers(`room:${roomId}:members`);

    return members.map((member) => JSON.parse(member));
  } catch (error) {
    console.error("Error getting room members from Redis:", error);
    return [];
  }
};

export const deleteRoomMembersFromRedis = async (roomId: number) => {
  try {
    // Delete the room members set from Redis
    await redisClient.del(`room:${roomId}:members`);
    console.log(`Room ${roomId} members deleted from Redis`);
  } catch (error) {
    console.error("Error deleting room members from Redis:", error);
  }
}

export const isUserInRedisRoom = async (roomId: number, userId: number) => {
  try {
    // Check if user is in the room members set
    const isMember = await redisClient.sIsMember(
      `room:${roomId}:members`,
      JSON.stringify({ userId })
    );
    return isMember;
  } catch (error) {
    console.error("Error checking if user is in room:", error);
    return false;
  }
}