const { Router } = require("express");
const createHealthController = require("../controllers/healthController");

const createHealthRouter = ({ redisClient, supabase }) => {
    const router = Router();
    const controller = createHealthController({ redisClient, supabase });

    router.get("/", controller.getHealth);

    return router;
};

module.exports = createHealthRouter;
