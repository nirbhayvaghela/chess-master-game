// src/redis/client.js
import { createClient } from "redis";

const redis = createClient({
  url: process.env.REDIS_URL, // e.g., from Upstash
  // socket: {
  //   tls: true,
  //   host: process.env.REDIS_HOST,
  // },
});

redis.on("error", (err) => console.error("Redis Error:", err));

export async function connectRedis() {
  try {
    if (!redis.isOpen) {
      await redis.connect();
    }
    return redis;
  } catch (error) {
    console.error("Failed to connect to Redis:", error);
    throw error; // Re-throw to handle it in the calling code
  }
}


export default redis;