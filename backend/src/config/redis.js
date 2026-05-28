const Redis = require("ioredis");

const createRedisClient = () => {
    const redisUrl = process.env.REDIS_URL || process.env.REDIS_TLS_URL;
    if (redisUrl) {
        return new Redis(redisUrl, {
            maxRetriesPerRequest: null, // Required by BullMQ
        });
    }

    return new Redis({
        host: process.env.REDIS_HOST || "127.0.0.1",
        port: process.env.REDIS_PORT || 6379,
        maxRetriesPerRequest: null, // Required by BullMQ
    });
};

module.exports = createRedisClient;
