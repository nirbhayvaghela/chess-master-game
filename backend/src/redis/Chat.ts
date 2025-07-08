import redisClient from ".";

const addMessageToRedis = async (roomId: number, messageData: any) => {
  try {
    await redisClient.rPush(`room:${roomId}:messages`, JSON.stringify(messageData), {
      EXP: 2 * 60 * 60 // Set expiration to 2 hours
    });
    await trimRedisMessages(roomId);
  } catch (error) {
    console.error("Error adding message to Redis:", error);
  }
};

const getMessagesFromRedis = async (roomId: string): Promise<any[]> => {
  try {
    const messages = await redisClient.lRange(`room:${roomId}:messages`, 0, -1);
    return messages.map(msg => {
      try {
        return JSON.parse(msg);
      } catch (parseError) {
        console.warn("Failed to parse Redis message:", msg);
        return null;
      }
    }).filter(Boolean); // Remove null values
  } catch (error) {
    console.error("Error getting messages from Redis:", error);
    return []; // Return empty array to trigger DB fallback
  }
};

// Populate Redis from database
const populateRedisFromDB = async (roomId: number, dbMessages: any[]) => {
  try {
    // Clear existing Redis data
    await redisClient.del(`room:${roomId}:messages`);

    // Add messages in order
    for (const msg of dbMessages) {
      await redisClient.rPush(`room:${roomId}:messages`, JSON.stringify({
        ...msg,
        timestamp: msg.createdAt
      }));
    }

    // Set expiration
    await redisClient.expire(`room:${roomId}:messages`, 2 * 60 * 60);
  } catch (error) {
    console.error("Error populating Redis from DB:", error);
  }
};

// Memory management
const trimRedisMessages = async (roomId: number) => {
  try {
    const messageCount = await redisClient.lLen(`room:${roomId}:messages`);
    if (messageCount > 150) { // Keep only last 50 messages in Redis
      await redisClient.lTrim(`room:${roomId}:messages`, -50, -1);
    }
  } catch (error) {
    console.error("Error trimming Redis messages:", error);
  }
};

// Optional: Clean up Redis for inactive rooms
const cleanupInactiveRooms = async () => {
  try {
    const pattern = "room:*:messages";
    const keys = await redisClient.keys(pattern);

    for (const key of keys) {
      const ttl = await redisClient.ttl(key);
      if (ttl < 0) { // No expiration set
        await redisClient.expire(key, 2 * 60 * 60);
      }
    }
  } catch (error) {
    console.error("Error cleaning up inactive rooms:", error);
  }
};

export { getMessagesFromRedis, addMessageToRedis, populateRedisFromDB, cleanupInactiveRooms };