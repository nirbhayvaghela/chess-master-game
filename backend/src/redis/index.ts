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

// Ensure connection is established
async function connectRedis() {
  if (!redis.isOpen) {
    await redis.connect();
  }
  return redis;
}

// Expose a controlled API
const redisClient = {
  async connect() {
    await connectRedis();
  },
  async keys(pattern: string) {
    await connectRedis();
    return redis.keys(pattern);
  },
  async ttl(key: any) {
    await connectRedis();
    return redis.ttl(key);
  },
  async get(key: any) {
    await connectRedis();
    return redis.get(key);
  },
  async set(key: any, value: any, options = {}) {
    await connectRedis();
    return redis.set(key, value, options);
  },
  async rPush(key: any, ...values: any[]) {
    await connectRedis();
    return redis.rPush(key, [...values]);
  },
  async lLen(key: any) {
    await connectRedis();
    return redis.lLen(key);
  },
  async lTrim(key: any, start: number, end: number) {
    await connectRedis();
    return redis.lTrim(key, start, end);
  },
  async lRange(key: any, start: number, end: number) {
    await connectRedis();
    return redis.lRange(key, start, end);
  },
  async del(key: any) {
    await connectRedis();
    return redis.del(key);
  },
  async expire(key: any, seconds: number) {
    await connectRedis();
    return redis.expire(key, seconds);
  },
  async disconnect() {
    if (redis.isOpen) {
      await redis.quit();
    }
  },
};

export default redisClient;
