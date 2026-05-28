const getHealthStatus = async ({ redisClient, supabase }) => {
    const redisPing = await redisClient.ping();
    const { error } = await supabase.from("transactions").select("id").limit(1);

    return {
        gateway_status: "Online",
        redis_connection: redisPing === "PONG" ? "Healthy" : "Failing",
        supabase_connection: error
            ? `Connected, but warning: ${error.message}`
            : "Healthy",
    };
};

module.exports = { getHealthStatus };
