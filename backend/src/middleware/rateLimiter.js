const rateLimit = require("express-rate-limit");
const { RedisStore } = require("rate-limit-redis");

const createRateLimiter = (redisClient) =>
    rateLimit({
        windowMs: 10 * 1000, // 10 seconds
        max: 5,
        standardHeaders: true,
        legacyHeaders: false,
        store: new RedisStore({
            sendCommand: (...args) => redisClient.call(...args),
        }),
        message: { error: "Too many requests. Gateway shield activated." },
    });

module.exports = createRateLimiter;
