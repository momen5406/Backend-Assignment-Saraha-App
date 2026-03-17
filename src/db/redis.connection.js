import { createClient } from "redis";
import { REDIS_URL } from "../../config/config.service.js";

export const redisClient = createClient({
  url: REDIS_URL,
});

export function redisConnect() {
  redisClient
    .connect()
    .then(() => {
      console.log("Redis connected successfully.");
    })
    .catch((error) => {
      console.log("Redis failed to connect: ", error);
    });
}
