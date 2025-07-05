import redisClient from ".";


const setMessageToRedis = async (roomId: number, message: string) => {
  try {
    await redisClient.rPush(`room:${roomId}:messages`, message);
  } catch (error) {
    console.error("Error setting message in Redis:", error);
  }
}

const getMessagesFromRedis = async (roomId: string): Promise<string[]> => {
  try {
    const messages = await redisClient.lRange(`room:${roomId}:messages`, 0, -1);
    return messages;
  } catch (error) {
    console.error("Error getting messages from Redis:", error);
    return [];
  }
}

export { setMessageToRedis, getMessagesFromRedis };