require("dotenv").config();
const app = require("./app");

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`RedisQ Gateway running on port ${PORT}`);
    console.log(`Health Check: http://localhost:${PORT}/api/health`);
    console.log(`Bull-board: http://localhost:${PORT}/admin/queues`);
});
