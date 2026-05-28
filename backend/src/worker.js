require("dotenv").config();
const { Worker } = require("bullmq");
const createRedisClient = require("./config/redis");
const createSupabaseClient = require("./config/supabase");
const createReceiptProcessor = require("./jobs/processReceipt");

const redisClient = createRedisClient();
const supabase = createSupabaseClient();

console.log("Background worker initialized. Waiting for jobs...");

const worker = new Worker(
    "receipt-queue",
    createReceiptProcessor({ supabase }),
    {
        connection: redisClient,
    },
);

worker.on("failed", (job, err) => {
    console.error(`[Job #${job.id}] Job permanently failed: ${err.message}`);
});
