const express = require("express");

const createRedisClient = require("./config/redis");
const createSupabaseClient = require("./config/supabase");
const createReceiptQueue = require("./queues/receiptQueue");
const createRateLimiter = require("./middleware/rateLimiter");

const createAdminRouter = require("./routes/adminRoutes");
const createHealthRouter = require("./routes/healthRoutes");
const createPaymentRouter = require("./routes/paymentRoutes");

const app = express();
app.set("trust proxy", 1);
app.use(express.json());

const redisClient = createRedisClient();
const supabase = createSupabaseClient();
const receiptQueue = createReceiptQueue(redisClient);

app.use("/admin/queues", createAdminRouter(receiptQueue));
app.use("/api/health", createHealthRouter({ redisClient, supabase }));

const apiLimiter = createRateLimiter(redisClient);
app.use("/api/webhooks", createPaymentRouter({ receiptQueue, apiLimiter }));

module.exports = app;
