const { Queue } = require("bullmq");

const createReceiptQueue = (redisClient) =>
    new Queue("receipt-queue", { connection: redisClient });

module.exports = createReceiptQueue;
