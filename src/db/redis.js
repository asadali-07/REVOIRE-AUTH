import {Redis} from 'ioredis';
import {config} from 'dotenv';
config();

const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD,
});

redis.on("connect", () => {
  console.log("Redis connected successfully!");
});

redis.on("error", (err) => {
  console.error("Redis connection error:", err);
});

export default redis;