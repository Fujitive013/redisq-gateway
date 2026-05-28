const { getHealthStatus } = require("../services/healthService");

const createHealthController = ({ redisClient, supabase }) => ({
    getHealth: async (req, res) => {
        try {
            const status = await getHealthStatus({ redisClient, supabase });
            res.status(200).json(status);
        } catch (error) {
            res.status(500).json({ status: "Offline", error: error.message });
        }
    },
});

module.exports = createHealthController;
