const express = require("express");
const path = require("path");
const { createBullBoard } = require("@bull-board/api");
const { BullMQAdapter } = require("@bull-board/api/bullMQAdapter");
const { ExpressAdapter } = require("@bull-board/express");

const createAdminRouter = (receiptQueue) => {
    const serverAdapter = new ExpressAdapter();
    serverAdapter.setBasePath("/admin/queues");

    createBullBoard({
        queues: [new BullMQAdapter(receiptQueue)],
        serverAdapter: serverAdapter,
    });

    const uiPackagePath = require.resolve("@bull-board/ui/package.json");
    const uiDistPath = path.join(path.dirname(uiPackagePath), "dist");

    const router = serverAdapter.getRouter();
    router.use("/admin/queues/static", express.static(uiDistPath));

    return router;
};

module.exports = createAdminRouter;
